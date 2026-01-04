"""
Pixely Partners API - Database Models (ORM)

Esquema Multi-Tenant para gestión de usuarios, clientes y resultados de análisis.

Estructura:
- Tenant: Organización (agencia/empresa)
- User: Usuarios del sistema (analistas)
- FichaCliente: Marcas/clientes que se analizan
- SocialMediaPost: Publicaciones ingeridas
- Comentario: Comentarios en publicaciones
- SocialMediaInsight: Resultados de los 10 módulos de análisis (Q1-Q10)
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .database import Base

# =============================================================================
# NÚCLEO MULTI-TENANT
# =============================================================================

class Tenant(Base):
    """
    Organización raíz (Agencia/Empresa).
    Todos los usuarios y datos pertenecen a un Tenant.
    """
    __tablename__ = "tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    clients = relationship("FichaCliente", back_populates="tenant", cascade="all, delete-orphan")

class User(Base):
    """
    Usuarios del sistema (analistas, administradores).
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    logo_url = Column(String, nullable=True)
    role = Column(String, default="analyst")  # admin, analyst, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Foreign Key
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")

# =============================================================================
# DATOS DEL NEGOCIO
# =============================================================================

class FichaCliente(Base):
    """
    Marca o Cliente que está siendo analizado.
    Cada cliente tiene su propia ficha con información de marca.
    """
    __tablename__ = "fichas_cliente"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_name = Column(String, nullable=False)
    industry = Column(String)
    brand_archetype = Column(String)
    tone_of_voice = Column(String)
    target_audience = Column(Text)
    competitors = Column(JSON)  # Lista de competidores
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    last_analysis_timestamp = Column(DateTime, nullable=True)  # Timestamp de última ejecución del orchestrator
    
    # Foreign Key
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="clients")
    posts = relationship("SocialMediaPost", back_populates="cliente", cascade="all, delete-orphan")
    insights = relationship("SocialMediaInsight", back_populates="cliente", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="ficha", cascade="all, delete-orphan")
    ai_context = relationship("AIContext", back_populates="cliente", uselist=False, cascade="all, delete-orphan")

class SocialMediaPost(Base):
    """
    Publicación de redes sociales ingerida.
    """
    __tablename__ = "social_media_posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_url = Column(String, unique=True, index=True, nullable=False)
    content_text = Column(Text)
    posted_at = Column(DateTime)  # Fecha del post (from Google Sheets: created_at)
    platform = Column(String)  # instagram, tiktok, facebook
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    engagement_rate = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign Key
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("fichas_cliente.id"), nullable=False)
    
    # Relationships
    cliente = relationship("FichaCliente", back_populates="posts")
    comments = relationship("Comentario", back_populates="post", cascade="all, delete-orphan")

class Comentario(Base):
    """
    Comentario en una publicación de redes sociales.
    """
    __tablename__ = "comentarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(Text, nullable=False)
    owner_username = Column(String)
    timestamp = Column(DateTime)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign Key
    post_id = Column(UUID(as_uuid=True), ForeignKey("social_media_posts.id"), nullable=False)
    
    # Relationships
    post = relationship("SocialMediaPost", back_populates="comments")

# =============================================================================
# RESULTADOS DE IA (Q1-Q10)
# =============================================================================

