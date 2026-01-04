# 📊 Metodología de Análisis Q1-Q10: Validación y Optimización

> **Documento de Investigación** - Generado con Exa AI Search  
> **Fecha**: Enero 2026  
> **Versión**: 1.0

---

## 📋 Resumen Ejecutivo

Este documento valida y optimiza los frameworks teóricos utilizados en los análisis Q1-Q10 del Semantic Orchestrator de Pixely Partners. La investigación se basa en literatura académica reciente (2024-2025) sobre análisis de emociones, personalidad de marca y framing en redes sociales.

---

## 1. Validación de Frameworks Teóricos

### Q1 - Rueda de Plutchik (Emociones)

| Aspecto | Evaluación |
|---------|------------|
| **Validación** | ✅ **VALIDADO** |
| **Aplicabilidad** | Alta para análisis de comentarios de redes sociales |

**Evidencia Académica:**
- **arXiv (2014)**: "Rule-based Emotion Detection on Social Media" - Valida el uso de Plutchik para análisis de mensajes escritos en RRSS
- **ScienceDirect (2021)**: "Temporal variability of emotions in social media posts" - Aplica Plutchik específicamente a posts de redes sociales
- **BMC Psychology (2024)**: "Evaluation of emotion classification schemes in social media text" - Compara esquemas de clasificación emocional y confirma que Plutchik es apropiado
- **NIH/PMC (2021)**: "PyPlutchik: Visualising and comparing emotion-annotated corpora" - Herramienta de visualización validada académicamente

**Ajustes Recomendados:**
1. ✅ Las 8 emociones primarias son correctas para análisis de comentarios
2. ⚠️ **Cambio sugerido**: Los porcentajes NO deben sumar 1.0 - deben ser **intensidades independientes** (0.0 a 1.0 cada una)
3. ✅ Mantener "emocion_dominante" como output clave

**Prompt Optimizado:**
```
Los porcentajes representan INTENSIDAD de cada emoción (0.0 a 1.0).
NO necesitan sumar 1.0 - cada emoción se evalúa independientemente.
Una emoción con 0.8 significa alta presencia de esa emoción.
```

---

### Q2 - Dimensiones de Aaker (Personalidad de Marca)

| Aspecto | Evaluación |
|---------|------------|
| **Validación** | ✅ **VALIDADO con ajustes** |
| **Aplicabilidad** | Alta, pero requiere clarificación de fuente de datos |

**Evidencia Académica:**
- **AAAI (2016)**: "Predicting Perceived Brand Personality with Social Media" (IBM Research) - Confirma que Aaker es aplicable a análisis de redes sociales
- **ScienceDirect (2022)**: "A longitudinal study of B2B customer engagement in LinkedIn: The role of brand personality" - Valida Aaker para **B2B en LinkedIn específicamente**
- **Stanford GSB**: Paper original de Jennifer Aaker - "Dimensions of Brand Personality" sigue siendo el estándar de la industria
- **Inderscience (2018)**: "Exploring the brand personalities of Facebook, YouTube, and LinkedIn" - ⚠️ Encuentra que las personalidades de marca en RRSS no siempre siguen la estructura BPS original

**Ajustes Críticos:**
1. ⚠️ **Fuente de datos incorrecta**: Actualmente analiza `Posts.content` (contenido de la marca). **Debería analizar COMENTARIOS** para medir **personalidad PERCIBIDA** por la audiencia
2. ✅ Las 5 dimensiones de Aaker son correctas
3. ⚠️ Para B2B, considerar mayor peso a "Competence" y "Sophistication"

**Decisión de Diseño:**
```
OPCIÓN A (Recomendada): Analizar COMENTARIOS → Personalidad PERCIBIDA por audiencia
OPCIÓN B: Analizar POSTS → Personalidad PROYECTADA por la marca

Para Pixely Partners (B2B), OPCIÓN A es más valiosa estratégicamente.
```

---

### Q3 - Topic Modeling (Tópicos)

| Aspecto | Evaluación |
|---------|------------|
| **Validación** | ✅ **VALIDADO** |
| **Aplicabilidad** | Estándar de la industria |

**Ajustes Recomendados:**
1. ✅ 5 tópicos es un número óptimo para dashboards
2. ✅ Sentimiento por tópico (-1.0 a 1.0) es correcto
3. ⚠️ **Agregar**: Incluir 3-5 "palabras clave" por tópico para transparencia

