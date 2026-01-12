from supabase import Client

class ProfileService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def create_profile(self, user_id: str, name: str) -> dict:
        payload = {
            "id": user_id,
            "name": name
        }
        resp = (
            self.supabase
            .table("profiles")
            .insert(payload)
            .execute()
        )
        return resp.data
