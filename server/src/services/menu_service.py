from typing import List, Tuple
from src.schemas.menu import MenuCreate
from supabase import Client


class MenuService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def _fetch_positions(self, venue_id: str) -> list[dict]:
        resp = (
            self.supabase
            .table("menus")
            .select("id, position")
            .eq("venue_id", venue_id)
            .execute()
        )
        rows = resp.data or []
        return sorted(rows, key=lambda r: (r.get("position") or 0))

    async def _normalize_menu_positions(self, venue_id: str) -> None:
        rows = await self._fetch_positions(venue_id)
        for i, r in enumerate(rows, start=1):
            if (r.get("position") or 0) != i:
                (
                    self.supabase
                    .table("menus")
                    .update({"position": i})
                    .eq("id", r["id"])
                    .execute()
                )

    async def get_menus(self, venue_id: str) -> Tuple[List[dict], int]:
        response = (
            self.supabase
            .table("menus")
            .select("*")
            .eq("venue_id", venue_id)
            .execute()
        )
        return response.data

    async def create_menu(self, venue_id: str, data: MenuCreate) -> dict:
        payload = data.model_dump(exclude_none=True)
        payload["venue_id"] = venue_id

        insert_pos = payload.get("position") or 1
        if insert_pos < 1:
            insert_pos = 1

        existing = await self._fetch_positions(venue_id)

        for r in sorted(existing, key=lambda m: (m.get("position") or 0), reverse=True):
            pos = r.get("position") or 0
            if pos >= insert_pos:
                (
                    self.supabase
                    .table("menus")
                    .update({"position": pos + 1})
                    .eq("id", r["id"])
                    .execute()
                )

        payload["position"] = insert_pos
        created = self.supabase.table("menus").insert(payload).execute().data[0]
        return created

    async def delete_menu(self, venue_id: str, menu_id: str) -> dict:
        deleted_resp = (
            self.supabase
            .table("menus")
            .delete()
            .eq("id", menu_id)
            .eq("venue_id", venue_id)
            .execute()
        )
        deleted_rows = deleted_resp.data or []
        if not deleted_rows:
            return {}

        await self._normalize_menu_positions(venue_id)

        return deleted_rows[0]
