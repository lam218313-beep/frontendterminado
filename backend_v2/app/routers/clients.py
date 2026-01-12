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
    plan: str = "free_trial"  # free_trial, lite, basic, pro, premium


class ClientResponse(BaseModel):
    """Client response model."""
    id: str
    nombre: str  # Frontend compatibility
    industry: Optional[str] = None
    plan: str = "free_trial"
    is_active: bool = True
    created_at: Optional[Any] = None  # Allow any for datetime serialization
    
    class Config:
        from_attributes = True


class ClientUpdate(BaseModel):
    """Request to update client info."""
    nombre: Optional[str] = None
    industry: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None


class ClientStatus(BaseModel):
    """Client setup status."""
    hasInterview: bool
    hasBrandIdentity: bool
    canExecuteAnalysis: bool
    lastAnalysisDate: Optional[str] = None
    analysisStatus: Optional[str] = None


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
        "plan": request.plan,
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


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: str, request: ClientUpdate):
    """Update client information."""
    existing = db.get_client(client_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Prepare updates
    updates = request.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    db.update_client(client_id, updates)
    logger.info(f"✏️ Updated client: {client_id}")
    
    # Return updated client
    updated = db.get_client(client_id)
    return updated


@router.get("/{client_id}/status", response_model=ClientStatus)
async def get_client_status(client_id: str):
    """Get client setup status (interview, brand, analysis readiness)."""
    # Verify client exists
    client = db.get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check interview completion
    interview = db.get_interview(client_id)
    has_interview = interview is not None
    
    # Check brand identity completion
    brand = db.get_brand_identity(client_id)
    has_brand = bool(brand and brand.get('mission'))  # Check if has actual data
    
    # Determine if can execute analysis
    plan = client.get('plan', 'free_trial')
    can_execute = False
    
    if plan == 'free_trial':
        # Free trial only needs interview
        can_execute = has_interview
    else:
        # Other plans need both interview AND brand
        can_execute = has_interview and has_brand
    
    # Get latest analysis status (placeholder for now)
    latest_analysis = db.get_latest_completed_report(client_id)
    last_date = None
    analysis_status = None
    
    if latest_analysis:
        last_date = latest_analysis.get('created_at')
        analysis_status = 'completed'
    
    return ClientStatus(
        hasInterview=has_interview,
        hasBrandIdentity=has_brand,
        canExecuteAnalysis=can_execute,
        lastAnalysisDate=last_date,
        analysisStatus=analysis_status
    )


@router.delete("/{client_id}")
async def delete_client(client_id: str):
    """Delete a client from Supabase."""
    existing = db.get_client(client_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete_client(client_id)
    logger.info(f"🗑️ Deleted client persistent: {client_id}")
    
    return {"message": "Client deleted successfully"}
