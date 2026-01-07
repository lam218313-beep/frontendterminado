"""
Auth Router
===========
Mock authentication for Pixely Partners.
Provides token generation to allow frontend login.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional

from ..services.database import db

router = APIRouter(tags=["Authentication"])

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_email: str
    tenant_id: str
    ficha_cliente_id: Optional[str] = None
    logo_url: Optional[str] = None
    role: str

class UserInfo(BaseModel):
    id: str
    email: str
    full_name: str
    tenant_id: str
    role: str
    is_active: bool
    logo_url: Optional[str] = None


@router.post("/token", response_model=AuthResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint. Checks DB first, falls back to mock admin.
    """
    # 1. Try Mock Admin (Fallback)
    if form_data.username == "admin@pixely.pe" and form_data.password == "admin":
        # Check if real admin exists in DB to disable mock? No, keep it simple for now.
        return {
            "access_token": "mock-jwt-token-admin",
            "token_type": "bearer",
            "user_email": form_data.username,
            "tenant_id": "tenant-default",
            "ficha_cliente_id": None,
            "logo_url": None,
            "role": "admin"
        }
    
    # 2. Check Database via Supabase Auth
    try:
        # This returns a session if successful
        auth_response = db.client.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        
        if auth_response.user:
            # Get Role from Public Profile
            user_profile = db.get_user_by_email(form_data.username)
            role = user_profile["role"] if user_profile else "analyst"
            
            return {
                "access_token": auth_response.session.access_token, # Use Real Supabase Token if available? 
                # Actually, our frontend expects a custom struct. 
                # For compatibility, we can perform a hybrid approach or just return what we have.
                # Let's return a simple token for now as we don't fully use the JWT on backend yet.
                # Or better: return the actual session access_token.
                "access_token": auth_response.session.access_token, 
                "token_type": "bearer",
                "user_email": auth_response.user.email,
                "tenant_id": "tenant-default",
                "ficha_cliente_id": None,
                "logo_url": None,
                "role": role
            }
    except Exception as e:
        # Fallthrough to error
        print(f"Login Error: {e}") # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}", # Reveal error to frontend
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/users/me", response_model=UserInfo)
async def read_users_me(token: str = Depends(lambda: "mock")): # Simplify dependency
    """Returns user info based on token (mock implementation for getting current user)."""
    # In a real app, parse the token to get user ID. 
    # Here we hardcode return for the 'admin' session or 'demo'.
    
    # If using the mock admin token
    return {
        "id": "user-admin-001",
        "email": "admin@pixely.pe",
        "full_name": "Admin User",
        "tenant_id": "tenant-default",
        "role": "admin",
        "is_active": True,
        "logo_url": None
    }
