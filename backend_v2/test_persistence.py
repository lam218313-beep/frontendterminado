"""
Simple test to verify client_id update persistence
Run this while monitoring backend logs
"""
import requests
import json
import time

BASE_URL = "http://localhost:8002"

print("=" * 60)
print("CLIENT ID PERSISTENCE TEST")
print("=" * 60)

# Step 1: Get list of users
print("\n[1] Fetching users list...")
try:
    users_resp = requests.get(f"{BASE_URL}/users/")
    users_resp.raise_for_status()
    users = users_resp.json()
    
    if not users:
        print("❌ No users found!")
        exit(1)
    
    test_user = users[0]
    user_id = test_user['id']
    current_client = test_user.get('client_id', 'NOT SET')
    
    print(f"✓ Found user: {test_user.get('email', 'No email')}")
    print(f"  ID: {user_id}")
    print(f"  Current client_id: {current_client}")
    
except Exception as e:
    print(f"❌ Error fetching users: {e}")
    exit(1)

# Step 2: Update with new client_id
TEST_CLIENT_ID = "PERSISTENCE-TEST-123"
print(f"\n[2] Updating user with client_id: {TEST_CLIENT_ID}")
print("    Check backend terminal for '=== UPDATE DEBUG ===' logs...")

payload = {
    "user_id": user_id,
    "updates": {
        "client_id": TEST_CLIENT_ID
    }
}

try:
    update_resp = requests.post(
        f"{BASE_URL}/admin-users/update-debug",
        json=payload
    )
    update_resp.raise_for_status()
    result = update_resp.json()
    
    print(f"✓ Update response: {json.dumps(result, indent=2)}")
    print(f"  Returned client_id: {result.get('data', {}).get('client_id', 'NOT IN RESPONSE')}")
    
except Exception as e:
    print(f"❌ Error updating user: {e}")
    if hasattr(e, 'response'):
        print(f"   Response: {e.response.text}")
    exit(1)

# Step 3: Verify by fetching user again
print(f"\n[3] Verifying persistence...")
time.sleep(0.5)  # Small delay to ensure DB commit

try:
    verify_resp = requests.get(f"{BASE_URL}/users/")
    verify_resp.raise_for_status()
    updated_users = verify_resp.json()
    
    updated_user = next((u for u in updated_users if u['id'] == user_id), None)
    
    if not updated_user:
        print("❌ User not found in verification!")
        exit(1)
    
    final_client_id = updated_user.get('client_id', 'NOT SET')
    print(f"  Final client_id in database: {final_client_id}")
    
    if final_client_id == TEST_CLIENT_ID:
        print("\n✅ SUCCESS: client_id PERSISTED correctly!")
    else:
        print(f"\n❌ FAILURE: client_id NOT persisted")
        print(f"   Expected: {TEST_CLIENT_ID}")
        print(f"   Got: {final_client_id}")
        print("\n   This indicates the database update is not working.")
        print("   Check backend logs for errors in db.update_user()")
        
except Exception as e:
    print(f"❌ Error verifying: {e}")
    exit(1)

print("\n" + "=" * 60)
