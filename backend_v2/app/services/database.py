import logging
from typing import Optional, Any
from supabase import create_client, Client
from ..config import settings

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        else:
            logger.warning("Supabase credentials missing. Persistence disabled.")
            self.client = None

    def create_report(self, report_id: str, client_id: str, status: str = "PROCESSING"):
        if not self.client: return
        data = {
            "id": report_id,
            "client_id": client_id,
            "status": status,
            "created_at": "now()"
        }
        try:
            self.client.table("analysis_reports").insert(data).execute()
        except Exception as e:
            logger.error(f"DB Insert Error: {e}")

    def update_report_status(self, report_id: str, status: str, result: Optional[dict] = None, error: Optional[str] = None):
        if not self.client: return
        data = {"status": status}
        if result:
            data["frontend_compatible_json"] = result
        if error:
            data["error_message"] = error
            
        try:
            self.client.table("analysis_reports").update(data).eq("id", report_id).execute()
        except Exception as e:
            logger.error(f"DB Update Error: {e}")

    def get_latest_completed_report(self, client_id: str) -> Optional[dict]:
        if not self.client: return None
        try:
            response = self.client.table("analysis_reports")\
                .select("*")\
                .eq("client_id", client_id)\
                .eq("status", "COMPLETED")\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            if response.data:
                return response.data[0]
        except Exception as e:
            logger.error(f"DB Select Error: {e}")
        return None

db = SupabaseService()
