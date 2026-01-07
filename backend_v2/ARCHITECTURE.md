# Backend v2: The Aggregation Engine

## Objetivo
Reemplazar el backend actual con una arquitectura Serverless y Orientada a Eventos, donde:
- **Apify** descarga datos reales de Instagram/TikTok.
- **Gemini 1.5 Flash** clasifica cada comentario individualmente.
- **Python** agrega matemáticamente los resultados.
- **Supabase** persiste la "verdad" auditable.

---

## Stack Tecnológico

| Componente | Tecnología | Reemplaza a |
|------------|------------|-------------|
| Compute | Railway (FastAPI) | Docker + Orchestrator |
| Database | Supabase (Postgres) | Postgres Local |
| Auth | Supabase Auth | security.py / JWT manual |
| Ingesta | `apify-client` (Python) | Archivos Excel manuales |
| IA Engine | Gemini 1.5 Flash | Gemini Pro 1.0 / RAG |

---

## Estructura de Carpetas

```
backend_v2/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI entry point
│   ├── config.py             # Environment variables
│   ├── dependencies.py       # Supabase client factory
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── pipeline.py       # POST /pipeline/start, GET /pipeline/status
│   │   ├── clients.py        # CRUD /clients
│   │   └── analysis.py       # GET /analysis/{client_id}
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── apify_service.py  # Apify scraping logic
│   │   ├── gemini_service.py # Gemini classification logic
│   │   └── aggregator.py     # Math aggregation (Q1-Q10 builder)
│   │
│   └── models/
│       ├── __init__.py
│       └── schemas.py        # Pydantic models
│
├── requirements.txt
├── Procfile                  # Railway entrypoint
├── .env.example
└── ARCHITECTURE.md           # This file
```

---

## Supabase Schema (SQL)

```sql
-- Organizaciones (Agencias)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes (Marcas)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  brand_name TEXT NOT NULL,
  industry TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reportes de Análisis (Padre)
CREATE TABLE analysis_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PROCESSING', -- 'COMPLETED', 'ERROR'
  frontend_compatible_json JSONB,   -- JSON Q1-Q10 listo para frontend
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Items Crudos (La "Verdad")
CREATE TABLE raw_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  platform TEXT,               -- 'instagram', 'tiktok'
  platform_id TEXT,            -- ID original de la plataforma
  content TEXT,                -- Texto del comentario
  author TEXT,                 -- Usuario que comentó
  posted_at TIMESTAMPTZ,       -- Fecha real del comentario
  
  -- Clasificaciones de Gemini
  ai_emotion TEXT,             -- 'Alegría', 'Ira', etc.
  ai_personality TEXT,         -- 'Sinceridad', 'Emocion', etc.
  ai_topic TEXT,               -- 'Precio', 'Calidad', etc.
  ai_sentiment_score FLOAT,    -- -1.0 a 1.0
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para agregación rápida
CREATE INDEX idx_raw_items_report ON raw_items(report_id);
CREATE INDEX idx_raw_items_emotion ON raw_items(ai_emotion);
CREATE INDEX idx_raw_items_topic ON raw_items(ai_topic);
```

---

## Apify Integration

### Librería: `apify-client`
```bash
pip install apify-client
```

### Código de Referencia (de `apify-client-python`)

```python
from apify_client import ApifyClientAsync

async def scrape_instagram(profile_url: str) -> list[dict]:
    """
    Ejecuta el Actor de Instagram y retorna los comentarios.
    
    Actor recomendado: apify/instagram-comment-scraper
    Docs: https://apify.com/apify/instagram-comment-scraper
    """
    client = ApifyClientAsync(token=os.getenv("APIFY_TOKEN"))
    
    # Ejecutar Actor y esperar a que termine
    run = await client.actor("apify/instagram-comment-scraper").call(
        run_input={
            "directUrls": [profile_url],
            "resultsLimit": 1000,
        },
        wait_secs=300  # Max 5 minutos
    )
    
    # Obtener dataset con resultados
    dataset_id = run["defaultDatasetId"]
    items = await client.dataset(dataset_id).list_items(clean=True)
    
    return items.items  # Lista de comentarios
```

### Estructura de Respuesta del Actor (Ejemplo)
```json
{
  "id": "17843...",
  "text": "Me encanta este producto!",
  "ownerUsername": "fan123",
  "timestamp": "2024-01-15T10:30:00Z",
  "likesCount": 42
}
```

---

## Gemini Classification

