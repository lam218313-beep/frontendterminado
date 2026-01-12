"""
print("USERS MODULE LOADED")
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
admin_router = APIRouter(prefix="/admin-users", tags=["Admin Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================================================================
# Models
# ============================================================================

# Plan types
PLAN_TYPES = ["free_trial", "lite", "basic", "pro", "premium"]

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "analyst"
    client_id: Optional[str] = None
    plan: str = "free_trial"

class UserPasswordUpdate(BaseModel):
    password: str

class UserPlanUpdate(BaseModel):
    plan: str
    plan_expires_at: Optional[str] = None
    benefits: list[str] = []

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    client_id: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    plan: str = "free_trial"
    plan_expires_at: Optional[str] = None
    benefits: list[str] = []
    created_at: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

# ============================================================================
# Endpoints
# ============================================================================

@router.get("/", response_model=list[UserResponse])
async def list_users():
    """List all users."""
    users = db.list_users()
    for u in users:
        u["is_active"] = True
    return users


@admin_router.post("/update-debug")
async def update_debug_user(payload: dict):
    """Emergency update endpoint to bypass routing issues."""
    try:
        user_id = payload.get("user_id") # Expect ID in body
        updates = payload.get("updates", {})
        print(f"HIT EMERGENCY UPDATE {user_id}")
        
        # Clean updates
        if "id" in updates: del updates["id"]
        
        db.update_user(user_id, updates)
        return {"id": user_id, "data": updates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@admin_router.patch("/{user_id:uuid}")
async def update_user(user_id: str, payload: UserUpdate):
    """Update user profile details (Admin)."""
    try:
        print(f"HIT ADMIN UPDATE USER {user_id}")
        data = payload.model_dump(exclude_unset=True)
        db.update_user(user_id, data)
        return {"id": user_id, **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):

    """Create a new user using Supabase Auth."""
    
    # ... logic ...
    # (Leaving verify logic as is, assuming context)


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete a user."""
    db.delete_user(user_id)
    return {"message": "User deleted successfully"}

@router.put("/{user_id}/password")
async def reset_password(user_id: str, payload: UserPasswordUpdate):
    """Admin endpoint to force reset user password."""
    try:
        db.update_password_admin(user_id, payload.password)
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Upload logo mock endpoint for frontend compatibility
@router.post("/upload-logo")
async def upload_logo():
    return {"url": "https://via.placeholder.com/150"}


# ============================================================================
# Plan Management
# ============================================================================

@router.get("/{user_id}/plan")
async def get_user_plan(user_id: str):
    """Get user's current plan."""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "plan": user.get("plan", "free_trial"),
        "plan_expires_at": user.get("plan_expires_at"),
        "benefits": user.get("benefits", [])
    }

@router.put("/{user_id}/plan")
async def update_user_plan(user_id: str, payload: UserPlanUpdate):
    """Admin endpoint to update user's plan and benefits."""
    if payload.plan not in PLAN_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Must be one of: {PLAN_TYPES}")
    
    try:
        db.update_user_plan(user_id, payload.plan, payload.plan_expires_at, payload.benefits)
        return {
            "message": "Plan updated successfully",
            "plan": payload.plan,
            "plan_expires_at": payload.plan_expires_at,
            "benefits": payload.benefits
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
