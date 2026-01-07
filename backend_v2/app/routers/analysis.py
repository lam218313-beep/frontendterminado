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

# ============================================================================
from ..models.schemas import AnalysisResult
from ..services.database import db

router = APIRouter(
    prefix="/semantic/analysis",
    tags=["Analysis"]
)

# ============================================================================
# Legacy-compatible Endpoints
# ============================================================================

@router.get("/{client_id}", response_model=AnalysisResult)
async def get_latest_analysis(client_id: str):
    """
    Retrieves the latest completed analysis for a given client.
    Returns the frontend-compatible Q1-Q10 JSON.
    """
    report = db.get_latest_completed_report(client_id)

    if not report:
        raise HTTPException(status_code=404, detail="No analysis found")
    
    # Return the stored JSON result
    # We assume 'frontend_compatible_json' is stored in the report
    return report.get("frontend_compatible_json", {})


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
    Verifica en Supabase si hay un análisis activo o terminado.
    El frontend usa esto para decidir si mostrar gráficos o botón de carga.
    """
    # Consultamos DB en lugar de memoria
    client_status = db.get_client_status(client_id)
    status = client_status.get("status")
    
    return {
        "status": "active" if status == "COMPLETED" else ("processing" if status == "PROCESSING" else "no_context"),
        "context_id": client_id,
        "cache_active": status == "COMPLETED", 
        "files": []
    }
