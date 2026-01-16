from typing import List, Tuple

import postgrest
from src.services.category_service import CategoryService
from src.utils.image_remove import ImageRemover
from src.schemas.menu import MenuCreate, MenuUpdate
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
            .select("""*, categories (*, items ( * )))""")
            .eq("venue_id", venue_id)
            .execute()
        )
        return response.data

    async def get_menu_by_id(self, menu_id: str, venue_id: str) -> dict | None:
        try:
            resp = (
                self.supabase
                .table("menus")
                .select("id")
                .eq("id", menu_id)
                .eq("venue_id", venue_id)
                .maybe_single()
                .execute()
            )
            return resp.data
        except postgrest.exceptions.APIError as e:
            if e.code == '204':
                return None
            raise




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
        check_resp = self.supabase.table("menus").select("id")\
            .eq("id", menu_id).eq("venue_id", venue_id).maybe_single().execute()
        
        if not check_resp.data:
            return {"success": False, "error": "Menu not found"}
        
        cs = CategoryService(self.supabase)
        try:
            categories_resp = self.supabase.table("categories").select("id")\
                .eq("menu_id", menu_id).execute()
            for cat in categories_resp.data or []:
                await cs.delete_category(venue_id, menu_id, cat["id"])
        except Exception as e:
            print(f"Categories delete error: {e}")
        
        image_url = None
        try:
            menu_resp = self.supabase.table("menus").select("image")\
                .eq("id", menu_id).eq("venue_id", venue_id).maybe_single().execute()
            image_url = menu_resp.data.get("image") if menu_resp.data else None
        except postgrest.exceptions.APIError:
            pass
        
        if image_url:
            ir = ImageRemover(self.supabase)
            paths = ir.get_clean_file_paths([image_url])
            try:
                await ir.delete_non_default_images(paths)
            except:
                pass 
        
        try:
            self.supabase.table("menus").delete().eq("id", menu_id).eq("venue_id", venue_id).execute()
        except postgrest.exceptions.APIError as e:
            if e.code != '204':
                raise
        
        await self._normalize_menu_positions(venue_id)
        return {"success": True}



    def _change_position(self, venue_id: str, menu_id: str, new_position: int) -> None:
        current_resp = (
            self.supabase
            .table("menus")
            .select("id, position")
            .eq("id", menu_id)
            .eq("venue_id", venue_id)
            .limit(1)
            .execute()
        )
        current_rows = current_resp.data or []
        if not current_rows:
            return

        old_position = current_rows[0].get("position") or 0
        if old_position == new_position:
            return

        target_resp = (
            self.supabase
            .table("menus")
            .select("id, position")
            .eq("venue_id", venue_id)
            .eq("position", new_position)
            .limit(1)
            .execute()
        )
        target_rows = target_resp.data or []
        target_menu = target_rows[0] if target_rows else None

        (
            self.supabase
            .table("menus")
            .update({"position": new_position})
            .eq("id", menu_id)
            .eq("venue_id", venue_id)
            .execute()
        )

        if target_menu:
            (
                self.supabase
                .table("menus")
                .update({"position": old_position})
                .eq("id", target_menu["id"])
                .eq("venue_id", venue_id)
                .execute()
            )
    
    async def update_menu(self, data: MenuUpdate, venue_id: str, menu_id: str) -> dict:
        payload = data.model_dump(exclude_none=True)

        if data.position is not None:
            self._change_position(venue_id=venue_id, menu_id=menu_id, new_position=data.position)

        response = (
            self.supabase
            .table("menus")
            .update(payload)
            .eq("id", menu_id)
            .eq("venue_id", venue_id)
            .execute()
        )
        return response.data[0] if response.data else {}
