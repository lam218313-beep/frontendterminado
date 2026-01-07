
import logging
from fastapi import APIRouter, HTTPException
from ..services.database import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/semantic", tags=["Analysis"])

@router.get("/analysis/{client_id}") # Quitamos response_model para flexibilidad
async def get_latest_analysis(client_id: str):
    """
    Recupera el último análisis completado desde Supabase.
    """
    report = db.get_latest_completed_report(client_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="No analysis found")
    
    return report.get("frontend_compatible_json", {})

@router.get("/clients")
async def get_clients_for_analysis():
    # Mock temporal, idealmente leer de tabla 'clients' en Supabase
    return []

@router.get("/context/{client_id}")
async def get_context_status(client_id: str):
    """
    Verifica el estado real en Supabase.
    """
    client_status = db.get_client_status(client_id)
    status = client_status.get("status")
    
    # Mapeamos el estado de DB a lo que espera el Frontend
    frontend_status = "no_context"
    if status == "COMPLETED":
        frontend_status = "active"
    elif status in ["PROCESSING", "SCRAPING", "CLASSIFYING", "AGGREGATING"]:
        if status == "SCRAPING":
            frontend_status = "scraping"
        elif status == "CLASSIFYING":
            frontend_status = "classifying"
        elif status == "AGGREGATING":
            frontend_status = "aggregating"
        else:
            frontend_status = "processing"
    
    return {
        "status": frontend_status,
        "context_id": client_id,
        "cache_active": status == "COMPLETED",
        "files": []
    }
