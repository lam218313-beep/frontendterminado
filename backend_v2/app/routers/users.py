"""
Users Router
============
User management endpoints (Admin only).
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from passlib.context import CryptContext

from ..services.database import db

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================================================================
# Models
# ============================================================================

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "analyst"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: Optional[str] = None
    is_active: bool = True # Compatibility

    class Config:
        from_attributes = True

# ============================================================================
# Helpers
# ============================================================================

def get_password_hash(password):
    return pwd_context.hash(password)

# ============================================================================
# Endpoints
# ============================================================================

@router.get("/", response_model=list[UserResponse])
async def list_users():
    """List all users."""
    users = db.list_users()
    # Add is_active for frontend compatibility
    for u in users:
        u["is_active"] = True
    return users


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user."""
    # Check if exists
    existing = db.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(user.password)
    
    user_data = {
        "id": user_id,
        "email": user.email,
        "hashed_password": hashed_pw,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.create_user(user_data)
    
    return {
        "id": user_id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": user_data["created_at"],
        "is_active": True
    }


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete a user."""
    db.delete_user(user_id)
    return {"message": "User deleted successfully"}

# Upload logo mock endpoint for frontend compatibility
@router.post("/upload-logo")
async def upload_logo():
    return {"url": "https://via.placeholder.com/150"}
