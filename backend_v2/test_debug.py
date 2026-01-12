
import requests
import json
import time

BASE_URL = "http://localhost:8002"

def test(method, path, payload=None):
    url = f"{BASE_URL}{path}"
    print(f"\nTesting {method} {url}...")
    try:
        if method == "GET":
            resp = requests.get(url)
        elif method == "PUT":
            resp = requests.put(url, json=payload)
        elif method == "PATCH":
            resp = requests.patch(url, json=payload)
        
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

# 1. Base Users List
test("GET", "/users/")

# 2. Plan (Existing endpoint)
test("GET", "/users/123/plan")

# 3. New Profile Endpoint
test("POST", "/admin-users/update-debug", {"user_id": "123", "updates": {"full_name": "Test"}})
test("POST", "/admin-users/update-debug/", {"user_id": "123", "updates": {"full_name": "Test (Slash)"}})
# Probe existence (Expect 405 if route exists, 404 if not)
test("GET", "/admin-users/123")
