# 🚀 Pixely Partners - Backend

Sistema de análisis de redes sociales y marketing digital con Gemini AI.

## Despliegue Rápido (3 pasos)

### 1. Configurar Secretos

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env  # o usa tu editor favorito
```

**Variables requeridas en `.env`:**
| Variable | Descripción |
|----------|-------------|
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `ORCHESTRATOR_USER` | Email del admin (ej: `admin@tuempresa.com`) |
| `ORCHESTRATOR_PASSWORD` | Contraseña del admin |
| `GEMINI_API_KEY` | API Key de Google Gemini |

### 2. Copiar Credenciales de Google (para Google Sheets)

```bash
# Copia tu archivo de Service Account de Google Cloud
cp /ruta/a/tu/credentials.json ./credentials.json
```

### 3. Iniciar

```bash
docker compose up -d
```

**¡Listo!** El sistema automáticamente:
- ✅ Crea las tablas de base de datos
- ✅ Ejecuta las migraciones de Alembic
- ✅ Crea el tenant "Pixely Partners"
- ✅ Crea el usuario admin con las credenciales del `.env`

---

## Acceso

| Servicio | URL |
|----------|-----|
| **API Docs** | http://localhost:8000/docs |
| **Health Check** | http://localhost:8000/health |
| **Adminer** (DB GUI) | http://localhost:8080 |

### Login API

```bash
curl -X POST http://localhost:8000/token \
  -d "username=admin@tuempresa.com&password=tu_password"
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────┐  │
│   │     API       │    │  Orchestrator │    │    DB     │  │
│   │  (FastAPI)    │───▶│   (Gemini)    │    │(PostgreSQL│  │
│   │   :8000       │    │   Cron 6AM    │    │    15)    │  │
│   └───────────────┘    └───────────────┘    └───────────┘  │
│          │                                       ▲          │
│          └───────────────────────────────────────┘          │
│                                                             │
│   ┌───────────────┐                                        │
│   │   Adminer     │  (Opcional - UI para la DB)            │
│   │    :8080      │                                        │
│   └───────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Comandos Útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs solo del API
docker compose logs -f api

# Reiniciar un servicio
docker compose restart api

# Detener todo
docker compose down

# Detener y limpiar volúmenes (¡borra la DB!)
docker compose down -v

# Reconstruir imágenes
docker compose build --no-cache
```

---

## Flujo de Análisis Q1-Q10

El orquestador ejecuta diariamente (6:00 AM) el análisis de redes sociales:

1. **Descarga datos** de Google Sheets (archivos XLS)
2. **Analiza con Gemini** usando 10 preguntas estratégicas (Q1-Q10)
3. **Guarda resultados** en PostgreSQL
4. **API expone** los insights via REST

### Análisis disponibles:

| Pregunta | Análisis |
|----------|----------|
| Q1 | Volume & Rhythm Analysis |
| Q2 | Sentiment Analysis |
| Q3 | Content Type Impact |
| Q4 | Engagement Patterns |
| Q5 | Word & Hashtag Analysis |
| Q6 | Peak Performance |
| Q7 | Competitive Share |
| Q8 | Influence Network |
| Q9 | Audience Behavior |
| Q10 | Executive Summary |

---

## Estructura de Archivos

```
backend/
├── api/                    # FastAPI application
│   ├── main.py            # App entry point
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   └── routes_*.py        # API endpoints
├── orchestrator/          # Gemini analysis engine
│   ├── semantic_orchestrator.py
│   └── ingest_utils.py
├── alembic/               # Database migrations
├── docker-compose.yml     # Services configuration
├── Dockerfile.api         # API container
├── Dockerfile.orchestrator
├── init_db.py            # Auto-init script
├── entrypoint.api.sh     # API startup script
├── .env                  # Your secrets (git ignored)
├── .env.example          # Template for .env
└── credentials.json      # Google SA (git ignored)
```

---

## Troubleshooting

### Error: "Database connection refused"
```bash
# Verificar que PostgreSQL está corriendo
docker compose ps
docker compose logs db
```

### Error: "Alembic migration failed"
```bash
# Entrar al contenedor y verificar
docker compose exec api bash
alembic current
alembic upgrade head
```

### Resetear todo desde cero
```bash
docker compose down -v
docker compose up -d
```