**Output Mejorado:**
```json
{
    "temas_principales": [
        {
            "tema": "Precio y Valor",
            "porcentaje": 0.35,
            "sentimiento": -0.2,
            "palabras_clave": ["caro", "precio", "costo", "inversión"]
        }
    ]
}
```

---

### Q4 - Framing de Entman (Marcos Narrativos)

| Aspecto | Evaluación |
|---------|------------|
| **Validación** | ✅ **VALIDADO con contexto** |
| **Aplicabilidad** | Requiere adaptación para RRSS |

**Evidencia Académica:**
- **Entman (1993)**: Paper original "Framing: Toward Clarification of a Fractured Paradigm" - diseñado para medios tradicionales
- **ResearchGate (2022)**: "Framing Theory in the Age of Social Media" - Confirma que Framing es aplicable a RRSS pero requiere adaptación
- **MDPI (2022)**: "Framing Studies Evolution in the Social Media Era" - Valida el uso en era digital
- **arXiv (2025)**: "Retain or Reframe? A Computational Framework for the Analysis of Framing in News Articles and Reader Comments" - Framework computacional actualizado

**Ajustes Recomendados:**
1. ✅ Los 5 marcos de Entman son aplicables
2. ⚠️ En RRSS, "Human Interest" tiende a dominar (contenido más personal)
3. ⚠️ "Attribution of Responsibility" es más directo en RRSS (users mencionan @marcas directamente)

**Contexto para el Prompt:**
```
En redes sociales, los marcos narrativos se expresan de forma más directa:
- Conflicto: Comparaciones con competidores, "X es mejor que Y"
- Economic: Quejas de precio, ROI, "no vale lo que cuesta"
- Human Interest: Historias personales, "a mí me pasó que..."
- Morality: Críticas éticas, "no está bien que..."
- Responsibility: Menciones directas, "@marca debería..."
```

---

### Q5 - Identificación de Influenciadores

| Aspecto | Evaluación |
|---------|------------|
| **Validación** | ⚠️ **LIMITADO** |
| **Aplicabilidad** | Funcional pero con restricciones de datos |

**Problema Identificado:**
Sin acceso a métricas de followers, el análisis se basa solo en:
- Frecuencia de comentarios
- Likes en comentarios
- Menciones por otros usuarios

**Evidencia Académica:**
- **Sprout Social (2024)**: "10 metrics to track influencer marketing success" - Métricas clave: engagement rate, reach, impressions
- **Brand24 (2025)**: "11 Key Influencer Marketing Metrics" - Sin followers, usar "share of voice" como proxy
- **LinkedIn Articles**: Identificación basada en "authority signals" en el contenido

**Ajustes Recomendados:**
1. ⚠️ Renombrar a "Voces Influyentes" o "Participantes Destacados" (no son "influencers" en sentido tradicional)
2. ✅ Métricas válidas sin followers:
   - Frecuencia de participación
   - Likes recibidos en comentarios
   - Calidad/profundidad de comentarios
   - Menciones por otros usuarios
3. ⚠️ Agregar campo "tipo_influencia": "Frecuente", "Autoridad", "Viral"

**Output Mejorado:**
```json
{
    "voces_influyentes": [
        {
            "usuario": "@DataExpert",
            "frecuencia_comentarios": 5,
            "likes_totales": 94,
            "tipo_influencia": "Autoridad",
            "razon": "Comentarios técnicos detallados"
        }
    ]
}
```

---

### Q6, Q7, Q8, Q9 - Análisis Complementarios

| Módulo | Validación | Notas |
|--------|------------|-------|
| Q6 - Oportunidades | ✅ Válido | Pain points es metodología estándar de UX Research |
| Q7 - Sentimiento | ✅ Válido | Clasificación 4-way (Pos/Neg/Neu/Mixed) es estándar |
| Q8 - Temporal | ✅ Válido | Requiere datos con timestamps |
| Q9 - Recomendaciones | ✅ Válido | Síntesis estratégica es valor agregado |

---

## 2. Escalas y Métricas Estandarizadas

### Recomendación Unificada

| Tipo de Métrica | Escala | Justificación |
|-----------------|--------|---------------|
| **Intensidad/Presencia** | 0.0 - 1.0 | Emociones, sentimientos (valores independientes) |
| **Score de Dimensión** | 0 - 100 | Personalidad, marcos (más intuitivo para dashboards) |
| **Porcentaje de Distribución** | 0.0 - 1.0 | Tópicos, sentimiento agregado (DEBE sumar ~1.0) |
| **Polaridad** | -1.0 a +1.0 | Sentimiento por tópico |
| **Prioridad** | Ratio | impacto/esfuerzo |
| **Urgencia** | Enum | "CRÍTICA", "ALTA", "MEDIA", "BAJA" |

