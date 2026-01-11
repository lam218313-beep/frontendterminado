import sys
import os

# Add app directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from fastapi.testclient import TestClient
from app.main import app
from app.services.database import db

# Override Auth for testing
# import from app.routers.auth import get_current_user # Removed: not found and maybe not needed if strategy router isn't secured directly

# def mock_get_current_user():
#     return {"id": "test_user_id", "email": "test@example.com"}

# app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)

def test_strategy_to_task_flow():
    print("--- Starting Verification Flow ---")
    
    # 1. Define Test Data
    client_id = "test_client_id_123"
    strategy_nodes = [
        {
            "id": "node_1",
            "type": "main",
            "label": "Main Goal",
            "x": 100,
            "y": 100,
            "parentId": None
        },
        {
            "id": "node_post_1",
            "type": "post",
            "label": "Instagram Post: Launch",
            "description": "Post about the new launch",
            "x": 200,
            "y": 200,
            "parentId": "node_1"
        }
    ]
    
    # 1.5. Prepare DB: Ensure Client Exists
    print(f"[Setup] Ensuring client '{client_id}' exists...")
    try:
        # Assuming db.client exposes Supabase client or we use a raw query/direct insert
        # We need to import db properly.
        # Check if db.client is accessible. Yes it is from imports.
        db.client.table("clients").upsert({
            "id": client_id,
            "nombre": "Test Client",
            "industry": "Testing",
            "is_active": True
        }).execute()
    except Exception as e:
        print(f"[Setup Warning] Could not upsert client: {e}. Proceeding hoping it exists or ignored.")

    # 2. Sync Strategy (Should trigger task creation)
    print(f"\n[Step 1] Syncing Strategy for Client: {client_id}")
    response = client.post(
        "/strategy/sync",  # Fixed URL: strategy router has no /api/v1 prefix in main.py
        json={
            "client_id": client_id,
            "nodes": strategy_nodes
        }
    )
    
    if response.status_code != 200:
        print(f"FAILED: Sync failed with {response.status_code}: {response.text}")
        return

    data = response.json()
    print(f"SUCCESS: Sync response: {data}")
    
    if data.get("tasks_created", 0) > 0:
        print("[Check] 'tasks_created' count is positive.")
    else:
        print("[Warning] 'tasks_created' is 0. Maybe task already existed?")

    # 3. Verify Task Creation via Get Tasks
    print(f"\n[Step 2] Fetching Tasks for Client: {client_id}")
    response = client.get(f"/api/v1/fichas/{client_id}/tasks")
    
    if response.status_code != 200:
        print(f"FAILED: Get Tasks failed with {response.status_code}: {response.text}")
        return
        
    tasks_data = response.json()
    # Flatten checks
    all_tasks = tasks_data.get("week_1", []) + tasks_data.get("week_2", []) + \
                tasks_data.get("week_3", []) + tasks_data.get("week_4", [])
    
    found = False
    for t in all_tasks:
        if t["title"] == "Instagram Post: Launch":
            print(f"SUCCESS: Found task '{t['title']}' with IDs '{t['id']}' and status '{t['status']}'")
            found = True
            break
            
    if not found:
        print("FAILED: Could not find the expected task in the response.")
    else:
        print("\n--- Verification Complete: FLOW VALID ---")

if __name__ == "__main__":
    try:
        test_strategy_to_task_flow()
    except Exception as e:
        print(f"An error occurred: {e}")
