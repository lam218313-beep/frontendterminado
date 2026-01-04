"""
Pixely Partners API - FastAPI Server

Main entry point for the professional web API.

NOTE: The legacy Q1-Q10 endpoints have been deprecated.
The new semantic analysis is available via:
- POST /semantic/context/ingest  (upload files)
- POST /semantic/chat/{session_id} (chat with context)

See: backend/ARQUITECTURA.md for the new architecture.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from openai import AsyncOpenAI
from contextlib import asynccontextmanager

# Importar dependencias y esquemas
from .dependencies import get_openai_client, get_config, get_current_user, get_posts_and_comments_from_db
from . import schemas, models, security
from .database import get_db

# Import task routes
from . import routes_tasks
from . import routes_semantic
from . import routes_users

# NOTE: Legacy Q1-Q10 modules have been removed.
# Prompts are preserved in: backend/orchestrator/LEGACY_PROMPTS.md

# Configurar Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# LIFECYCLE EVENTS
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle FastAPI startup and shutdown events.
    
    Startup: Initialize clients and resources
    Shutdown: Clean up connections
    """
    # STARTUP
    logger.info("🚀 Pixely Partners API Starting...")
    config = get_config()
    logger.info(f"API Version: 2.0.0")
    logger.info(f"Semantic Orchestrator: Gemini 3 Flash Preview + Context Caching")
    logger.info("✅ Semantic endpoints available at /semantic/*")
    
    yield
    
    # SHUTDOWN
    logger.info("🛑 Pixely Partners API Shutting down...")
    logger.info("API Shutdown complete")


# =============================================================================
# FASTAPI APPLICATION
# =============================================================================

app = FastAPI(
    title="Pixely Partners Analytics API",
    description="API con Semantic Orchestrator (Gemini 3 Flash Preview + Context Caching)",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to known origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include task management router
app.include_router(routes_tasks.router)
app.include_router(routes_semantic.router)
app.include_router(routes_users.router)

# Mount static files
import os
static_dir = "static"
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# =============================================================================
# HEALTH CHECK ENDPOINTS
# =============================================================================

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - minimal health check."""
    return {
        "message": "Pixely Partners API v2",
        "mode": "production_connected",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint."""
    config = get_config()
    return {
        "status": "healthy",
        "version": "2.0.0",
        "mode": "semantic_orchestrator",
        "engine": "Gemini 3 Flash Preview + Context Caching",
        "endpoints": {
            "ingest": "POST /semantic/context/ingest",
            "chat": "POST /semantic/chat/{session_id}",
            "context_status": "GET /semantic/context/{context_id}"
        },
        "timestamp": datetime.utcnow().isoformat()
    }


# =============================================================================
# ENDPOINTS DE AUTENTICACIÓN
# =============================================================================

@app.post("/register", response_model=schemas.UserResponse, tags=["Authentication"])
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario y su organización (Tenant).
    """
    # 1. Verificar si el usuario ya existe
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Verificar o Crear Tenant (Organización)
    # Nota: En un SaaS real, esto validaría unicidad. Aquí simplificamos.
    db_tenant = db.query(models.Tenant).filter(models.Tenant.name == user.tenant_name).first()
    if not db_tenant:
        db_tenant = models.Tenant(name=user.tenant_name)
        db.add(db_tenant)
        db.commit()
        db.refresh(db_tenant)
    
    # 3. Crear Usuario
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        logo_url=user.logo_url,
        tenant_id=db_tenant.id,
        role="admin"  # El primer usuario es admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/token", response_model=schemas.Token, tags=["Authentication"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint de Login (OAuth2 standard).
    Recibe username (email) y password, devuelve Access Token con info de usuario.
    """
    # 1. Buscar usuario
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # 2. Validar contraseña
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generar Token
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # 4. Get first ficha_cliente for this tenant (if any)
    first_ficha = db.query(models.FichaCliente).filter(
        models.FichaCliente.tenant_id == user.tenant_id
    ).first()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_email": user.email,
        "tenant_id": str(user.tenant_id),
        "ficha_cliente_id": str(first_ficha.id) if first_ficha else None,
        "logo_url": user.logo_url,
        "role": user.role  # Include user role in token response
    }


@app.get("/users/me", response_model=schemas.UserResponse, tags=["Authentication"])
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Retorna la información del usuario actualmente logueado."""
    return current_user


# =============================================================================
# USER MANAGEMENT ENDPOINTS (CRUD)
# =============================================================================

@app.get("/users", response_model=schemas.UserListResponse, tags=["User Management"])
def list_users(
    page: int = 1,
    per_page: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos los usuarios del tenant actual (con paginación).
    Solo accesible para admin.
    """
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Only admins can list users")
    
    # Calcular offset
    offset = (page - 1) * per_page
    
    # Obtener usuarios del mismo tenant
    query = db.query(models.User).filter(
        models.User.tenant_id == current_user.tenant_id
    )
    
    total = query.count()
    users = query.offset(offset).limit(per_page).all()
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "per_page": per_page
    }


