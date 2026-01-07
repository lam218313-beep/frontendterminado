"""
Clients Router
==============
CRUD endpoints for client management.
Uses Supabase for persistence (placeholder implementation).
"""

import logging
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
    created_at: Optional[str] = None


# ============================================================================
# In-memory storage (replace with Supabase)
# ============================================================================

_clients: dict[str, dict] = {
    "demo-client-1": {
        "id": "demo-client-1",
        "nombre": "Demo Brand",
        "industry": "Tecnología",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
}


# ============================================================================
# Endpoints
# ============================================================================

@router.get("", response_model=list[ClientResponse])
async def list_clients():
    """List all clients."""
    return list(_clients.values())


@router.post("", response_model=ClientResponse)
async def create_client(request: ClientCreate):
    """Create a new client."""
    import uuid
    client_id = str(uuid.uuid4())
    
    client = {
        "id": client_id,
        "nombre": request.brand_name,
        "industry": request.industry,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    _clients[client_id] = client
    logger.info(f"✅ Created client: {request.brand_name}")
    
    return client


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str):
    """Get a specific client."""
    client = _clients.get(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.delete("/{client_id}")
async def delete_client(client_id: str):
    """Delete a client."""
    if client_id not in _clients:
        raise HTTPException(status_code=404, detail="Client not found")
    
    del _clients[client_id]
    logger.info(f"🗑️ Deleted client: {client_id}")
    
    return {"message": "Client deleted successfully"}
