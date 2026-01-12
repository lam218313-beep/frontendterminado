"""
Clean all interviews from the database
"""
import sys
sys.path.append('.')

from app.services.database import db

print("=== CLEANING CLIENT_INTERVIEWS TABLE ===\n")

# Get current count
try:
    before = db.client.table("client_interviews").select("id").execute()
    print(f"Current interviews in table: {len(before.data)}\n")
    
    # Delete all
    print("Deleting all interviews...")
    
    # Supabase doesn't have a simple "delete all", we need to delete by condition
    # We'll use a condition that matches all rows
    result = db.admin_client.table("client_interviews").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    
    print(f"✅ Deletion complete\n")
    
    # Verify
    after = db.client.table("client_interviews").select("id").execute()
    print(f"Interviews remaining: {len(after.data)}\n")
    
    if len(after.data) == 0:
        print("✅ Table successfully cleaned!")
        print("New interviews can now be created with correct client_id format.")
    else:
        print(f"⚠️ Warning: {len(after.data)} interviews still remain")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nNote: If this fails, you can also clean the table directly in Supabase dashboard.")
