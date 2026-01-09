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
from .routers import pipeline, clients, analysis, auth, users, tasks, interview

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logging.basicConfig(level=logging.INFO)
    yield
    # Shutdown logic

app = FastAPI(
    title="Pixely Partners API v2",
    description="Backend for Pixely Partners (Agency Workflow)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
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
app.include_router(tasks.router)
app.include_router(interview.router)


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
