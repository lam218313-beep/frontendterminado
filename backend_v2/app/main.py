"""
Backend v2: The Aggregation Engine
===================================
FastAPI entry point for the new serverless backend.
"""

import logging
# Force reload trigger
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import pipeline, clients, analysis, auth, users_v2, tasks, interview, personas, tts, strategy, brand

# Lifespan context
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: logging, db connections if needed
    logging.info("Starting up Aggregation Engine...")
    print("--- LIFESPAN STARTUP ---")
    for route in app.routes:
        print(f"ROUTE: {route.path}")
    print("------------------------")
    yield
    # Shutdown
    logging.info("Shutting down...")

app = FastAPI(
    title="Pixely Partners API v2",
    description="The Aggregation Engine for Social Analysis",
    version="2.0.0",
    lifespan=lifespan
)

@app.on_event("startup")
async def startup_event():
    print("--- REGISTERED ROUTES ---")
    for route in app.routes:
        print(f"ROUTE: {route.path}")
    print("-------------------------")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Strictify in logic later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users_v2.admin_router)
app.include_router(auth.router)
app.include_router(users_v2.router)
app.include_router(clients.router)
app.include_router(analysis.router)
app.include_router(pipeline.router)
app.include_router(tasks.router)
app.include_router(interview.router)
app.include_router(personas.router)
app.include_router(tts.router)
app.include_router(strategy.router)
app.include_router(brand.router)


@app.post("/debug/update/{user_id}")
async def direct_update_user(user_id: str, payload: dict): 
    print(f"HIT DIRECT UPDATE {user_id}")
    return {"status": "ok", "id": user_id, "data": payload}

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
