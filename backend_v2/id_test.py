"""
Test to investigate user ID mismatch
"""
import requests

print("=== USER ID INVESTIGATION ===\n")

# Get users from our API
r = requests.get("http://localhost:8002/users/")
users = r.json()

if users:
    user = users[0]
    print(f"User from /users/ endpoint:")
    print(f"  id: {user.get('id')}")
    print(f" full_name: {user.get('full_name')}")
    print(f"  email: {user.get('email')}")
    print(f"  client_id: {user.get('client_id')}\n")
    
    # Try to update this user
    payload = {
        "user_id": user['id'],
        "updates": {"client_id": "ID-CHECK-999"}
    }
    
    print(f"Attempting update with user_id: {user['id']}")
    r2 = requests.post("http://localhost:8002/admin-users/update-debug", json=payload)
    print(f"Status: {r2.status_code}")
    print(f"Response: {r2.text}\n")
    
    # Verify
    r3 = requests.get("http://localhost:8002/users/")
    users2 = r3.json()
    user2 = next((u for u in users2 if u['id'] == user['id']), None)
    
    if user2:
        final = user2.get('client_id')
        print(f"After update, client_id = {final}")
        
        if final == "ID-CHECK-999":
            print("✅ SUCCESS")
        else:
            print("❌ FAILED")
            print("\nCheck backend_v2/database_debug.log for:")
            print("  - 'DB: Response count: 0' or 'None'")
            print("  - This means the user_id doesn't exist in Supabase when filtering")
    else:
        print("❌ User disappeared after update!")
else:
    print("No users found")
