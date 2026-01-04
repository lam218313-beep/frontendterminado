#!/usr/bin/env python3
"""
Pixely Partners - Database Initialization Script

Este script se ejecuta automáticamente al iniciar el contenedor API.
Realiza:
1. Crear todas las tablas (si no existen)
2. Ejecutar migraciones pendientes de Alembic
3. Crear tenant inicial "Pixely Partners"
4. Crear usuario admin con credenciales del .env

Uso:
    python init_db.py

Variables de entorno requeridas:
    - DATABASE_URL
    - ORCHESTRATOR_USER (email del admin)
    - ORCHESTRATOR_PASSWORD (password del admin)
"""

import os
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database with tables, migrations, and seed data."""
    
    logger.info("🚀 Starting database initialization...")
    
    # Import after setting up path
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://pixely_user:secret_password_123@db:5432/pixely_db"
    )
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # ==========================================================================
    # STEP 1: Create all tables from models
    # ==========================================================================
    logger.info("📋 Step 1: Creating database tables...")
    
    try:
        # Import models to register them with Base
        from api.database import Base
        from api import models  # This imports all model classes
        
        Base.metadata.create_all(bind=engine)
        logger.info("   ✅ Tables created successfully")
    except Exception as e:
        logger.error(f"   ❌ Error creating tables: {e}")
        raise
    
    # ==========================================================================
    # STEP 2: Run Alembic migrations
    # ==========================================================================
    logger.info("📋 Step 2: Running Alembic migrations...")
    
    try:
        from alembic.config import Config
        from alembic import command
        
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("   ✅ Migrations applied successfully")
    except Exception as e:
        logger.warning(f"   ⚠️ Alembic migration warning: {e}")
        # Continue even if alembic fails (tables might already exist)
    
    # ==========================================================================
    # STEP 3: Create initial tenant and admin user
    # ==========================================================================
    logger.info("📋 Step 3: Creating initial tenant and admin user...")
    
    db = SessionLocal()
    
    try:
        # Check if tenant exists
        existing_tenant = db.execute(
            text("SELECT id FROM tenants WHERE name = 'Pixely Partners' LIMIT 1")
        ).fetchone()
        
        if existing_tenant:
            tenant_id = existing_tenant[0]
            logger.info(f"   ℹ️ Tenant 'Pixely Partners' already exists: {tenant_id}")
        else:
            # Create tenant
            import uuid
            tenant_id = str(uuid.uuid4())
            db.execute(
                text("""
                    INSERT INTO tenants (id, name, is_active, created_at)
                    VALUES (:id, 'Pixely Partners', true, NOW())
                """),
                {"id": tenant_id}
            )
            db.commit()
            logger.info(f"   ✅ Created tenant 'Pixely Partners': {tenant_id}")
        
        # Get admin credentials from environment
        admin_email = os.getenv("ORCHESTRATOR_USER", "admin@pixelypartners.com")
        admin_password = os.getenv("ORCHESTRATOR_PASSWORD", "pixelyadmin2025")
        
        # Check if admin user exists
        existing_user = db.execute(
            text("SELECT id FROM users WHERE email = :email LIMIT 1"),
            {"email": admin_email}
        ).fetchone()
        
        if existing_user:
            logger.info(f"   ℹ️ Admin user already exists: {admin_email}")
        else:
            # Hash password
            from api.security import get_password_hash
            hashed_password = get_password_hash(admin_password)
            
            # Create admin user
            import uuid
            user_id = str(uuid.uuid4())
            db.execute(
                text("""
                    INSERT INTO users (id, email, hashed_password, full_name, role, is_active, tenant_id, created_at)
                    VALUES (:id, :email, :password, 'Admin', 'admin', true, :tenant_id, NOW())
                """),
                {
                    "id": user_id,
                    "email": admin_email,
                    "password": hashed_password,
                    "tenant_id": tenant_id
                }
            )
            db.commit()
            logger.info(f"   ✅ Created admin user: {admin_email}")
        
        # ==========================================================================
        # STEP 4: Create initial FichaCliente for testing (optional)
        # ==========================================================================
        logger.info("📋 Step 4: Creating initial test client...")
        
        existing_ficha = db.execute(
            text("SELECT id FROM fichas_cliente WHERE brand_name = 'Demo Client' LIMIT 1")
        ).fetchone()
        
        if existing_ficha:
            logger.info(f"   ℹ️ Demo client already exists: {existing_ficha[0]}")
        else:
            import uuid
            ficha_id = str(uuid.uuid4())
            db.execute(
                text("""
                    INSERT INTO fichas_cliente (id, tenant_id, brand_name, industry, is_active, created_at)
                    VALUES (:id, :tenant_id, 'Demo Client', 'Technology', true, NOW())
                """),
                {"id": ficha_id, "tenant_id": tenant_id}
            )
            db.commit()
            logger.info(f"   ✅ Created demo client: {ficha_id}")
        
        db.close()
        
    except Exception as e:
        logger.error(f"   ❌ Error creating seed data: {e}")
        db.rollback()
        db.close()
        raise
    
    # ==========================================================================
    # FINAL: Summary
    # ==========================================================================
    logger.info("")
    logger.info("=" * 60)
    logger.info("✅ DATABASE INITIALIZATION COMPLETE")
    logger.info("=" * 60)
    logger.info("")
    logger.info("📌 Admin Credentials:")
    logger.info(f"   Email: {admin_email}")
    logger.info(f"   Password: {admin_password}")
    logger.info("")
    logger.info("📌 API Endpoints:")
    logger.info("   Docs: http://localhost:8000/docs")
    logger.info("   Health: http://localhost:8000/health")
    logger.info("")
    logger.info("📌 Login:")
    logger.info("   POST http://localhost:8000/token")
    logger.info("   Body: username=admin@pixelypartners.com&password=pixelyadmin2025")
    logger.info("")


if __name__ == "__main__":
    init_database()