### Prompt para Batch Classification

```python
CLASSIFICATION_PROMPT = """
Eres un clasificador de comentarios de redes sociales. 
Tu trabajo es ETIQUETAR cada comentario con:

1. **emotion**: Una emoción de Plutchik:
   Alegría, Confianza, Miedo, Sorpresa, Tristeza, Aversión, Ira, Anticipación

2. **personality**: Rasgo de personalidad proyectado (Aaker):
   Sinceridad, Emocion, Competencia, Sofisticacion, Robustez

3. **topic**: Tema principal:
   Precio, Calidad, Servicio, Diseño, Usabilidad, Entrega, Soporte, Otro

4. **sentiment_score**: Número de -1.0 (muy negativo) a 1.0 (muy positivo)

Devuelve un JSON Array estricto. Ejemplo:
[
  {"idx": 0, "emotion": "Alegría", "personality": "Sinceridad", "topic": "Calidad", "sentiment_score": 0.8},
  {"idx": 1, "emotion": "Ira", "personality": "Competencia", "topic": "Precio", "sentiment_score": -0.6}
]

COMENTARIOS A CLASIFICAR:
{comments_json}
"""
```

### Código de Clasificación

```python
import google.generativeai as genai

async def classify_batch(comments: list[str]) -> list[dict]:
    """Clasifica un lote de comentarios (max 50 por llamada)."""
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = CLASSIFICATION_PROMPT.format(
        comments_json=json.dumps([{"idx": i, "text": c} for i, c in enumerate(comments)])
    )
    
    response = await model.generate_content_async(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return json.loads(response.text)
```

---

## Aggregation Logic

### Q1: Emociones (Plutchik)
```python
def aggregate_q1(raw_items: list[dict]) -> dict:
    """Calcula distribución de emociones."""
    emotions = ["Alegría", "Confianza", "Miedo", "Sorpresa", "Tristeza", "Aversión", "Ira", "Anticipación"]
    total = len(raw_items)
    
    counts = Counter(item["ai_emotion"] for item in raw_items)
    
    return {
        "emociones": [
            {"name": e, "value": int((counts.get(e, 0) / total) * 100)}
            for e in emotions
        ]
    }
```

### Q3: Tópicos
```python
def aggregate_q3(raw_items: list[dict]) -> dict:
    """Calcula frecuencia y sentimiento por tópico."""
    topics = defaultdict(list)
    for item in raw_items:
        topics[item["ai_topic"]].append(item["ai_sentiment_score"])
    
    total = len(raw_items)
    
    return {
        "results": {
            "analisis_agregado": [
                {
                    "topic": topic,
                    "frecuencia_relativa": int((len(scores) / total) * 100),
                    "sentimiento_promedio": round(sum(scores) / len(scores), 2)
                }
                for topic, scores in sorted(topics.items(), key=lambda x: -len(x[1]))[:5]
            ]
        }
    }
```

---

## API Endpoints

### POST /pipeline/start
```python
@router.post("/pipeline/start")
async def start_pipeline(
    client_id: str,
    instagram_url: str,
    background_tasks: BackgroundTasks
):
    """
    Inicia el pipeline de análisis.
    1. Crea registro en analysis_reports (status=PROCESSING)
    2. Lanza tarea en background
    3. Retorna inmediatamente con report_id
    """
    report_id = await create_report(client_id)
    
    background_tasks.add_task(
        run_full_pipeline,
        report_id=report_id,
        instagram_url=instagram_url
    )
    
    return {"status": "accepted", "report_id": report_id}
```

### GET /analysis/{client_id}
```python
@router.get("/analysis/{client_id}")
async def get_analysis(client_id: str):
    """
    Obtiene el último análisis completado.
    Retorna el JSON compatible con el frontend actual.
    """
    report = await get_latest_completed_report(client_id)
    if not report:
        raise HTTPException(404, "No analysis found")
    
    return report["frontend_compatible_json"]
```

---

## Variables de Entorno (.env)

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# Apify
APIFY_TOKEN=apify_api_xxx

# Gemini
GEMINI_API_KEY=AIza...

# Server
PORT=8000
```

---

## Migración (Sidecar Strategy)

1. **Deploy Backend v2** en Railway (nuevo servicio).
2. **Cambiar `VITE_API_URL`** en frontend local a Railway URL.
3. **Probar flujo completo**: Link -> Espera -> Gráficos.
4. **Kill Switch**: Apagar backend antiguo, redirigir dominio.
