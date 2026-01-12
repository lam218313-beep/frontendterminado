"""
Debug client status endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8002"

print("=== TESTING CLIENT STATUS ENDPOINT ===\n")

# Get clients
r = requests.get(f"{BASE_URL}/clients/")
clients = r.json()

print(f"Total clients: {len(clients)}\n")

for client in clients:
    print(f"\n{'='*60}")
    print(f"Cliente: {client['nombre']}")
    print(f"ID: {client['id']}")
    print(f"Plan: {client.get('plan', 'N/A')}")
    
    # Get status
    try:
        r2 = requests.get(f"{BASE_URL}/clients/{client['id']}/status")
        if r2.status_code == 200:
            status = r2.json()
            print(f"\nStatus Response:")
            print(json.dumps(status, indent=2))
            
            print(f"\n✓ Has Interview: {status['hasInterview']}")
            print(f"✓ Has Brand: {status['hasBrandIdentity']}")
            print(f"✓ Can Execute Analysis: {status['canExecuteAnalysis']}")
        else:
            print(f"❌ Status Error: {r2.status_code} - {r2.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

print(f"\n{'='*60}")
print("\n=== CHECKING INTERVIEWS DIRECTLY ===\n")

# Check interviews table directly
from backend_v2.app.services.database import db

for client in clients[:3]:  # Check first 3
    interview = db.get_interview(client['id'])
    print(f"Cliente: {client['nombre']}")
    print(f"  Interview in DB: {interview is not None}")
    if interview:
        print(f"  Interview keys: {list(interview.keys())}")
    print()
