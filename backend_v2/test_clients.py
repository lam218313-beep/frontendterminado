"""
Test the new clients endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8002"

print("=== TESTING CLIENTS ENDPOINTS ===\n")

# Test 1: List clients
print("[1] GET /clients/")
r = requests.get(f"{BASE_URL}/clients/")
print(f"Status: {r.status_code}")
clients = r.json()
print(f"Total clients: {len(clients)}")

if clients:
    client = clients[0]
    client_id = client['id']
    print(f"First client: {client['nombre']} (ID: {client_id})\n")
    
    # Test 2: Get client status
    print(f"[2] GET /clients/{client_id}/status")
    r2 = requests.get(f"{BASE_URL}/clients/{client_id}/status")
    print(f"Status: {r2.status_code}")
    if r2.status_code == 200:
        status = r2.json()
        print(f"Response: {json.dumps(status, indent=2)}\n")
        
        print(f"Has Interview: {'✅' if status['hasInterview'] else '❌'}")
        print(f"Has Brand: {'✅' if status['hasBrandIdentity'] else '❌'}")
        print(f"Can Execute Analysis: {'✅' if status['canExecuteAnalysis'] else '❌'}\n")
    else:
        print(f"Error: {r2.text}\n")
    
    # Test 3: Update client
    print(f"[3] PUT /clients/{client_id}")
    update_data = {"plan": "basic"}
    r3 = requests.put(f"{BASE_URL}/clients/{client_id}", json=update_data)
    print(f"Status: {r3.status_code}")
    if r3.status_code == 200:
        print(f"✅ Updated client plan to 'basic'")
    else:
        print(f"Error: {r3.text}")

else:
    print("No clients found")

print("\n=== TESTS COMPLETE ===")
