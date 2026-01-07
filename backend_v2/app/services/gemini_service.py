"""
Gemini Classification Service
=============================
Batch classification of comments using Gemini 1.5 Flash.
"""

import json
import logging
from typing import Any

import google.generativeai as genai

from ..config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

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
    
    model = genai.GenerativeModel("gemini-3-flash-preview")
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
            response = await model.generate_content_async(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.2,  # Lower temperature for consistency
                }
            )
            
            batch_results = json.loads(response.text)
            all_results.extend(batch_results)
            
            logger.info(f"✅ Batch classified: {len(batch_results)} results")
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parse error in batch: {e}")
            logger.error(f"   Raw response: {response.text[:500]}")
            # Skip invalid batch instead of failing completely
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
    
    Args:
        comment: Original Apify comment object
        classification: Gemini classification result
        
    Returns:
        Dictionary ready for database insertion
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
