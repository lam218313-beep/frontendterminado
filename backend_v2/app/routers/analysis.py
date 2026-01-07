"""
Analysis Router
================
Endpoints for retrieving analysis results.
Compatible with existing frontend API contract.
"""

import logging

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/semantic", tags=["Analysis"])


# Import pipeline state to access results
from .pipeline import _pipeline_state


# ============================================================================
# Legacy-compatible Endpoints
# ============================================================================

@router.get("/analysis/{client_id}")
async def get_latest_analysis(client_id: str):
    """
    Get the latest completed analysis for a client.
    
    This endpoint is compatible with the existing frontend API contract.
    Returns the Q1-Q10 JSON structure expected by the frontend.
    """
    # Find the most recent completed report for this client
    completed_reports = [
        (report_id, state)
        for report_id, state in _pipeline_state.items()
        if state.get("client_id") == client_id and state.get("status") == "COMPLETED"
    ]
    
    if not completed_reports:
        raise HTTPException(
            status_code=404, 
            detail="No completed analysis found for this client. Run a pipeline first."
        )
    
    # Get the latest (in practice, we'd sort by timestamp)
    _, latest_state = completed_reports[-1]
    
    return {
        "status": "success",
        **latest_state["result"]
    }


@router.get("/clients")
async def get_clients_for_analysis():
    """
    List clients available for analysis.
    Frontend compatibility endpoint.
    """
    from .clients import _clients
    
    return [
        {"id": c["id"], "nombre": c["nombre"], "industry": c.get("industry")}
        for c in _clients.values()
    ]


@router.get("/context/{client_id}")
async def get_context_status(client_id: str):
    """
    Get context status for a client.
    Returns whether there's an active analysis.
    """
    # Check if there's any report for this client
    client_reports = [
        state for state in _pipeline_state.values()
        if state.get("client_id") == client_id
    ]
    
    if not client_reports:
        return {
            "status": "no_context",
            "message": "No analysis found. Start a pipeline first.",
            "files": [],
            "cache_active": False
        }
    
    latest = client_reports[-1]
    
    return {
        "status": "active" if latest["status"] == "COMPLETED" else "processing",
        "context_id": client_id,
        "cache_active": latest["status"] == "COMPLETED",
        "last_updated": None,  # TODO: Add timestamp
        "files": []
    }
