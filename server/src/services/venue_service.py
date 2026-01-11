from supabase import Client
from typing import Tuple, List


class VenueService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_my_venues(self, owner_id: str) -> Tuple[List[dict], int]:
        response = (
            self.supabase
            .table("venues")
            .select("*", count="exact")
            .eq("owner_id", owner_id)
            .execute()
        )
        return response.data, response.count

    
    # async def create_venue(self):
    #     pass
