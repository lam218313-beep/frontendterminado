"""
Find Test Client and check its interview
"""
import sys
sys.path.append('.')

from app.services.database import db

print("=== FINDING TEST CLIENT ===\n")

# Get all clients
clients = db.list_clients()

# Find Test Client
test_client = None
for client in clients:
    if 'test' in client.get('nombre', '').lower():
        print(f"Found: {client['nombre']}")
        print(f"  ID: {client['id']}")
        print(f"  Industry: {client.get('industry', 'N/A')}")
        print(f"  Plan: {client.get('plan', 'N/A')}")
        test_client = client
        print()

if not test_client:
    print("❌ Test Client not found\n")
    print("Available clients:")
    for c in clients:
        print(f"  - {c['nombre']} ({c['id']})")
else:
    print(f"\n=== CHECKING INTERVIEW FOR {test_client['nombre']} ===\n")
    
    client_id = test_client['id']
    
    # Try to get interview
    interview = db.get_interview(client_id)
    print(f"get_interview('{client_id}'):")
    print(f"  Result: {interview}\n")
    
    # Check all interviews in table
    print("All interviews in table:")
    try:
        all_interviews = db.client.table("client_interviews").select("*").execute()
        print(f"  Total count: {len(all_interviews.data)}\n")
        
        for inv in all_interviews.data:
            print(f"  Interview:")
            print(f"    client_id: {inv.get('client_id')}")
            print(f"    Keys: {list(inv.keys())[:5]}...")
            print()
            
    except Exception as e:
        print(f"  Error: {e}")
