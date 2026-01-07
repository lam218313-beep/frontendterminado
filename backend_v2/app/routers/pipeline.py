"""
Pipeline Router
================
Endpoints for starting and monitoring analysis pipelines.
"""

import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from ..services import apify_service, gemini_service, aggregator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])


# ============================================================================
# Request/Response Models
# ============================================================================

class PipelineStartRequest(BaseModel):
    """Request to start the analysis pipeline."""
    client_id: str
    instagram_url: str
    comments_limit: int = 1000


class PipelineStartResponse(BaseModel):
    """Response after starting the pipeline."""
    status: str
    report_id: str
    message: str


class PipelineStatusResponse(BaseModel):
    """Response for pipeline status check."""
    report_id: str
    status: str  # PROCESSING, COMPLETED, ERROR
    progress: int
    message: Optional[str] = None


# ============================================================================
# In-memory state (replace with Supabase in production)
# ============================================================================

_pipeline_state: dict[str, dict] = {}


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/start", response_model=PipelineStartResponse)
async def start_pipeline(
    request: PipelineStartRequest,
    background_tasks: BackgroundTasks
):
    """
    Start a new analysis pipeline.
    
    1. Creates a report record
    2. Launches background task for Apify -> Gemini -> Aggregation
    3. Returns immediately with report_id
    """
    import uuid
    report_id = str(uuid.uuid4())
    
    # Initialize state
    _pipeline_state[report_id] = {
        "status": "PROCESSING",
        "progress": 0,
        "message": "Iniciando pipeline...",
        "client_id": request.client_id,
        "instagram_url": request.instagram_url,
        "result": None,
        "error": None
    }
    
    # Launch background task
    background_tasks.add_task(
        _run_full_pipeline,
        report_id=report_id,
        instagram_url=request.instagram_url,
        comments_limit=request.comments_limit
    )
    
    logger.info(f"🚀 Pipeline started: {report_id}")
    
    return PipelineStartResponse(
        status="accepted",
        report_id=report_id,
        message="Pipeline started. Poll /pipeline/status/{report_id} for updates."
    )


@router.get("/status/{report_id}", response_model=PipelineStatusResponse)
async def get_pipeline_status(report_id: str):
    """Get the current status of a pipeline."""
    state = _pipeline_state.get(report_id)
    
    if not state:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return PipelineStatusResponse(
        report_id=report_id,
        status=state["status"],
        progress=state["progress"],
        message=state.get("message")
    )


@router.get("/result/{report_id}")
async def get_pipeline_result(report_id: str):
    """
    Get the final result of a completed pipeline.
    Returns the frontend-compatible Q1-Q10 JSON.
    """
    state = _pipeline_state.get(report_id)
    
    if not state:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if state["status"] == "PROCESSING":
        raise HTTPException(status_code=202, detail="Pipeline still processing")
    
    if state["status"] == "ERROR":
        raise HTTPException(status_code=500, detail=state.get("error", "Unknown error"))
    
    return state["result"]


# ============================================================================
# Background Pipeline Task
# ============================================================================

async def _run_full_pipeline(
    report_id: str,
    instagram_url: str,
    comments_limit: int = 1000
):
    """
    Execute the full pipeline:
    1. Scrape Instagram via Apify (posts + embedded comments)
    2. Classify all content via Gemini
    3. Aggregate into Q1-Q10 format
    """
    state = _pipeline_state[report_id]
    
    try:
        # Step 1: Scrape profile with posts and comments
        state["progress"] = 10
        state["message"] = "Extrayendo posts y comentarios de Instagram..."
        logger.info(f"📥 [{report_id}] Step 1: Scraping Instagram")
        
        # Use the comprehensive scraping function
        scrape_result = await apify_service.scrape_instagram_profile_with_posts_and_comments(
            profile_url=instagram_url,
            posts_limit=min(50, comments_limit // 20),  # Reasonable post limit
            comments_per_post=100
        )
        
        all_content = scrape_result.get("all_comments", [])
        stats = scrape_result.get("stats", {})
        
        if not all_content:
            raise ValueError(f"No content retrieved from Instagram. Stats: {stats}")
        
        logger.info(f"📦 [{report_id}] Retrieved {len(all_content)} items ({stats})")
        
        # Step 2: Normalize content for classification
        state["progress"] = 30
        state["message"] = f"Preparando {len(all_content)} elementos para clasificación..."
        
        normalized_items = [
            apify_service.normalize_comment_for_classification(item)
            for item in all_content
        ]
        
        # Extract text for Gemini
        texts_to_classify = [item["content"] for item in normalized_items if item["content"]]
        
        if not texts_to_classify:
            raise ValueError("No text content found for classification")
        
        # Step 3: Classify with Gemini
        state["progress"] = 40
        state["message"] = f"Clasificando {len(texts_to_classify)} textos con Gemini..."
        logger.info(f"🧠 [{report_id}] Step 2: Classifying with Gemini")
        
        classifications = await gemini_service.classify_comments_batch(texts_to_classify)
        
        logger.info(f"✅ [{report_id}] Classified {len(classifications)} items")
        
        # Step 4: Merge classifications with original data
        state["progress"] = 70
        state["message"] = "Fusionando datos y clasificaciones..."
        
        raw_items = []
        classification_map = {c["idx"]: c for c in classifications}
        
        for i, normalized in enumerate(normalized_items):
            if i in classification_map:
                classification = classification_map[i]
                raw_items.append({
                    **normalized,
                    "ai_emotion": classification.get("emotion", "Otro"),
                    "ai_personality": classification.get("personality", "Sinceridad"),
                    "ai_topic": classification.get("topic", "Otro"),
                    "ai_sentiment_score": classification.get("sentiment_score", 0.0)
                })
        
        logger.info(f"🔗 [{report_id}] Merged {len(raw_items)} items")
        
        # Step 5: Aggregate into Q1-Q10
        state["progress"] = 90
        state["message"] = "Calculando métricas Q1-Q10..."
        logger.info(f"📊 [{report_id}] Step 3: Aggregating")
        
        result = aggregator.build_frontend_compatible_json(raw_items)
        
        # Add scrape stats to result
        result["_meta"] = {
            "source": instagram_url,
            "scraped_posts": stats.get("total_posts", 0),
            "scraped_items": len(raw_items),
            "classified_items": len(classifications)
        }
        
        # Done!
        state["status"] = "COMPLETED"
        state["progress"] = 100
        state["message"] = "Análisis completado"
        state["result"] = result
        
        logger.info(f"✅ [{report_id}] Pipeline completed successfully")
        
    except Exception as e:
        logger.error(f"❌ [{report_id}] Pipeline failed: {e}", exc_info=True)
        state["status"] = "ERROR"
        state["error"] = str(e)
        state["message"] = f"Error: {str(e)}"

