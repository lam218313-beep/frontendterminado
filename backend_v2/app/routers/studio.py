from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from ..services.context_builder import context_builder
from ..services.nanobanana_service import nanobanana_service
from ..services.database import db
import logging
import uuid
import base64

router = APIRouter(
    prefix="/studio",
    tags=["Image Studio"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)


# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class BrandVisualDNACreate(BaseModel):
    """Schema for creating/updating brand visual DNA"""
    color_primary_name: Optional[str] = None
    color_primary_hex: Optional[str] = None
    color_secondary_name: Optional[str] = None
    color_secondary_hex: Optional[str] = None
    color_accent_name: Optional[str] = None
    color_accent_hex: Optional[str] = None
    default_style: str = "natural"
    default_lighting: str = "studio"
    default_mood: str = "professional"
    default_resolution: str = "2K"
    preferred_archetypes: List[str] = ["lifestyle"]
    always_exclude: List[str] = ["text", "watermarks", "logos", "words"]
    brand_essence: Optional[str] = None
    visual_keywords: List[str] = []
    industry_leader_instagram: Optional[str] = None
    industry_leader_name: Optional[str] = None


class GenerateImageRequest(BaseModel):
    """Schema for image generation request"""
    task_id: str  # REQUIRED - must link to a task
    template_id: Optional[str] = None
    reference_image_ids: List[str] = []
    product_image_id: Optional[str] = None
    custom_prompt: str = ""
    aspect_ratio: Optional[str] = None
    resolution: str = "2K"
    use_pro_model: bool = False


# =============================================================================
# CONTEXT ENDPOINTS (Step 1 - existing)
# =============================================================================

@router.get("/context/{client_id}")
async def get_client_context(client_id: str) -> Dict[str, Any]:
    """
    Retrieves the segmented context blocks for a specific client to be used in the Studio Wizard Step 1.
    """
    try:
        blocks = await context_builder.get_client_context_blocks(client_id)
        if not blocks["interview"] and not blocks["analysis"]:
             logger.warning(f"No context found for client {client_id}")
             # We return empty blocks rather than 404 to allow the UI to show an empty state or manual input
        
        return {
            "data": {
                "interviewBlocks": blocks["interview"],
                "brandBlocks": blocks["manual"], # Currently empty placeholder
                "analysisBlocks": blocks["analysis"]
            }
        }
    except Exception as e:
        logger.error(f"Error fetching studio context for client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# BRAND VISUAL DNA ENDPOINTS (Step 1 - Setup)
# =============================================================================

@router.get("/brand-dna/{client_id}")
async def get_brand_visual_dna(client_id: str) -> Dict[str, Any]:
    """Get brand visual DNA configuration for a client"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        logger.info(f"📥 Fetching brand DNA for client: {client_id}")
        
        response = db.client.table("brand_visual_dna")\
            .select("*")\
            .eq("client_id", client_id)\
            .limit(1)\
            .execute()
        
        logger.info(f"📤 Response: {response}")
        
        # Get first result or None (equivalent to maybeSingle in JS)
        data = response.data[0] if response.data else None
        
        return {
            "data": data,
            "exists": data is not None,
            "is_configured": data.get("is_configured", False) if data else False
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"❌ Error fetching brand DNA for {client_id}: {e}")
        logger.error(f"❌ Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


@router.post("/brand-dna/{client_id}")
async def upsert_brand_visual_dna(client_id: str, dna: BrandVisualDNACreate) -> Dict[str, Any]:
    """Create or update brand visual DNA for a client"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Log incoming data for debugging
        logger.info(f"📥 Received brand DNA for client {client_id}")
        logger.info(f"📥 DNA payload: {dna.dict()}")
        
        payload = {
            "client_id": client_id,
            **dna.dict(),
            "is_configured": True
        }
        
        logger.info(f"📤 Upserting payload: {payload}")
        
        response = db.client.table("brand_visual_dna")\
            .upsert(payload, on_conflict="client_id")\
            .execute()
        
        logger.info(f"✅ Brand DNA saved for client {client_id}, response: {response}")
        return {"data": response.data[0] if response.data else payload, "status": "success"}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"❌ Error saving brand DNA for {client_id}: {e}")
        logger.error(f"❌ Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


# =============================================================================
# IMAGE BANK ENDPOINTS (Step 2 - Setup)
# =============================================================================

@router.get("/image-bank/{client_id}")
async def get_image_bank(
    client_id: str,
    category: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """Get images from the brand image bank"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        query = db.client.table("brand_image_bank")\
            .select("*")\
            .eq("client_id", client_id)\
            .eq("is_approved", True)\
            .eq("is_archived", False)\
            .order("is_favorite", desc=True)\
            .order("usage_count", desc=True)\
            .limit(limit)
        
        if category:
            query = query.eq("category", category)
        
        response = query.execute()
        
        return {
            "data": response.data or [],
            "total": len(response.data) if response.data else 0
        }
    except Exception as e:
        logger.error(f"Error fetching image bank for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image-bank/{client_id}/upload")
async def upload_to_image_bank(
    client_id: str,
    file: UploadFile = File(...),
    category: str = Form("reference"),
    name: Optional[str] = Form(None),
    tags: Optional[str] = Form(None)  # Comma-separated
) -> Dict[str, Any]:
    """Upload an image to the brand image bank"""
    try:
        if not db.client and not db.admin_client:
            raise HTTPException(status_code=500, detail="Storage not configured")
        
        # Read file
        file_content = await file.read()
        file_size = len(file_content)
        
        # Generate ID and path
        image_id = str(uuid.uuid4())
        storage_path = f"image_bank/{client_id}/{category}/{image_id}.jpg"
        
        # Upload to storage
        storage_client = db.admin_client or db.client
        storage_client.storage.from_("generated-images").upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": file.content_type or "image/jpeg", "upsert": "true"}
        )
        
        # Get public URL
        image_url = storage_client.storage.from_("generated-images").get_public_url(storage_path)
        
        # Save to database
        record = {
            "id": image_id,
            "client_id": client_id,
            "image_url": image_url,
            "storage_path": storage_path,
            "category": category,
            "source": "manual_upload",
            "name": name or file.filename,
            "tags": tags.split(",") if tags else [],
            "file_size_bytes": file_size,
            "mime_type": file.content_type or "image/jpeg",
            "is_approved": True
        }
        
        response = db.client.table("brand_image_bank").insert(record).execute()
        
        logger.info(f"✅ Image uploaded to bank: {image_id}")
        return {"data": response.data[0] if response.data else record, "status": "success"}
    except Exception as e:
        logger.error(f"Error uploading to image bank: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/image-bank/{image_id}")
async def delete_from_image_bank(image_id: str) -> Dict[str, Any]:
    """Delete (archive) an image from the bank"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Soft delete (archive)
        db.client.table("brand_image_bank")\
            .update({"is_archived": True})\
            .eq("id", image_id)\
            .execute()
        
        return {"status": "success", "message": "Image archived"}
    except Exception as e:
        logger.error(f"Error archiving image {image_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/image-bank/{image_id}/favorite")
async def toggle_favorite(image_id: str, is_favorite: bool = True) -> Dict[str, Any]:
    """Toggle favorite status of an image"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        db.client.table("brand_image_bank")\
            .update({"is_favorite": is_favorite})\
            .eq("id", image_id)\
            .execute()
        
        return {"status": "success", "is_favorite": is_favorite}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# PENDING TASKS ENDPOINTS (Step 3 - Task Selection)
# =============================================================================

@router.get("/pending-tasks/{client_id}")
async def get_pending_tasks(client_id: str) -> Dict[str, Any]:
    """Get tasks that need image generation"""
    try:
        tasks = await nanobanana_service.get_pending_tasks(client_id)
        return {"data": tasks, "total": len(tasks)}
    except Exception as e:
        logger.error(f"Error fetching pending tasks for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# TEMPLATES ENDPOINTS (Step 4 - Template Selection)
# =============================================================================

@router.get("/templates")
async def get_generation_templates(category: Optional[str] = None) -> Dict[str, Any]:
    """Get available generation templates"""
    try:
        templates = await nanobanana_service.get_templates(category)
        return {"data": templates, "total": len(templates)}
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# GENERATION ENDPOINTS (Step 5 - Generate)
# =============================================================================

@router.post("/generate")
async def generate_image(request: GenerateImageRequest) -> Dict[str, Any]:
    """
    Generate an image for a task using NanoBanana.
    
    IMPORTANT: task_id is required - all generations must be linked to a planning task.
    """
    try:
        if not request.task_id:
            raise HTTPException(
                status_code=400, 
                detail="task_id is required - image generation must be linked to a planning task"
            )
        
        result = await nanobanana_service.generate_for_task(
            task_id=request.task_id,
            template_id=request.template_id,
            reference_image_ids=request.reference_image_ids,
            product_image_id=request.product_image_id,
            custom_prompt=request.custom_prompt,
            aspect_ratio=request.aspect_ratio,
            resolution=request.resolution,
            use_pro_model=request.use_pro_model
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/generated/{task_id}")
async def get_generated_images_for_task(task_id: str) -> Dict[str, Any]:
    """Get all generated images for a specific task"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        response = db.client.table("generated_images")\
            .select("*")\
            .eq("task_id", task_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {"data": response.data or [], "total": len(response.data) if response.data else 0}
    except Exception as e:
        logger.error(f"Error fetching generated images for task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/approve/{image_id}")
async def approve_image_for_task(image_id: str) -> Dict[str, Any]:
    """Approve and select an image for a task, closing the generation loop"""
    try:
        if not db.client:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Get the image to find its task_id
        img_response = db.client.table("generated_images")\
            .select("task_id")\
            .eq("id", image_id)\
            .single()\
            .execute()
        
        if not img_response.data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        task_id = img_response.data.get("task_id")
        
        # Mark image as selected
        db.client.table("generated_images")\
            .update({"is_selected": False})\
            .eq("task_id", task_id)\
            .execute()
        
        db.client.table("generated_images")\
            .update({"is_selected": True})\
            .eq("id", image_id)\
            .execute()
        
        # Update task status to approved
        db.client.table("tasks")\
            .update({
                "generation_status": "approved",
                "approved_image_id": image_id,
                "selected_image_id": image_id
            })\
            .eq("id", task_id)\
            .execute()
        
        logger.info(f"✅ Image {image_id} approved for task {task_id}")
        return {"status": "success", "message": "Image approved and task updated"}
    except Exception as e:
        logger.error(f"Error approving image {image_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