### Regla de Suma

```
✅ DEBEN sumar ~1.0:
   - Q3: porcentaje de tópicos
   - Q7: distribución de sentimiento (Pos+Neg+Neu+Mix)

❌ NO deben sumar 1.0 (son intensidades independientes):
   - Q1: emociones de Plutchik
   - Q2: dimensiones de Aaker
   - Q4: marcos de Entman
```

---

## 3. Gaps Identificados

### Análisis Faltantes para Social Media B2B

| Gap | Descripción | Prioridad |
|-----|-------------|-----------|
| **Análisis por Plataforma** | Instagram vs LinkedIn tienen audiencias muy diferentes | 🔴 Alta |
| **Share of Voice** | % de conversación vs competidores | 🟡 Media |
| **Content Performance** | Qué tipo de contenido genera más engagement | 🟡 Media |
| **Response Rate** | Velocidad de respuesta de la marca | 🟢 Baja |

### Segmentación por Plataforma

**Recomendación: SÍ segmentar**

| Plataforma | Características |
|------------|-----------------|
| **LinkedIn** | B2B, profesional, Aaker dimension "Competence" más relevante |
| **Instagram** | Visual, emocional, Plutchik más expresivo |
| **TikTok** | Entretenimiento, "Excitement" de Aaker más relevante |
| **Facebook** | Mixto, demografía mayor |

**Implementación Sugerida:**
```python
# Agregar campo platform_breakdown en cada análisis
"platform_breakdown": {
    "LinkedIn": {"sentiment": 0.6, "volume": 120},
    "Instagram": {"sentiment": 0.4, "volume": 340}
}
```

---

## 4. Prompting Best Practices para Gemini

### Estructura Recomendada (Validada)

```
=== DATOS A ANALIZAR ===
[Especificar exactamente qué columnas/sheets leer]

=== TAREA ===
[Descripción clara del análisis]

=== REGLAS ===
[Restricciones numéricas, límites de caracteres]

=== RESPUESTA (JSON exacto) ===
[Schema completo con ejemplo]
```

### Técnicas Anti-Alucinación

1. **Especificar límites de caracteres**: `"max 50 chars"`
2. **Usar `response_mime_type: "application/json"`** en Gemini API
3. **Prohibir explícitamente invención**: `"NO inventes, solo extrae de los comentarios"`
4. **Incluir valores por defecto**: `"Si no hay datos suficientes, retorna null"`

### Few-Shot vs Zero-Shot

| Escenario | Recomendación |
|-----------|---------------|
| Análisis estructurado (Q1-Q9) | ✅ **Zero-shot con schema** - Gemini maneja bien JSON con response_schema |
| Insights cualitativos | ⚠️ Few-shot puede ayudar con el tono |

**Configuración Gemini Óptima:**
```python
generation_config = {
    "response_mime_type": "application/json",
    "temperature": 0.2,  # Bajo para consistencia
    "top_p": 0.8
}
```

---

## 5. Visualización Recomendada

### Tabla de Gráficos por Análisis

| Análisis | Tipo de Gráfico | Paleta de Colores |
|----------|-----------------|-------------------|
| Q1 - Emociones | **Radar Chart** (8 ejes) | Plutchik oficial: Joy=Yellow, Trust=Green, Fear=DarkGreen, Surprise=Cyan, Sadness=Blue, Disgust=Purple, Anger=Red, Anticipation=Orange |
| Q2 - Personalidad | **Radar Chart** (5 ejes) | Gradiente azul-morado (profesional B2B) |
| Q3 - Tópicos | **Horizontal Bar Chart** con color por sentimiento | Verde→Amarillo→Rojo según sentimiento |
| Q4 - Marcos | **Stacked Bar Chart** | Escala de grises + 1 color highlight |
| Q5 - Influenciadores | **Table/List** con badges | Badges: Alto=Verde, Medio=Amarillo, Bajo=Gris |
| Q6 - Oportunidades | **Priority Matrix** (impacto vs esfuerzo) | Cuadrantes: verde, amarillo, naranja, rojo |
| Q7 - Sentimiento | **Donut/Pie Chart** | Positivo=Verde #22c55e, Negativo=Rojo #ef4444, Neutro=Gris #9ca3af, Mixto=Amarillo #eab308 |
| Q8 - Temporal | **Line Chart** con área | Línea azul + área semitransparente |
| Q9 - Recomendaciones | **Kanban/List** agrupado por área | Color por urgencia |
| Q10 - Resumen | **Dashboard Summary Cards** | Brand colors |

