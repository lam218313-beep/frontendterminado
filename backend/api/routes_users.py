from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import shutil
import os

from .database import get_db
from . import models, schemas, security
from .dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve users. Only admins can see all users.
    """
    if current_user.role != "admin":
        # Non-admins can only see themselves
        return [current_user]
        
    users = db.query(models.User).filter(models.User.tenant_id == current_user.tenant_id).offset(skip).limit(limit).all()
    return users

@router.post("/upload-logo")
async def upload_user_logo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    """
    Upload a user logo (PNG, JPG, SVG).
    Returns the static URL.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PNG, JPG, SVG allowed.")
    
    # Create directory if not exists
    upload_dir = "static/logos"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return URL (assuming mounted at /static)
    return {"url": f"/static/logos/{filename}"}

@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new user. Only admins can create users.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create users")
        
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    
    # Use current user's tenant if not specified
    tenant_id = user.tenant_id if user.tenant_id else current_user.tenant_id
    
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        logo_url=user.logo_url,
        role=user.role,
        tenant_id=tenant_id,
        is_active=user.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: str,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update a user. Only admins can update other users.
    """
    if current_user.role != "admin" and str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role != "admin" and db_user.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot update users from other tenants")

    # Update fields
    if user_update.email:
        # Check uniqueness if email changes
        if user_update.email != db_user.email:
            existing = db.query(models.User).filter(models.User.email == user_update.email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = user_update.email
        
    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name
        
    if user_update.logo_url is not None:
        db_user.logo_url = user_update.logo_url
        
    if user_update.role and current_user.role == "admin":
        db_user.role = user_update.role
        
    if user_update.is_active is not None and current_user.role == "admin":
        db_user.is_active = user_update.is_active
        
    if user_update.password:
        db_user.hashed_password = security.get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete a user. Only admins can delete users.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
        
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_to_delete.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot delete users from other tenants")
        
    db.delete(user_to_delete)
    db.commit()
    return None
