"""
Check interviews table directly
"""
import sys
sys.path.append('.')

from app.services.database import db

print("=== CHECKING INTERVIEWS TABLE ===\n")

# Test get_interview for a sample client
test_client_id = "ca7226fc-cedb-4a95-978b-95a8274c5a00"  # Duolingo from earlier tests

print(f"Testing client ID: {test_client_id}\n")

interview = db.get_interview(test_client_id)
print(f"get_interview() result: {interview}\n")

# Try to query the table directly
try:
    response = db.client.table("client_interviews").select("*").limit(5).execute()
    print(f"Direct query to client_interviews:")
    print(f"  Count: {len(response.data)}")
    if response.data:
        print(f"  Sample: {response.data[0].keys()}")
        for item in response.data[:3]:
            print(f"    - client_id: {item.get('client_id')}, has data: {bool(item)}")
    else:
        print("  No data found")
except Exception as e:
    print(f"  Error: {e}")

print("\n=== CHECKING ALTERNATIVE TABLE NAMES ===\n")

# Try interviews (without client_ prefix)
try:
    response = db.client.table("interviews").select("*").limit(5).execute()
    print(f"Table 'interviews':")
    print(f"  Count: {len(response.data)}")
    if response.data:
        for item in response.data[:3]:
            print(f"    - Keys: {list(item.keys())}")
except Exception as e:
    print(f"  Error: {e}")
