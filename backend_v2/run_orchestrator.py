import sys
import os
import asyncio
import logging
from dotenv import load_dotenv

load_dotenv() # Load .env file from current directory

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.services.database import db
# from app.routers.pipeline import start_analysis_pipeline # Removed: causing import error and not used directly
# Ideally we should call the router function directly or via TestClient.
# Since user asked to use the DB to "execute the orchestrator", they might mean triggering it.
# But typically we call the API. I will use TestClient for the execution part to simulate the request.
from fastapi.testclient import TestClient
from app.main import app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OrchestratorTest")

def setup_data(client_id: str):
    logger.info(f"--- Setting up Data for {client_id} ---")
    
    # Use Admin Client to bypass RLS
    target_client = db.admin_client if db.admin_client else db.client
    if not target_client:
        logger.error("No Database Client available.")
        return False
        
    logger.info(f"Using Client Type: {'ADMIN (Service Role)' if db.admin_client else 'ANON (Public)'}")
    
    # Debug: List clients to check connection/permission partial
    try:
        res = target_client.table("clients").select("id").limit(1).execute()
        logger.info(f"Connection Check (List Clients): {res}")
    except Exception as e:
        logger.error(f"Connection Check Failed: {e}")

    # 1. Create Client
    try:
        target_client.table("clients").upsert({
            "id": client_id,
            "nombre": "Orchestrator Test Brand",
            "industry": "Tech",
            "is_active": True
        }).execute()
        logger.info("✅ Client created/updated.")
    except Exception as e:
        logger.error(f"Failed to create client: {e}")
        return False

    # 2. Insert Interview Data (Approximating "una celda")
    interview_payload = {
        "client_id": client_id,
        "data": {
            "Q1": "We are a startup focused on AI for healthcare.",
            "Q2": "Our audience is doctors and hospital administrators.",
            "Q3": "We offer predictive diagnostics.",
            "Q4": "Competitors are slow and manual.",
            "Q5": "We want to be seen as innovative and reliable.",
            "Q6": "Tone should be professional but accessible.",
            "Q7": "Main goal is lead generation.",
            "Q8": "We use LinkedIn and Email."
        },
        "updated_at": "now()"
    }
    try:
        # Check if exists to know if insert or update, usually upsert works if ID or PK is known.
        # client_interviews likely has client_id as unique key? database.py uses "eq('client_id', client_id)" for update
        # We can try upsert on client_id collision if table has unique constraint on client_id.
        # Assuming uniqueness on client_id based on get_interview singular return.
        
        # We need to query first to be safe or just upsert.
        # database.py logic: Check existing -> Update or Insert.
        existing = target_client.table("client_interviews").select("id").eq("client_id", client_id).execute()
        if existing.data:
             target_client.table("client_interviews").update(interview_payload).eq("client_id", client_id).execute()
        else:
             target_client.table("client_interviews").insert(interview_payload).execute()
        logger.info("✅ Interview data inserted.")
    except Exception as e:
        logger.error(f"Failed to save interview: {e}")
        return False

    # 3. Insert Brand Identity (The "Manual" part)
    brand_payload = {
        "client_id": client_id,
        "mission": "To democratize AI in healthcare.",
        "vision": "A world where diagnosis is instant.",
        "values": ["Innovation", "Integrity", "Speed"],
        "archetype": "The Creator"
    }
    try:
        # Similar logic: check existence
        existing_brand = target_client.table("brand_identities").select("client_id").eq("client_id", client_id).execute()
        if existing_brand.data:
            target_client.table("brand_identities").update(brand_payload).eq("client_id", client_id).execute()
        else:
            target_client.table("brand_identities").insert(brand_payload).execute()
        logger.info("✅ Brand Identity inserted.")
    except Exception as e:
        logger.error(f"Failed to save brand identity: {e}")
        return False
        
    return True

def run_pipeline(client_id: str):
    logger.info(f"--- Triggering Orchestrator for {client_id} ---")
    
    client = TestClient(app)
    
    # Pipeline expects POST /pipeline/start with JSON body
    payload = {
        "client_id": client_id,
        "instagram_url": "https://www.instagram.com/pixely_agency", # Mock URL
        "comments_limit": 50 # Review limit for speed
    }
    
    response = client.post("/pipeline/start", json=payload)
    
    if response.status_code == 200:
        logger.info(f"✅ Pipeline Triggered. Response: {response.json()}")
        return True
    elif response.status_code == 404:
        logger.warning("⚠️ 404 - Trying with /api/v1 prefix...")
        response = client.post("/api/v1/pipeline/start", json=payload)
        if response.status_code == 200:
             logger.info(f"✅ Pipeline Triggered. Response: {response.json()}")
             return True
        else:
             logger.error(f"❌ Failed to trigger pipeline. Status: {response.status_code}, Body: {response.text}")
    else:
        logger.error(f"❌ Failed to trigger pipeline. Status: {response.status_code}, Body: {response.text}")
        
    return False

if __name__ == "__main__":
    CLIENT_ID = "orchestrator_test_user_01"
    if setup_data(CLIENT_ID):
        run_pipeline(CLIENT_ID)
