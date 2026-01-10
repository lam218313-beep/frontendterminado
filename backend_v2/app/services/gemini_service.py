"""
Gemini Classification Service
=============================
Batch classification of comments using Gemini.
"""

import json
import logging
from typing import Any

from google import genai
from google.genai import types

from ..config import settings

logger = logging.getLogger(__name__)

# 10 Tópicos de Comercio General
COMMERCE_TOPICS = [
    "Precio",           # Costo, promociones, descuentos
    "Calidad",          # Durabilidad, materiales, acabados
    "Servicio",         # Atención al cliente, trato
    "Entrega",          # Envío, tiempos, logística
    "Experiencia",      # UX general, satisfacción
    "Producto",         # Características, funcionalidad
    "Garantía",         # Devoluciones, soporte post-venta
    "Comunicación",     # Marketing, contenido, redes
    "Confianza",        # Reputación, seguridad, credibilidad
    "Recomendación",    # Boca a boca, referencias
]

CLASSIFICATION_PROMPT = """
Eres un clasificador experto de comentarios de redes sociales para marcas comerciales.
Tu trabajo es ETIQUETAR cada comentario con los siguientes campos:

1. **emotion**: Una emoción de Plutchik (exactamente una):
   Alegría, Confianza, Miedo, Sorpresa, Tristeza, Aversión, Ira, Anticipación

2. **personality**: Rasgo de personalidad proyectado según Aaker:
   Sinceridad, Emocion, Competencia, Sofisticacion, Robustez

3. **topic**: Tema principal. PRIMERO intenta usar uno de estos 10 tópicos comerciales:
   Precio, Calidad, Servicio, Entrega, Experiencia, Producto, Garantía, Comunicación, Confianza, Recomendación
   
   Si el comentario NO encaja en ninguno de los anteriores, usa una categoría descriptiva 
   de máximo 2 palabras que capture el tema (ej: "Aprendizaje", "Entretenimiento", "Comunidad").

4. **sentiment_score**: Número de -1.0 (muy negativo) a 1.0 (muy positivo)

REGLAS:
- Devuelve ÚNICAMENTE un JSON Array válido.
- Cada ítem debe tener: idx, emotion, personality, topic, sentiment_score
- El campo "idx" corresponde al índice del comentario en la lista de entrada.
- Para "topic", prioriza los 10 tópicos comerciales. Solo usa texto libre si ninguno aplica.

Ejemplo de salida:
[
  {{"idx": 0, "emotion": "Alegría", "personality": "Sinceridad", "topic": "Calidad", "sentiment_score": 0.8}},
  {{"idx": 1, "emotion": "Anticipación", "personality": "Emocion", "topic": "Aprendizaje", "sentiment_score": 0.7}}
]

COMENTARIOS A CLASIFICAR:
{comments_json}
"""


async def classify_comments_batch(comments: list[str], batch_size: int = 50) -> list[dict[str, Any]]:
    """
    Classify a list of comments using Gemini.
    
    Args:
        comments: List of comment texts
        batch_size: Max comments per API call (default 50)
        
    Returns:
        List of classification dictionaries with keys:
        - idx: Original index
        - emotion: Plutchik emotion
        - personality: Aaker personality trait
        - topic: Main topic
        - sentiment_score: -1.0 to 1.0
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured")
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    all_results: list[dict] = []
    
    # Process in batches
    for i in range(0, len(comments), batch_size):
        batch = comments[i:i + batch_size]
        batch_start_idx = i
        
        logger.info(f"🧠 Classifying batch {i // batch_size + 1}: {len(batch)} comments")
        
        # Prepare input
        comments_for_prompt = [
            {"idx": batch_start_idx + j, "text": text}
            for j, text in enumerate(batch)
        ]
        
        prompt = CLASSIFICATION_PROMPT.format(
            comments_json=json.dumps(comments_for_prompt, ensure_ascii=False)
        )
        
        try:
            response = await client.aio.models.generate_content(
                model="gemini-1.5-flash", 
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            
            batch_results = json.loads(response.text)
            all_results.extend(batch_results)
            
            logger.info(f"✅ Batch classified: {len(batch_results)} results")
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parse error in batch: {e}")
            logger.error(f"   Raw response: {response.text[:500] if response and response.text else 'Empty'}")
            continue
            
        except Exception as e:
            logger.error(f"❌ Gemini classification error: {e}")
            raise
    
    return all_results


def map_classification_to_raw_item(
    comment: dict[str, Any],
    classification: dict[str, Any]
) -> dict[str, Any]:
    """
    Merge original comment data with classification results.
    """
    return {
        "platform": "instagram",
        "platform_id": comment.get("id", ""),
        "content": comment.get("text", ""),
        "author": comment.get("ownerUsername", ""),
        "posted_at": comment.get("timestamp"),
        "ai_emotion": classification.get("emotion", "Otro"),
        "ai_personality": classification.get("personality", "Sinceridad"),
        "ai_topic": classification.get("topic", "Otro"),
        "ai_sentiment_score": classification.get("sentiment_score", 0.0),
    }


# =============================================================================
# INTERPRETATION GENERATOR - Human-readable explanations for each graph
# =============================================================================

INTERPRETATION_PROMPT = """
Actúa como un Consultor Senior de Estrategia de Marca. Tu cliente no es técnico.

