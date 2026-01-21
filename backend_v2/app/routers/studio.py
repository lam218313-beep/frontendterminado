from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Any
from ..services.context_builder import context_builder
import logging

router = APIRouter(
    prefix="/api/v2/studio",
    tags=["Image Studio V2"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

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
