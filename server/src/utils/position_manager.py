from typing import List, Dict, Optional
from supabase import Client

class PositionManager:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_sorted_positions(self, table: str, parent_id: str, parent_field: str) -> List[Dict]:
        resp = (
            self.supabase
            .table(table)
            .select("id, position")
            .eq(parent_field, parent_id)
            .order("position")
            .execute()
        )
        return resp.data or []

    async def shift_positions_higher(self, table: str, parent_id: str, parent_field: str, start_pos: int) -> None:
        items = (
            self.supabase
            .table(table)
            .select("id, position")
            .eq(parent_field, parent_id)
            .gte("position", start_pos)
            .order("position")
            .execute()
        ).data or []
        
        for item in items:
            new_pos = item["position"] + 1
            self.supabase \
                .table(table) \
                .update({"position": new_pos}) \
                .eq("id", item["id"]) \
                .execute()

    async def shift_positions_lower(self, table: str, parent_id: str, parent_field: str, start_pos: int) -> None:
        items = (
            self.supabase
            .table(table)
            .select("id, position")
            .eq(parent_field, parent_id)
            .gt("position", start_pos)
            .order("position")
            .execute()
        ).data or []
        
        for item in items:
            new_pos = item["position"] - 1
            self.supabase \
                .table(table) \
                .update({"position": new_pos}) \
                .eq("id", item["id"]) \
                .execute()

    async def normalize_positions(self, table: str, parent_id: str, parent_field: str) -> None:
        rows = await self.get_sorted_positions(table, parent_id, parent_field)
        for i, row in enumerate(rows, 1):
            self.supabase \
                .table(table) \
                .update({"position": i}) \
                .eq("id", row["id"]) \
                .execute()

    async def insert_position(self, table: str, parent_id: str, parent_field: str, pos: int) -> int:
        await self.shift_positions_higher(table, parent_id, parent_field, pos)
        return pos

    def swap_positions(self, table: str, parent_field: str, parent_id: str, id1: str, new_position: int) -> None:
        current_resp = self.supabase.table(table).select("position")\
            .eq("id", id1).eq(parent_field, parent_id).single().execute()
        
        if not current_resp.data:
            return
            
        old_position = current_resp.data["position"]

        target_resp = self.supabase.table(table).select("id").eq(parent_field, parent_id)\
            .eq("position", new_position).limit(1).execute()
        target_id = target_resp.data[0]["id"] if target_resp.data else None

        self.supabase.table(table).update({"position": new_position})\
            .eq("id", id1).eq(parent_field, parent_id).execute()

        if target_id:
            self.supabase.table(table).update({"position": old_position})\
                .eq("id", target_id).eq(parent_field, parent_id).execute()

