
import logging
import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from ..services.database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clients", tags=["Interview"])

@router.put("/{client_id}/interview")
async def save_interview_data(
    client_id: str,
    data: str = Form(...),  # Expecting JSON string
    file: Optional[UploadFile] = File(None)
):
    """
    Receives interview data as JSON string and an optional file.
    Saves to Supabase.
    """
    try:
        # 1. Parse JSON data
        try:
            parsed_data = json.loads(data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format in 'data' field")

        # 2. Handle File (Upload to Supabase Storage - Placeholder for now)
        # TODO: Implement actual Storage upload if needed. 
        # For now, we just note the filename if present.
        file_url = None
        if file:
            logger.info(f"Received file: {file.filename} ({file.content_type})")
            # Mock upload: In real usage, use supabase.storage.from('bucket').upload(...)
            # file_url = f"https://.../{file.filename}" 
            # We will just save the filename for reference in the DB json for now
            parsed_data["attached_file_name"] = file.filename

        # 3. Save to DB
        db.save_interview(client_id, parsed_data, file_url)

        return {"status": "success", "message": "Interview data saved successfully"}

    except Exception as e:
        logger.error(f"Error saving interview for client {client_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}/interview")
async def get_interview_data(client_id: str):
    """
    Retrieves the latest interview data.
    """
    result = db.get_interview(client_id)
    if not result:
        # Return empty structure if not found, to avoid frontend crashes
        return {"data": {}}
    
    return {
        "id": result.get("id"),
        "data": result.get("data"),
        "created_at": result.get("created_at")
    }