@app.get("/users/{user_id}", response_model=schemas.UserResponse, tags=["User Management"])
def get_user(
    user_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene información de un usuario específico.
    Solo accesible para admin.
    """
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Only admins can view user details")
    
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@app.post("/users", response_model=schemas.UserResponse, tags=["User Management"])
def create_user(
    user_data: schemas.UserCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo usuario en el tenant actual.
    Solo accesible para admin.
    """
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    # Verificar que el email no exista
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Crear usuario en el mismo tenant que el admin
    hashed_password = security.get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        tenant_id=current_user.tenant_id,  # Mismo tenant que el admin
        role="viewer"  # Por defecto viewer, admin puede cambiar después
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"Admin {current_user.email} created user {new_user.email}")
    return new_user


@app.patch("/users/{user_id}", response_model=schemas.UserResponse, tags=["User Management"])
def update_user(
    user_id: str,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza un usuario existente.
    Solo accesible para admin.
    """
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Only admins can update users")
    
    # Buscar usuario en el mismo tenant
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Actualizar campos proporcionados
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    
    if user_update.role is not None:
        if user_update.role not in ["admin", "analyst", "viewer"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = user_update.role
    
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    if user_update.password is not None:
        user.hashed_password = security.get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"Admin {current_user.email} updated user {user.email}")
    return user


@app.delete("/users/{user_id}", tags=["User Management"])
def delete_user(
    user_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un usuario.
    Solo accesible para admin.
    No se puede eliminar a sí mismo.
    """
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    # No permitir auto-eliminación
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Buscar usuario en el mismo tenant
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"Admin {current_user.email} deleted user {user.email}")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.email} deleted successfully"}


# =============================================================================
# FICHAS CLIENTE ENDPOINTS (Brands Management)
# =============================================================================

