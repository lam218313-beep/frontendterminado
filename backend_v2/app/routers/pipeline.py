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
from ..services.database import db

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
# Endpoints
# ============================================================================

@router.post("/start", response_model=PipelineStartResponse)
async def start_pipeline(request: PipelineStartRequest, background_tasks: BackgroundTasks):
    """
    Starts the analysis pipeline in the background.
    Returns immediately with a report_id.
    """
    import uuid
    report_id = str(uuid.uuid4())
    
    # 1. Create initial report entry in Supabase
    db.create_report(report_id, request.client_id, status="PROCESSING")

    # 2. Launch background task
    background_tasks.add_task(
        _run_full_pipeline, 
        report_id=report_id, 
        instagram_url=request.instagram_url,
        comments_limit=request.comments_limit
    )

    return PipelineStartResponse(
        report_id=report_id,
        status="PROCESSING",
        message="Pipeline started. Check Supabase for updates."
    )

@router.get("/status/{report_id}")
async def get_pipeline_status(report_id: str):
    """
    Checks the status of a specific pipeline run.
    Note: For production, this should query the DB. 
    Here we return a simplified status or refer to the specific analysis endpoint.
    """
    # This endpoint is less critical if we rely on /semantic/analysis/{client_id}
    # But to support it properly, we'd need a get_report_by_id in database.py
    return {"status": "Please check /semantic/analysis/{client_id} for results"}

@router.get("/result/{report_id}")
async def get_pipeline_result(report_id: str):
    """
    Gets the result of a specific pipeline run.
    """
    return {"status": "Please use /semantic/analysis/{client_id}"}


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
    4. Save result to Supabase
    """
    try:
        logger.info(f"🚀 [{report_id}] Pipeline STARTED for {instagram_url}")
        db.update_report_status(report_id, "PROCESSING", message="Starting pipeline...")
        
        # Step 1: Scrape Instagram
        db.update_report_status(report_id, "PROCESSING", progress=10, message="Extrayendo posts y comentarios de Instagram...")
        logger.info(f"📥 [{report_id}] Getting Instagram data...")
        
        scrape_result = await apify_service.scrape_instagram_profile_with_posts_and_comments(
            profile_url=instagram_url,
            posts_limit=min(50, comments_limit // 20),
            comments_per_post=100
        )
        
        all_content = scrape_result.get("all_comments", [])
        stats = scrape_result.get("stats", {})
        
        if not all_content:
            raise ValueError(f"No content retrieved. Stats: {stats}")
            
        logger.info(f"📦 [{report_id}] Scraped {len(all_content)} items")

        # Step 2: Normalize and Classify
        db.update_report_status(report_id, "PROCESSING", progress=30, message=f"Preparando {len(all_content)} elementos para clasificación...")
        normalized_items = [
            apify_service.normalize_comment_for_classification(item)
            for item in all_content
        ]
        
        texts_to_classify = [item["content"] for item in normalized_items if item["content"]]
        
        db.update_report_status(report_id, "PROCESSING", progress=40, message=f"Clasificando {len(texts_to_classify)} textos con Gemini...")
        logger.info(f"🧠 [{report_id}] Classifying {len(texts_to_classify)} items...")
        classifications = await gemini_service.classify_comments_batch(texts_to_classify)
        
        # Merge classifications
        db.update_report_status(report_id, "PROCESSING", progress=70, message="Fusionando datos y clasificaciones...")
        raw_items = []
        classification_map = {c["idx"]: c for c in classifications}
        for i, normalized in enumerate(normalized_items):
            if i in classification_map:
                c = classification_map[i]
                raw_items.append({
                    **normalized,
                    "ai_emotion": c.get("emotion", "Otro"),
                    "ai_personality": c.get("personality", "Sinceridad"),
                    "ai_topic": c.get("topic", "Otro"),
                    "ai_sentiment_score": c.get("sentiment_score", 0.0)
                })

        # Step 3: Aggregate
        db.update_report_status(report_id, "PROCESSING", progress=90, message="Calculando métricas Q1-Q10...")
        logger.info(f"📊 [{report_id}] Aggregating results...")
        result_json = aggregator.build_frontend_compatible_json(raw_items)
        
        # Add metadata
        result_json["_meta"] = {
            "source": instagram_url,
            "scraped_posts": stats.get("total_posts", 0),
            "scraped_items": len(raw_items),
            "classified_items": len(classifications)
        }

        # FINAL: Update DB to COMPLETED
        db.update_report_status(report_id, "COMPLETED", progress=100, message="Análisis completado", result=result_json)
        logger.info(f"✅ [{report_id}] Pipeline FINISHED and saved to DB.")

    except Exception as e:
        logger.error(f"❌ [{report_id}] Pipeline FAILED: {e}", exc_info=True)
        # FINAL: Update DB to ERROR
        db.update_report_status(report_id, "ERROR", progress=0, message=f"Error: {str(e)}", error=str(e))
```
