"""
Clients Router
==============
CRUD endpoints for client management.
Uses Supabase for persistence.
"""

import logging
from typing import Optional, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clients", tags=["Clients"])


# ============================================================================
# Models
# ============================================================================

class ClientCreate(BaseModel):
    """Request to create a new client."""
    brand_name: str
    industry: Optional[str] = None


class ClientResponse(BaseModel):
    """Client response model."""
    id: str
    nombre: str  # Frontend compatibility
    industry: Optional[str] = None
    is_active: bool = True
    created_at: Optional[Any] = None  # Allow any for datetime serialization
    
    class Config:
        from_attributes = True


# ============================================================================
# Endpoints
# ============================================================================

@router.get("", response_model=list[ClientResponse])
async def list_clients():
    """List all clients from Supabase."""
    return db.list_clients()


@router.post("", response_model=ClientResponse)
async def create_client(request: ClientCreate):
    """Create a new client in Supabase."""
    import uuid
    client_id = str(uuid.uuid4())
    
    # Prepare data for DB
    client_data = {
        "id": client_id,
        "nombre": request.brand_name,
        "industry": request.industry,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Insert using service
    db.create_client(client_data)
    logger.info(f"✅ Created client persistent: {request.brand_name}")
    
    return client_data


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str):
    """Get a specific client from Supabase."""
    client = db.get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.delete("/{client_id}")
async def delete_client(client_id: str):
    """Delete a client from Supabase."""
    existing = db.get_client(client_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete_client(client_id)
    logger.info(f"🗑️ Deleted client persistent: {client_id}")
    
    return {"message": "Client deleted successfully"}
