
import logging
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Any

from ..config import settings
from ..services.database import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/brand", tags=["Brand Identity"])

# --- Models ---
class BrandColors(BaseModel):
    primary: str
    secondary: str
    accent: str
    background: str

class BrandTone(BaseModel):
    trait: str
    description: str

class BrandIdentity(BaseModel):
    mission: str
    vision: str
    values: List[dict] # {title: str, desc: str}
    tone_traits: List[BrandTone]
    archetype: str
    colors: Optional[dict] = {}
    typography: Optional[dict] = {}
    logo_url: Optional[str] = None
    stationery_url: Optional[str] = None



# --- Prompts ---


# --- Endpoints ---

@router.get("/{client_id}")
async def get_brand(client_id: str):
    data = db.get_brand_identity(client_id)
    if not data:
        return {"status": "empty", "data": None}
    return {"status": "success", "data": data}

@router.put("/{client_id}")
async def update_brand(client_id: str, identity: BrandIdentity):
    try:
        data = identity.model_dump()
        db.update_brand_identity(client_id, data)
        return {"status": "success", "message": "Brand identity updated"}
    except Exception as e:
        logger.error(f"Error updating brand for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


