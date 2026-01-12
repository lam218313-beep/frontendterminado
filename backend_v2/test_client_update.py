import requests
import json

BASE_URL = "http://localhost:8002"

# Get a real user ID first
print("Fetching users...")
users_resp = requests.get(f"{BASE_URL}/users/")
users = users_resp.json()
if users:
    test_user = users[0]
    print(f"Testing with user: {test_user['id']} - {test_user.get('email', 'no email')}")
    
    # Try to update with client_id
    payload = {
        "user_id": test_user['id'],
        "updates": {
            "full_name": test_user.get('full_name', 'Test User'),
            "client_id": "test-client-123"  # Test assignment
        }
    }
    
    print(f"\nSending update with payload: {json.dumps(payload, indent=2)}")
    update_resp = requests.post(f"{BASE_URL}/admin-users/update-debug", json=payload)
    print(f"Status: {update_resp.status_code}")
    print(f"Response: {update_resp.text}")
    
    # Fetch user again to verify
    print(f"\nFetching user again to verify...")
    user_check = requests.get(f"{BASE_URL}/users/")
    updated_user = [u for u in user_check.json() if u['id'] == test_user['id']][0]
    print(f"Updated user client_id: {updated_user.get('client_id', 'NOT SET')}")
else:
    print("No users found")
