"""
Test status endpoint after cleanup
"""
import requests

BASE_URL = "http://localhost:8002"

print("=== TESTING STATUS AFTER CLEANUP ===\n")

# Get a client
r = requests.get(f"{BASE_URL}/clients/")
clients = r.json()

if clients:
    test_client = clients[0]
    print(f"Testing: {test_client['nombre']}")
    print(f"ID: {test_client['id']}\n")
    
    # Get status
    r2 = requests.get(f"{BASE_URL}/clients/{test_client['id']}/status")
    if r2.status_code == 200:
        status = r2.json()
        print("Status Response:")
        print(f"  hasInterview: {status['hasInterview']} ✅ (should be False)")
        print(f"  hasBrandIdentity: {status['hasBrandIdentity']}")
        print(f"  canExecuteAnalysis: {status['canExecuteAnalysis']}")
        
        if status['hasInterview'] == False:
            print("\n✅ SUCCESS: Status endpoint working correctly!")
            print("When you create a new interview with correct client_id, it will show hasInterview: True")
        else:
            print("\n⚠️ Unexpected: hasInterview should be False after cleanup")
    else:
        print(f"❌ Error: {r2.status_code}")
else:
    print("No clients found")
