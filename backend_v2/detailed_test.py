"""
Detailed diagnostic test - check exact Supabase behavior
"""
import requests
import json

print("=== DETAILED DIAGNOSTIC TEST ===\n")

# Step 1: Get a real user
url = "http://localhost:8002/users/"
r = requests.get(url)
users = r.json()

if not users:
    print("❌ No users found")
    exit(1)

user = users[0]
print(f"Test user:")
print(f"  ID: {user['id']}")  
print(f"  Email: {user.get('email', 'N/A')}")
print(f"  Name: {user.get('full_name', 'N/A')}")
print(f"  Current client_id: {user.get('client_id', 'NULL')}\n")

# Step 2: Send update with detailed payload
TEST_VALUE = "DIAGNOSTIC-888"
update_url = "http://localhost:8002/admin-users/update-debug"
payload = {
    "user_id": user['id'],
    "updates": {
        "client_id": TEST_VALUE
    }
}

print(f"Sending update:")
print(f"  URL: {update_url}")
print(f"  User ID: {user['id']}")
print(f"  Updating client_id to: {TEST_VALUE}\n")

r2 = requests.post(update_url, json=payload)

print(f"Response:")
print(f"  Status: {r2.status_code}")
print(f"  Body: {r2.text}\n")

if r2.status_code != 200:
    print("❌ Update failed - non-200 status")
    print(f"   This means the backend threw an error")
    print(f"   Check backend logs for 'CRITICAL: admin_client is NULL' or other errors")
    exit(1)

# Step 3: Verify in database
print("Verifying in database...")
r3 = requests.get(url)
users2 = r3.json()
user2 = next((u for u in users2 if u['id'] == user['id']), None)

if not user2:
    print("❌ User not found in verification query!")
    exit(1)

final_client_id = user2.get('client_id', 'NULL')
print(f"  Final client_id in DB: {final_client_id}\n")

if final_client_id == TEST_VALUE:
    print("✅✅✅ SUCCESS! client_id PERSISTED")
    print("The bug is FIXED!")
else:
    print(f"❌ FAILED - client_id did not persist")
    print(f"   Expected: {TEST_VALUE}")
    print(f"   Got: {final_client_id}")
    print()
    print("DIAGNOSIS:")
    print("  - Backend returned 200 OK")
    print("  - admin_client is initialized (no error)")
    print("  - But Supabase isn't saving the data")
    print()
    print("  Possible causes:")
    print("  1. Supabase response.data is empty (check backend logs)")
    print("  2. User ID mismatch or encoding issue")
    print("  3. Supabase execute() succeeds but doesn't commit")
    print()
    print("  ACTION: Check backend terminal for:")
    print("  - '✅ Using ADMIN client'")
    print("  - 'DB: Response data: [...]'")
    print("  - '✅ Update successful'")
