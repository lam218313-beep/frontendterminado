
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from ..services.database import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/strategy", tags=["Strategy"])

# --- Models ---
class StrategyNode(BaseModel):
    id: str
    type: str # 'main', 'secondary', 'post'
    label: str
    description: Optional[str] = ""
    parentId: Optional[str] = None # Frontend sends 'parentId', DB col is 'parent_id', we map it manually or via alias
    x: float
    y: float
    
    # We might need to handle transformation to snake_case for DB
    
class StrategySyncRequest(BaseModel):
    client_id: str
    nodes: List[StrategyNode]

# --- Endpoints ---

@router.get("/{client_id}", response_model=List[dict])
async def get_strategy(client_id: str):
    """
    Get the full strategy map for a client.
    """
    nodes = db.get_strategy_nodes(client_id)
    
    # Transform DB snake_case to Frontend camelCase
    # DB: parent_id -> Frontend: parentId
    frontend_nodes = []
    for n in nodes:
        frontend_nodes.append({
            "id": n["id"],
            "type": n["type"],
            "label": n["label"],
            "description": n["description"],
            "parentId": n["parent_id"],
            "x": n["x"],
            "y": n["y"]
        })
        
    return frontend_nodes

@router.post("/sync")
async def sync_strategy(request: StrategySyncRequest):
    """
    Save the full state of the strategy map.
    """
    # Transform Frontend camelCase to DB snake_case
    db_nodes = []
    for n in request.nodes:
        db_nodes.append({
            "id": n.id,
            "type": n.type,
            "label": n.label,
            "description": n.description,
            "parent_id": n.parentId,
            "x": n.x,
            "y": n.y
        })
        
    try:
        db.sync_strategy_nodes(request.client_id, db_nodes)
        return {"status": "synced", "count": len(db_nodes)}
    except Exception as e:
        logger.error(f"Strategy Sync Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
