"""
List all clients and all interviews to understand the mismatch
"""
import sys
sys.path.append('.')

from app.services.database import db
import json

print("=== ALL CLIENTS ===\n")
clients = db.list_clients()
for c in clients:
    print(f"{c['nombre']:30} | ID: {c['id']}")

print(f"\n=== ALL INTERVIEWS (Total: ?) ===\n")
try:
    interviews = db.client.table("client_interviews").select("client_id, id").execute()
    print(f"Total interviews: {len(interviews.data)}\n")
    
    for inv in interviews.data:
        print(f"Interview ID: {inv['id']}")
        print(f"  client_id: {inv['client_id']}")
        print()
        
except Exception as e:
    print(f"Error: {e}")

print("\n=== RECOMMENDATION ===")
print("The 'client_id' in client_interviews should match the 'id' in clients table.")
print("Currently they don't match - that's why get_interview() returns None.")
