"""
Simple direct test - save output to file
"""
import requests
import json

url = "http://localhost:8002/users/"
print("Fetching users...")
try:
    r = requests.get(url)
    users = r.json()
    
    if users:
        user = users[0]
        print(f"User ID: {user['id']}")
        print(f"Current client_id: {user.get('client_id', 'NULL')}")
        
        # Update
        update_url = "http://localhost:8002/admin-users/update-debug"
        payload = {
            "user_id": user['id'],
            "updates": {
                "client_id": "DIRECT-TEST-999"
            }
        }
        print(f"\nSending update to: {update_url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        r2 = requests.post(update_url, json=payload)
        print(f"Update status: {r2.status_code}")
        print(f"Update response: {r2.text}\n")
        
        # Check again
        r3 = requests.get(url)
        users2 = r3.json()
        user2 = [u for u in users2 if u['id'] == user['id']][0]
        
        final_val = user2.get('client_id', 'NULL')
        print(f"After update, client_id = {final_val}")
        
        if final_val == "DIRECT-TEST-999":
            print("✅ PERSISTED")
        else:
            print("❌ NOT PERSISTED")
            
except Exception as e:
    print(f"Error: {e}")