CONTEXTO ESTRATÉGICO DEL CLIENTE:
{context_str}

TIENES EL SIGUIENTE REPORTE DE DATOS (Q1-Q10):
{aggregated_json}

INSTRUCCIONES CRÍTICAS:
Tu tarea es generar una interpretación breve (máximo 3 frases) para CADA bloque (Q1 a Q10).
Para cada interpretación, DEBES cruzar los datos encontrados con la IDENTIDAD DE MARCA definida en el contexto.

1. **Alineación**: ¿Los resultados reflejan la Misión, Visión o Valores de la marca? Si no, señálalo suavemente.
2. **Personalidad**: ¿El tono de los comentarios coincide con el Arquetipo de la marca?
3. **Accionable**: Explica qué significa el dato para SU negocio específico.
4. **Formato**: Usa un lenguaje alentador pero estratégico. Usa **negritas** para conceptos clave.

Devuelve un JSON estricto con este formato:
{{
    "Q1_interpretation": "Texto explicativo aquí...",
    "Q2_interpretation": "Texto explicativo aquí...",
    ...
    "Q10_interpretation": "Texto explicativo aquí..."
}}
"""


async def generate_interpretations(aggregated_json: dict, context: dict = None) -> dict:
    """
    Takes the aggregated Q1-Q10 data AND full client context (Interview + Brand) 
    to generate human-readable explanations.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured, skipping interpretations")
        return {}
    
    # Format Context String
    context_str = "No hay información estratégica previa disponible. Asume un e-commerce general."
    
    if context:
        # Extract parts
        interview = context.get("interview") or {}
        brand = context.get("brand") or {}
        
        # Interview Data
        business = interview.get("businessName", "La Marca")
        history = interview.get("history", "")[:300]
        audience_obj = interview.get("audience", {})
        audience_str = f"{audience_obj.get('ageRange', '')}, {audience_obj.get('gender', '')}. Intereses: {audience_obj.get('interests', '')}"
        goals = ", ".join(interview.get("goals", {}).get("brandGoals", []))
        
        # Brand Book Data
        mission = brand.get("mission", "No definida")
        vision = brand.get("vision", "No definida")
        archetype = brand.get("archetype", "No definido")
        values_list = [v.get("title", "") for v in brand.get("values", [])]
        values_str = ", ".join(filter(None, values_list))
        
        # Parse Tone
        tone_traits = brand.get("tone_traits", [])
        # Handle if tone_traits is list of dicts or strings (schema varies)
        tone_str = ""
        if tone_traits and isinstance(tone_traits[0], dict):
             tone_str = ", ".join([t.get("trait", "") for t in tone_traits])
        elif tone_traits:
             tone_str = ", ".join(str(t) for t in tone_traits)

        context_str = (
            f"--- PERFIL DE NEGOCIO ---\n"
            f"Nombre: {business}\n"
            f"Historia/Contexto: {history}\n"
            f"Audiencia Objetivo: {audience_str}\n"
            f"Objetivos: {goals}\n\n"
            f"--- IDENTIDAD DE MARCA (BRAND BOOK) ---\n"
            f"Misión: {mission}\n"
            f"Visión: {vision}\n"
            f"Valores Centrales: {values_str}\n"
            f"Arquetipo: {archetype}\n"
            f"Tono de Voz: {tone_str}\n"
        )

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    prompt = INTERPRETATION_PROMPT.format(
        context_str=context_str,
        aggregated_json=json.dumps(aggregated_json, indent=2, ensure_ascii=False)
    )
    
    try:
        logger.info(f"🗣️ Generating interpretations with context ({len(context_str)} chars)...")
        
        response = await client.aio.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7
            )
        )
        
        interpretations = json.loads(response.text)
        logger.info(f"✅ Generated {len(interpretations)} interpretations")
        return interpretations
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parse error in interpretations: {e}")
        return _get_fallback_interpretations()
        
    except Exception as e:
        logger.error(f"❌ Error generating interpretations: {e}")
        return _get_fallback_interpretations()


def _get_fallback_interpretations() -> dict:
    """Return generic interpretations when AI generation fails."""
    fallback = "Los datos muestran tendencias que ameritan análisis más profundo. Consulta con tu equipo de estrategia."
    return {f"Q{i}_interpretation": fallback for i in range(1, 11)}

