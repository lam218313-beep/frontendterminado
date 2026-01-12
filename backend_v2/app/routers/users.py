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
    """Create a new user using Supabase Auth."""
    
    # 1. Register in Supabase Auth
    # 1. Register in Supabase Auth
    try:
        if db.admin_client:
            # OPTION A: Use Admin API (Best for Admin Dashboard)
            # Creates a verified user immediately. No email logic needed.
            print(f"Creating user {user.email} via Admin API...")
            auth_response = db.admin_client.auth.admin.create_user({
                "email": user.email,
                "password": user.password,
                "email_confirm": True, # Auto-confirm email
                "user_metadata": {
                    "full_name": user.full_name,
                    "role": user.role
                }
            })
            user_id = auth_response.user.id
        else:
            # OPTION B: Use Public Sign Up (Fallback)
            # This might require email confirmation depending on Supabase settings.
            print(f"Creating user {user.email} via Public Sign Up...")
            auth_response = db.client.auth.sign_up({
                "email": user.email,
                "password": user.password,
                "options": {
                    "data": {
                        "full_name": user.full_name,
                        "role": user.role
                    }
                }
            })
            if not auth_response.user or not auth_response.user.id:
                 raise HTTPException(status_code=400, detail="Supabase Auth failed (check email confirmation settings)")
            user_id = auth_response.user.id
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Auth Error: {str(e)}")

    # 2. Create Public Profile
    try:
        user_data = {
            "id": user_id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "client_id": user.client_id, # Link to client if provided
            "created_at": datetime.utcnow().isoformat()
        }
        
        db.create_user_profile(user_data)
        
        return {
            "id": user_id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "client_id": user.client_id,
            "created_at": user_data["created_at"],
            "is_active": True
        }
    except Exception as e:
        # If profile creation fails, we might want to cleanup the auth user?
        # For now, just raise.
        raise HTTPException(status_code=500, detail=f"Profile Error: {str(e)}")


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
