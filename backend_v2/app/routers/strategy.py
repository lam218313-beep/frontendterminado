
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
    Save the full state of the strategy map and auto-create tasks for 'post' nodes.
    """
    # 1. Transform Frontend camelCase to DB snake_case for Strategy Nodes
    db_nodes = []
    post_nodes = []
    
    for n in request.nodes:
        # Prepare for DB persistence
        db_nodes.append({
            "id": n.id,
            "type": n.type,
            "label": n.label,
            "description": n.description,
            "parent_id": n.parentId,
            "x": n.x,
            "y": n.y,
            "client_id": request.client_id
        })
        
        # Identify 'post' nodes for Task creation
        # We also treat 'secondary' as potential tasks, but user specifically mentioned 'publicaciones' (posts)
        if n.type == 'post':
            post_nodes.append(n)
        
    try:
        # 2. Persist Strategy Nodes
        db.sync_strategy_nodes(request.client_id, db_nodes)
        
        # 3. Auto-Create Tasks from Post Nodes
        if post_nodes:
            # Fetch existing tasks to avoid duplicates (Simple check by title for now)
            existing_tasks = db.get_tasks(request.client_id)
            existing_titles = {t['title'] for t in existing_tasks}
            
            new_tasks = []
            import uuid
            
            for p in post_nodes:
                if p.label not in existing_titles:
                    new_task = {
                        "id": str(uuid.uuid4()),
                        "client_id": request.client_id,
                        "title": p.label,
                        "description": p.description or "Generado desde Estrategia",
                        "status": "PENDIENTE",
                        "priority": "Media",
                        "area_estrategica": "Contenido", # Default for posts
                        "created_at": "now()"
                    }
                    new_tasks.append(new_task)
            
            if new_tasks:
                db.create_tasks_batch(new_tasks)
                logger.info(f"Auto-created {len(new_tasks)} tasks from Strategy Posts")
            
        return {"status": "synced", "count": len(db_nodes), "tasks_created": len(new_tasks) if 'new_tasks' in locals() else 0}
        
    except Exception as e:
        logger.error(f"Strategy Sync Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