@app.post("/fichas_cliente", response_model=schemas.FichaClienteResponse, tags=["Fichas Cliente"])
def create_ficha_cliente(
    ficha: schemas.FichaClienteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crea una nueva ficha de cliente/marca para el tenant del usuario."""
    new_ficha = models.FichaCliente(
        tenant_id=current_user.tenant_id,
        brand_name=ficha.brand_name,
        industry=ficha.industry,
        brand_archetype=ficha.brand_archetype,
        tone_of_voice=ficha.tone_of_voice,
        target_audience=ficha.target_audience,
        competitors=ficha.competitors
    )
    db.add(new_ficha)
    db.commit()
    db.refresh(new_ficha)
    return new_ficha


@app.get("/fichas_cliente", response_model=List[schemas.FichaClienteResponse], tags=["Fichas Cliente"])
def list_fichas_cliente(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todas las fichas de cliente del tenant del usuario."""
    fichas = db.query(models.FichaCliente).filter(
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).all()
    return fichas


@app.get("/fichas_cliente/{ficha_id}", response_model=schemas.FichaClienteResponse, tags=["Fichas Cliente"])
def get_ficha_cliente(
    ficha_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene detalles de una ficha específica."""
    ficha = db.query(models.FichaCliente).filter(
        models.FichaCliente.id == ficha_id,
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).first()
    
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha not found")
    return ficha


@app.delete("/fichas_cliente/{ficha_id}", tags=["Fichas Cliente"])
def delete_ficha_cliente(
    ficha_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina una ficha de cliente."""
    ficha = db.query(models.FichaCliente).filter(
        models.FichaCliente.id == ficha_id,
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).first()
    
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha not found")
    
    db.delete(ficha)
    db.commit()
    return {"message": "Ficha deleted successfully"}


@app.patch("/fichas_cliente/{ficha_id}/last_analysis_timestamp", tags=["Fichas Cliente"])
def update_last_analysis_timestamp(
    ficha_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el timestamp de la última ejecución del orchestrator.
    Solo puede ser llamado por el usuario orchestrator (admin).
    """
    import os
    
    # Verificar que solo el orchestrator puede actualizar este campo
    orchestrator_email = os.environ.get("ORCHESTRATOR_USER", "admin")
    if current_user.email != orchestrator_email and current_user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Only orchestrator or admin can update last_analysis_timestamp"
        )
    
    # Buscar la ficha
    ficha = db.query(models.FichaCliente).filter(
        models.FichaCliente.id == ficha_id,
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).first()
    
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha not found")
    
    # Actualizar timestamp
    from datetime import datetime
    ficha.last_analysis_timestamp = datetime.utcnow()
    db.commit()
    db.refresh(ficha)
    
    return {
        "message": "last_analysis_timestamp updated successfully",
        "last_analysis_timestamp": ficha.last_analysis_timestamp.isoformat(),
        "ficha_id": str(ficha.id)
    }


# =============================================================================
# SOCIAL MEDIA POSTS ENDPOINTS (Data Ingestion)
# =============================================================================

@app.post("/social_media_posts", response_model=schemas.SocialMediaPostResponse, tags=["Social Media"])
def create_social_media_post(
    post: schemas.SocialMediaPostCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ingesta un nuevo post de redes sociales asociado a una ficha cliente."""
    # Verificar que la ficha pertenezca al tenant del usuario
    ficha = db.query(models.FichaCliente).filter(
        models.FichaCliente.id == post.ficha_cliente_id,
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).first()
    
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha cliente not found")
    
    new_post = models.SocialMediaPost(
        ficha_cliente_id=post.ficha_cliente_id,
        platform=post.platform,
        post_url=post.post_url,
        author_username=post.author_username,
        post_text=post.post_text,
        posted_at=post.posted_at,
        likes_count=post.likes_count,
        comments_count=post.comments_count,
        shares_count=post.shares_count,
        views_count=post.views_count
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@app.get("/social_media_posts", response_model=List[schemas.SocialMediaPostResponse], tags=["Social Media"])
def list_social_media_posts(
    ficha_cliente_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista posts de redes sociales. Opcional: filtrar por ficha_cliente_id."""
    query = db.query(models.SocialMediaPost).join(
        models.FichaCliente,
        models.SocialMediaPost.ficha_cliente_id == models.FichaCliente.id
    ).filter(
        models.FichaCliente.tenant_id == current_user.tenant_id
    )
    
    if ficha_cliente_id:
        query = query.filter(models.SocialMediaPost.ficha_cliente_id == ficha_cliente_id)
    
    posts = query.all()
    return posts


# =============================================================================
# INSIGHTS ENDPOINTS (Analysis Results)
# =============================================================================

@app.get("/insights/{ficha_cliente_id}", response_model=schemas.InsightResponse, tags=["Insights"])
def get_insights(
    ficha_cliente_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene el último insight para un cliente específico."""
    # Buscar el insight más reciente para este cliente
    insight = db.query(models.SocialMediaInsight).join(
        models.FichaCliente,
        models.SocialMediaInsight.cliente_id == models.FichaCliente.id
    ).filter(
        models.FichaCliente.tenant_id == current_user.tenant_id,
        models.SocialMediaInsight.cliente_id == ficha_cliente_id
    ).order_by(models.SocialMediaInsight.created_at.desc()).first()
    
    if not insight:
        raise HTTPException(status_code=404, detail="No analysis found for this client")
    
    return insight


# =============================================================================
# ORCHESTRATOR ANALYSIS RESULTS ENDPOINT
# =============================================================================

@app.post("/analysis_results", response_model=schemas.AnalysisResultResponse, tags=["Orchestrator"])
async def save_analysis_results(
    data: schemas.AnalysisResultCreate,
    db: Session = Depends(get_db)
):
    """
    Endpoint para que el orchestrator guarde resultados de análisis.
    
    Este endpoint recibe los resultados de Q1-Q10 desde el orchestrator
    y los almacena en la tabla social_media_insights.
    
    Args:
        data: AnalysisResultCreate con ficha_cliente_id, module_name y results
        db: Database session
    
    Returns:
        AnalysisResultResponse con success, message e insight_id
    """
    try:
        logger.info(f"📥 Receiving analysis results for {data.module_name} - Client: {data.ficha_cliente_id}")
        
        # Validar que el cliente existe
        ficha = db.query(models.FichaCliente).filter(
            models.FichaCliente.id == data.ficha_cliente_id
        ).first()
        
        if not ficha:
            raise HTTPException(
                status_code=404, 
                detail=f"FichaCliente {data.ficha_cliente_id} not found"
            )
        
        # Mapeo de módulos a columnas de la tabla
        module_column_map = {
            "Q1": "q1_emociones",
            "Q2": "q2_personalidad",
            "Q3": "q3_topicos",
            "Q4": "q4_marcos_narrativos",
            "Q5": "q5_influenciadores",
            "Q6": "q6_oportunidades",
            "Q7": "q7_sentimiento",
            "Q8": "q8_temporal",
            "Q9": "q9_recomendaciones",
            "Q10": "q10_resumen"
        }
        
        column_name = module_column_map.get(data.module_name)
        if not column_name:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid module_name: {data.module_name}. Must be Q1-Q10"
            )
        
        # Buscar insight existente para este cliente (último análisis)
        insight = db.query(models.SocialMediaInsight).filter(
            models.SocialMediaInsight.cliente_id == data.ficha_cliente_id
        ).order_by(
            models.SocialMediaInsight.analysis_date.desc()
        ).first()
        
        # Si no existe o es antiguo (más de 1 día), crear nuevo
        if not insight or (datetime.utcnow() - insight.analysis_date).days >= 1:
            insight = models.SocialMediaInsight(
                cliente_id=data.ficha_cliente_id,
                analysis_date=datetime.utcnow(),
                total_posts_analyzed=0,
                total_comments_analyzed=0,
                analysis_status="in_progress"
            )
            db.add(insight)
            db.flush()  # Para obtener el ID
            logger.info(f"✨ Created new insight record: {insight.id}")
        
        # Actualizar la columna correspondiente al módulo
        setattr(insight, column_name, data.results)
        logger.info(f"✅ Updated {column_name} in insight {insight.id}")
        
        # Actualizar metadata si disponible
        if "metadata" in data.results:
            results_data = data.results.get("results", {})
            if "analisis_por_publicacion" in results_data:
                insight.total_posts_analyzed = len(results_data["analisis_por_publicacion"])
        
        # Commit
        db.commit()
        db.refresh(insight)
        
        return schemas.AnalysisResultResponse(
            success=True,
            message=f"{data.module_name} results saved successfully",
            insight_id=str(insight.id)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error saving {data.module_name} results: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error saving analysis results: {str(e)}"
        )


# =============================================================================
# LEGACY Q1-Q10 ENDPOINTS - DEPRECATED
# =============================================================================

# NOTE: The Q1-Q10 analysis endpoints have been deprecated.
# 
# The new architecture uses the Semantic Orchestrator with:
# - POST /semantic/context/ingest  (upload files to context cache)
# - POST /semantic/chat/{session_id} (chat with context-aware AI)
#
# The legacy prompts are preserved in: backend/orchestrator/LEGACY_PROMPTS.md
# for potential use in frontend or other components.
#
# Migration Guide:
# 1. Upload your PDF/image files via /semantic/context/ingest
# 2. Create a chat session via /semantic/chat/{session_id}
# 3. Query the AI for analysis using natural language
#
# See: backend/ARQUITECTURA.md for full documentation.

DEPRECATED_MESSAGE = {
    "error": "DEPRECATED",
    "message": "Los endpoints Q1-Q10 han sido deprecados. Use el Semantic Orchestrator.",
    "new_endpoints": {
        "ingest": "POST /semantic/context/ingest",
        "chat": "POST /semantic/chat/{session_id}",
        "context_status": "GET /semantic/context/{context_id}"
    },
    "documentation": "/docs#/Semantic"
}


@app.post("/analyze/q1", tags=["Deprecated"], deprecated=True)
async def analyze_q1_deprecated():
    """[DEPRECATED] Q1 - Análisis de Emociones. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q2", tags=["Deprecated"], deprecated=True)
async def analyze_q2_deprecated():
    """[DEPRECATED] Q2 - Personalidad de Marca. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q3", tags=["Deprecated"], deprecated=True)
async def analyze_q3_deprecated():
    """[DEPRECATED] Q3 - Análisis de Tópicos. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q4", tags=["Deprecated"], deprecated=True)
async def analyze_q4_deprecated():
    """[DEPRECATED] Q4 - Marcos Narrativos. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q5", tags=["Deprecated"], deprecated=True)
async def analyze_q5_deprecated():
    """[DEPRECATED] Q5 - Influenciadores. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q6", tags=["Deprecated"], deprecated=True)
async def analyze_q6_deprecated():
    """[DEPRECATED] Q6 - Oportunidades. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q7", tags=["Deprecated"], deprecated=True)
async def analyze_q7_deprecated():
    """[DEPRECATED] Q7 - Sentimiento Detallado. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q8", tags=["Deprecated"], deprecated=True)
async def analyze_q8_deprecated():
    """[DEPRECATED] Q8 - Análisis Temporal. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q9", tags=["Deprecated"], deprecated=True)
async def analyze_q9_deprecated():
    """[DEPRECATED] Q9 - Recomendaciones. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/analyze/q10", tags=["Deprecated"], deprecated=True)
async def analyze_q10_deprecated():
    """[DEPRECATED] Q10 - Resumen Ejecutivo. Use /semantic/chat."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


@app.post("/pipeline", tags=["Deprecated"], deprecated=True)
async def run_full_pipeline_deprecated():
    """[DEPRECATED] Pipeline Q1-Q10. Use /semantic/chat para análisis."""
    raise HTTPException(status_code=410, detail=DEPRECATED_MESSAGE)


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    import os
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    workers = int(os.getenv("API_WORKERS", "1"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Pixely Partners API on {host}:{port}")
    logger.info("🚀 Semantic Orchestrator Active (Gemini 3 Flash Preview)")
    
    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )






