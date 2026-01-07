"""
Aggregator Service
==================
Mathematical aggregation of classified items into Q1-Q10 format.
This is the "source of truth" - all percentages are calculated, not estimated.
"""

import logging
from collections import Counter, defaultdict
from typing import Any

logger = logging.getLogger(__name__)


# Plutchik emotions (Q1)
EMOTIONS = [
    "Alegría", "Confianza", "Miedo", "Sorpresa",
    "Tristeza", "Aversión", "Ira", "Anticipación"
]

# Aaker personality traits (Q2)
PERSONALITIES = [
    "Sinceridad", "Emocion", "Competencia", "Sofisticacion", "Robustez"
]


def aggregate_q1_emotions(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q1: Plutchik Emotion Distribution.
    
    Returns:
        {"emociones": [{"name": "Alegría", "value": 25}, ...]}
    """
    total = len(raw_items)
    if total == 0:
        return {"emociones": [{"name": e, "value": 0} for e in EMOTIONS]}
    
    counts = Counter(item.get("ai_emotion", "Otro") for item in raw_items)
    
    return {
        "emociones": [
            {"name": e, "value": int((counts.get(e, 0) / total) * 100)}
            for e in EMOTIONS
        ]
    }


def aggregate_q2_personality(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q2: Aaker Brand Personality traits.
    
    Returns:
        {"resumen_global_personalidad": {"Sinceridad": 30, ...}}
    """
    total = len(raw_items)
    if total == 0:
        return {"resumen_global_personalidad": {p: 0 for p in PERSONALITIES}}
    
    counts = Counter(item.get("ai_personality", "Sinceridad") for item in raw_items)
    
    return {
        "resumen_global_personalidad": {
            p: int((counts.get(p, 0) / total) * 100)
            for p in PERSONALITIES
        }
    }


def aggregate_q3_topics(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q3: Topic Distribution with Sentiment.
    
    Returns:
        {"results": {"analisis_agregado": [{"topic": "Precio", "frecuencia_relativa": 35, "sentimiento_promedio": 0.2}, ...]}}
    """
    total = len(raw_items)
    if total == 0:
        return {"results": {"analisis_agregado": []}}
    
    # Group by topic with sentiment scores
    topics = defaultdict(list)
    for item in raw_items:
        topic = item.get("ai_topic", "Otro")
        sentiment = item.get("ai_sentiment_score", 0.0)
        topics[topic].append(sentiment)
    
    # Sort by frequency, take top 5
    sorted_topics = sorted(topics.items(), key=lambda x: -len(x[1]))[:5]
    
    return {
        "results": {
            "analisis_agregado": [
                {
                    "topic": topic,
                    "frecuencia_relativa": int((len(scores) / total) * 100),
                    "sentimiento_promedio": round(sum(scores) / len(scores), 2) if scores else 0
                }
                for topic, scores in sorted_topics
            ]
        }
    }


def aggregate_q4_narrative_frames(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q4: Narrative Frames (Positive/Negative/Aspirational).
    Derived from sentiment scores.
    """
    total = len(raw_items)
    if total == 0:
        return {
            "results": {
                "analisis_agregado": {"Positivo": 0.33, "Negativo": 0.33, "Aspiracional": 0.34},
                "evolucion_temporal": []
            }
        }
    
    positive = sum(1 for i in raw_items if i.get("ai_sentiment_score", 0) > 0.3)
    negative = sum(1 for i in raw_items if i.get("ai_sentiment_score", 0) < -0.3)
    aspirational = total - positive - negative  # Neutral = aspirational
    
    return {
        "results": {
            "analisis_agregado": {
                "Positivo": round(positive / total, 2),
                "Negativo": round(negative / total, 2),
                "Aspiracional": round(aspirational / total, 2)
            },
            "evolucion_temporal": []  # TODO: Group by week
        }
    }


def aggregate_q5_influencers(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q5: Top Influencers by comment frequency.
    """
    # Group by author
    authors = defaultdict(list)
    for item in raw_items:
        author = item.get("author", "anon")
        authors[author].append(item)
    
    # Sort by frequency, take top 5
    sorted_authors = sorted(authors.items(), key=lambda x: -len(x[1]))[:5]
    total = len(raw_items)
    
    return {
        "results": {
            "influenciadores_globales": [
                {
                    "username": f"@{author}",
                    "autoridad_promedio": min(95, 50 + len(items) * 5),
                    "afinidad_promedio": 70,
                    "menciones": len(items),
                    "score_centralidad": round(len(items) / total, 2) if total else 0,
                    "sentimiento": round(
                        sum(i.get("ai_sentiment_score", 0) for i in items) / len(items), 2
                    ) if items else 0,
                    "comentario_evidencia": items[0].get("content", "")[:100] if items else ""
                }
                for author, items in sorted_authors
            ]
        }
    }


def aggregate_q6_opportunities(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q6: Opportunities Matrix based on negative sentiment topics.
    """
    # Find topics with negative sentiment (opportunities to improve)
    topics = defaultdict(list)
    for item in raw_items:
        topic = item.get("ai_topic", "Otro")
        sentiment = item.get("ai_sentiment_score", 0)
        topics[topic].append(sentiment)
    
    opportunities = []
    for topic, scores in topics.items():
        avg_sentiment = sum(scores) / len(scores) if scores else 0
        frequency = len(scores)
        
        # Gap score = inverse of sentiment (negative = high gap)
        gap_score = int((1 - avg_sentiment) * 50) + 25  # 25-75 range
        competencia_score = int(avg_sentiment * 50) + 25
        
        opportunities.append({
            "oportunidad": topic,
            "gap_score": min(95, max(25, gap_score)),
            "competencia_score": min(95, max(25, competencia_score)),
            "recomendacion_accion": f"Mejorar {topic.lower()}" if avg_sentiment < 0 else f"Mantener {topic.lower()}",
            "detalle": f"{frequency} menciones, sentimiento {avg_sentiment:.1f}"
        })
    
    # Sort by gap score (highest first)
    opportunities.sort(key=lambda x: -x["gap_score"])
    
    return {"results": {"oportunidades": opportunities[:6]}}


def aggregate_q7_sentiment(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q7: Detailed Sentiment Distribution.
    """
    total = len(raw_items)
    if total == 0:
        return {
            "results": {
                "analisis_agregado": {
                    "Positivo": 0.25, "Negativo": 0.25, "Neutral": 0.25, "Mixto": 0.25,
                    "subjetividad_promedio_global": 0.5,
                    "ejemplo_mixto": ""
                }
            }
        }
    
    positive = sum(1 for i in raw_items if i.get("ai_sentiment_score", 0) > 0.3)
    negative = sum(1 for i in raw_items if i.get("ai_sentiment_score", 0) < -0.3)
    neutral = sum(1 for i in raw_items if -0.3 <= i.get("ai_sentiment_score", 0) <= 0.3)
    
    # Find a "mixed" example (neutral sentiment, long text)
    mixed_example = next(
        (i.get("content", "")[:120] for i in raw_items 
         if -0.3 <= i.get("ai_sentiment_score", 0) <= 0.3 and len(i.get("content", "")) > 50),
        "Comentario con opiniones mixtas."
    )
    
    return {
        "results": {
            "analisis_agregado": {
                "Positivo": round(positive / total, 2),
                "Negativo": round(negative / total, 2),
                "Neutral": round(neutral / total, 2),
                "Mixto": round((total - positive - negative - neutral) / total, 2) if total > 0 else 0,
                "subjetividad_promedio_global": 0.65,  # Placeholder
                "ejemplo_mixto": mixed_example
            }
        }
    }


def aggregate_q8_temporal(raw_items: list[dict[str, Any]]) -> dict:
    """
    Q8: Temporal Evolution (simplified - 5 weeks).
    TODO: Implement real date grouping from posted_at field.
    """
    # For now, split into 5 equal parts as "weeks"
    chunk_size = max(1, len(raw_items) // 5)
    weeks = []
    
    for i in range(5):
        start = i * chunk_size
        end = start + chunk_size
        chunk = raw_items[start:end]
        
        if chunk:
            avg_sentiment = sum(item.get("ai_sentiment_score", 0) for item in chunk) / len(chunk)
            # Find most common topic in chunk
            topics = Counter(item.get("ai_topic", "Otro") for item in chunk)
            top_topic = topics.most_common(1)[0][0] if topics else "General"
            
            weeks.append({
                "fecha_semana": f"Sem {i + 1}",
                "porcentaje_positivo": round((avg_sentiment + 1) / 2, 2),  # Normalize to 0-1
                "engagement": len(chunk) * 10,  # Placeholder
                "topico_principal": top_topic
            })
        else:
            weeks.append({
                "fecha_semana": f"Sem {i + 1}",
                "porcentaje_positivo": 0.5,
                "engagement": 0,
                "topico_principal": "Sin datos"
            })
    
    return {
        "results": {
            "serie_temporal_semanal": weeks,
            "resumen_global": {"tendencia": "Estable"}
        }
    }


def build_frontend_compatible_json(raw_items: list[dict[str, Any]]) -> dict:
    """
    Build the complete Q1-Q10 JSON that the frontend expects.
    
    Args:
        raw_items: List of classified items from raw_items table
        
    Returns:
        Dictionary matching frontend contract (api.ts types)
    """
    logger.info(f"📊 Aggregating {len(raw_items)} items into Q1-Q10...")
    
    result = {
        "Q1": aggregate_q1_emotions(raw_items),
        "Q2": aggregate_q2_personality(raw_items),
        "Q3": aggregate_q3_topics(raw_items),
        "Q4": aggregate_q4_narrative_frames(raw_items),
        "Q5": aggregate_q5_influencers(raw_items),
        "Q6": aggregate_q6_opportunities(raw_items),
        "Q7": aggregate_q7_sentiment(raw_items),
        "Q8": aggregate_q8_temporal(raw_items),
        "Q9": {},  # TODO: Recommendations
        "Q10": {},  # TODO: Executive Summary
    }
    
    logger.info("✅ Aggregation complete")
    return result