class SocialMediaInsight(Base):
    """
    Tabla maestra que almacena los resultados de los 10 módulos de análisis.
    
    Cada insight representa un análisis completo (Q1-Q10) para un cliente
    en un momento específico. Los resultados se guardan en columnas JSON
    que corresponden a los schemas Pydantic de cada módulo.
    """
    __tablename__ = "social_media_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    analysis_date = Column(DateTime, default=datetime.utcnow)
    
    # Metadata del análisis
    total_posts_analyzed = Column(Integer, default=0)
    total_comments_analyzed = Column(Integer, default=0)
    analysis_status = Column(String, default="completed")  # completed, partial, failed
    
    # Foreign Key
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("fichas_cliente.id"), nullable=False)
    
    # Relationships
    cliente = relationship("FichaCliente", back_populates="insights")
    
    # =============================================================================
    # COLUMNAS JSON PARA RESULTADOS DE LOS 10 MÓDULOS
    # Cada columna almacena la salida completa del schema Pydantic correspondiente
    # =============================================================================
    
    # Q1: Análisis de Emociones
    # Schema: Q1Response (metadata, results, errors)
    q1_emociones = Column(JSON, nullable=True)
    
    # Q2: Personalidad de Marca (Aaker)
    # Schema: Q2Response (metadata, results, errors)
    q2_personalidad = Column(JSON, nullable=True)
    
    # Q3: Análisis de Tópicos
    # Schema: Q3Response (metadata, results, errors)
    q3_topicos = Column(JSON, nullable=True)
    
    # Q4: Marcos Narrativos
    # Schema: Q4Response (metadata, results, errors)
    q4_marcos_narrativos = Column(JSON, nullable=True)
    
    # Q5: Análisis de Influenciadores
    # Schema: Q5Response (metadata, results, errors)
    q5_influenciadores = Column(JSON, nullable=True)
    
    # Q6: Análisis de Oportunidades
    # Schema: Q6Response (metadata, results, errors)
    q6_oportunidades = Column(JSON, nullable=True)
    
    # Q7: Sentimiento Detallado
    # Schema: Q7Response (metadata, results, errors)
    q7_sentimiento = Column(JSON, nullable=True)
    
    # Q8: Análisis Temporal
    # Schema: Q8Response (metadata, results, errors)
    q8_temporal = Column(JSON, nullable=True)
    
    # Q9: Recomendaciones
    # Schema: Q9Response (metadata, results, errors)
    q9_recomendaciones = Column(JSON, nullable=True)
    
    # Q10: Resumen Ejecutivo
    # Schema: Q10Response (metadata, results, errors)
    q10_resumen = Column(JSON, nullable=True)

# =============================================================================
# GESTIÓN DE CONTEXTO AI (GEMINI)
# =============================================================================

class AIContext(Base):
    """
    Registro de contextos de Gemini File API para cada cliente.
    Permite el aislamiento de datos y la gestión de caches.
    """
    __tablename__ = "ai_contexts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relación 1 a 1 con FichaCliente
    ficha_cliente_id = Column(UUID(as_uuid=True), ForeignKey("fichas_cliente.id"), unique=True, nullable=False)
    
    # Recursos de Gemini (Cache Actual)
    # gemini_file_uri ya no se usa aquí directamente, se usa ContextFile
    gemini_cache_name = Column(String, nullable=True)    # Nombre del cache ACTIVO (ej: "caches/4p3k...")
    
    # Gestión de Ciclo de Vida
    last_updated = Column(DateTime, default=datetime.utcnow)       # Cuándo se actualizó el cache
    expires_at = Column(DateTime, nullable=True)         # Cuándo expira el cache de Gemini (TTL)
    status = Column(String, default="active")            # "active", "expired", "processing"

    # Relationships
    cliente = relationship("FichaCliente", back_populates="ai_context")
    files = relationship("ContextFile", back_populates="context", cascade="all, delete-orphan")

class ContextFile(Base):
    """
    Archivos individuales subidos a Gemini que forman parte del contexto.
    """
    __tablename__ = "context_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ai_context_id = Column(Integer, ForeignKey("ai_contexts.id"), nullable=False)
    
    filename = Column(String, nullable=False)            # Nombre original (ej: "Ventas_2025.xlsx")
    category = Column(String, default="General")         # Tag (Finanzas, Marketing, etc.)
    gemini_uri = Column(String, nullable=False)          # URI en Gemini (files/xxxx)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    context = relationship("AIContext", back_populates="files")

# =============================================================================
# CHATBOT PERSISTENCE
# =============================================================================

class ChatSession(Base):
    """
    Sesión de chat (hilo de conversación) asociada a un cliente y usuario.
    """
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, default="Nueva conversación")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Foreign Keys
    ficha_cliente_id = Column(UUID(as_uuid=True), ForeignKey("fichas_cliente.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Opcional si queremos chats anónimos o de sistema

    # Relationships
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    # cliente = relationship("FichaCliente") # Ya implícito si se necesita, agregar back_populates en FichaCliente si se requiere navegación inversa

class ChatMessage(Base):
    """
    Mensaje individual dentro de una sesión de chat.
    """
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = Column(String, nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Metadata opcional para guardar referencias (ej: ids de gráficos generados, fuentes)
    meta_data = Column(JSON, nullable=True) 

    # Foreign Key
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)

    # Relationships
    session = relationship("ChatSession", back_populates="messages")

# Import Task models to establish relationships
from .models_tasks import Task, TaskNote  # noqa: F401, E402
