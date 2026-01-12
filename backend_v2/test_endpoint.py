
import requests
import json

BASE_URL = "http://localhost:8000"

def test_put(path, payload):
    url = f"{BASE_URL}{path}"
    print(f"Testing PUT {url}...")
    try:
        resp = requests.put(url, json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

# Call with ID
test_put("/users/123/profile", {"full_name": "Test"})

# Call without ID (Should be 405 Method Not Allowed)
test_put("/users/", {"full_name": "Test"})