### Colores de Plutchik (Estándar Académico)

```css
:root {
  --plutchik-joy: #FFEB3B;        /* Alegría - Amarillo */
  --plutchik-trust: #4CAF50;       /* Confianza - Verde */
  --plutchik-fear: #1B5E20;        /* Miedo - Verde oscuro */
  --plutchik-surprise: #00BCD4;    /* Sorpresa - Cyan */
  --plutchik-sadness: #2196F3;     /* Tristeza - Azul */
  --plutchik-disgust: #9C27B0;     /* Aversión - Morado */
  --plutchik-anger: #F44336;       /* Ira - Rojo */
  --plutchik-anticipation: #FF9800; /* Anticipación - Naranja */
}
```

### Colores de Sentimiento (Best Practice)

```css
:root {
  --sentiment-positive: #22c55e;   /* Verde - Tailwind green-500 */
  --sentiment-negative: #ef4444;   /* Rojo - Tailwind red-500 */
  --sentiment-neutral: #9ca3af;    /* Gris - Tailwind gray-400 */
  --sentiment-mixed: #eab308;      /* Amarillo - Tailwind yellow-500 */
}
```

---

## 6. Manejo de Múltiples Idiomas

### Desafíos Identificados

Según la literatura (ACM 2024, IJCISS 2024):
- **Nuances lingüísticas**: Sarcasmo, ironía varían por cultura
- **Recursos limitados**: Menos datasets para español latinoamericano
- **Context cultural**: Emojis tienen diferentes significados

### Recomendación

1. **No traducir**: Gemini es nativo multilingüe - analizar en idioma original
2. **Especificar en prompt**: `"El contenido puede estar en español, inglés o portugués"`
3. **Output siempre en español**: Para consistencia del dashboard

**Prompt Multilingüe:**
```
El contenido de los comentarios puede estar en cualquier idioma 
(español, inglés, portugués, etc.). Analiza el sentimiento en el 
idioma original pero genera TODOS los outputs en español.
```

---

## 7. Checklist de Implementación

### Cambios Prioritarios en `semantic_orchestrator.py`

- [ ] **Q1**: Cambiar suma de emociones - NO deben sumar 1.0
- [ ] **Q2**: Cambiar fuente de datos de Posts a Comments (personalidad PERCIBIDA)
- [ ] **Q3**: Agregar campo `palabras_clave` a cada tópico
- [ ] **Q5**: Renombrar a "Voces Influyentes", agregar `tipo_influencia`
- [ ] **Todos**: Agregar instrucción multilingüe
- [ ] **Config**: Usar `temperature: 0.2` para consistencia JSON

### Campos Nuevos para Frontend

```typescript
interface AnalysisResult {
  // Metadata
  platform_breakdown?: Record<Platform, PlatformStats>;
  analysis_language: string; // "es", "en", "pt"
  
  // Q3 enhancement
  palabras_clave?: string[];
  
  // Q5 enhancement  
  tipo_influencia?: "Frecuente" | "Autoridad" | "Viral";
}
```

---

## 8. Referencias

### Papers Académicos
1. Tromp & Pechenizkiy (2014). "Rule-based Emotion Detection on Social Media" - arXiv:1412.4682
2. Alaei, Becken & Stantic (2021). "Temporal variability of emotions in social media posts" - ScienceDirect
3. Zhang et al. (2024). "Evaluation of emotion classification schemes in social media text" - BMC Psychology
4. Aaker, J. (1997). "Dimensions of Brand Personality" - Stanford GSB
5. Entman, R. (1993). "Framing: Toward Clarification of a Fractured Paradigm" - J-Communication
6. Xu et al. (2016). "Predicting Perceived Brand Personality with Social Media" - AAAI/ICWSM

### Recursos Técnicos
- Google AI. "Structured Outputs | Gemini API" - ai.google.dev
- Carbon Design System. "Color palettes for data visualization"
- Adobe Spectrum. "Color for data visualization"

---

> **Próximo paso**: Aplicar estos ajustes a `semantic_orchestrator.py` y definir el contrato de datos para el frontend.
