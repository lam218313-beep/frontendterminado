"""
Backend v2: The Aggregation Engine
===================================
FastAPI entry point for the new serverless backend.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import pipeline, clients, analysis, auth, users

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Backend v2: The Aggregation Engine starting...")
    logger.info(f"   Supabase: {settings.SUPABASE_URL[:30]}...")
    logger.info(f"   Apify Token: {'✓' if settings.APIFY_TOKEN else '✗'}")
    logger.info(f"   Gemini Key: {'✓' if settings.GEMINI_API_KEY else '✗'}")
    yield
    logger.info("🛑 Backend v2 shutting down...")


app = FastAPI(
    title="Pixely Partners API v2",
    description="The Aggregation Engine - Apify + Gemini + Math",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pipeline.router)
app.include_router(clients.router)
app.include_router(analysis.router)


@app.get("/", tags=["Health"])
async def root():
    """Health check."""
    return {
        "service": "Pixely Partners API v2",
        "engine": "Aggregation Engine",
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "components": {
            "apify": "connected" if settings.APIFY_TOKEN else "missing_token",
            "gemini": "connected" if settings.GEMINI_API_KEY else "missing_key",
            "supabase": "connected" if settings.SUPABASE_URL else "missing_url"
        }
    }
