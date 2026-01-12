
import sys
import os
import logging

# Add current dir to path so we can import app
sys.path.append(os.getcwd())

# Configure logging to see our new logs
logging.basicConfig(level=logging.INFO)

from app.services.database import db

def verify_users():
    print("\n--- Listing Users ---")
    users = db.list_users()
    print(f"Found {len(users)} users.")
    
    if not users:
        print("No users found to test update.")
        return

    target_user = users[0]
    user_id = target_user["id"]
    print(f"Targeting User: {user_id} ({target_user.get('full_name')})")

    print(f"\n--- Testing Update on {user_id} ---")
    try:
        # Update name temporarily
        original_name = target_user.get("full_name", "Unknown")
        new_name = original_name + " (Test)"
        
        db.update_user(user_id, {"full_name": new_name})
        print("✅ Update Successful!")
        
        # Revert
        db.update_user(user_id, {"full_name": original_name})
        print("✅ Revert Successful!")
        
    except Exception as e:
        print(f"❌ Update Failed: {e}")

if __name__ == "__main__":
    verify_users()
