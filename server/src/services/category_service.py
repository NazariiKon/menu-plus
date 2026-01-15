from typing import List
from supabase import Client
import uuid

from src.schemas.menu import CategoryCreate, CategoryUpdate

class CategoryService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def _fetch_positions(self, menu_id: str) -> list[dict]:
        resp = (
            self.supabase
            .table("categories")
            .select("id, position")
            .eq("menu_id", menu_id)
            .execute()
        )
        rows = resp.data or []
        return sorted(rows, key=lambda r: (r.get("position") or 0))

    async def _normalize_category_positions(self, menu_id: str) -> None:
        rows = await self._fetch_positions(menu_id)
        for i, r in enumerate(rows, start=1):
            if (r.get("position") or 0) != i:
                (
                    self.supabase
                    .table("categories")
                    .update({"position": i})
                    .eq("id", r["id"])
                    .execute()
                )

    async def _upload_image(self, image_bytes: bytes | None, category_id: str | None = None) -> str:
        if not image_bytes:
            return ""
        
        file_name = f"{uuid.uuid4()}.jpg" if not category_id else f"{category_id}.jpg"
        full_path = f"categories/{file_name}"
        
        self.supabase.storage.from_("images").upload(full_path, image_bytes)
        
        return full_path


    async def get_categories(self, menu_id: str) -> List[dict]:
        response = (
            self.supabase
            .table("categories")
            .select("""*, items(*)""")
            .eq("menu_id", menu_id)
            .order("position", desc=False)
            .execute()
        )
        return response.data or []
    
    async def create_category(self, menu_id: str, data: CategoryCreate) -> dict:
        payload = data.model_dump(exclude_none=True, exclude={"image_bytes"})
        payload["menu_id"] = menu_id

        image_path = await self._upload_image(data.image_bytes)
        if image_path:
            payload["image"] = image_path

        insert_pos = payload.get("position", 1)

        existing = await self._fetch_positions(menu_id)

        for r in sorted(existing, key=lambda c: (c.get("position") or 0), reverse=True):
            pos = r.get("position") or 0
            if pos >= insert_pos:
                (
                    self.supabase
                    .table("categories")
                    .update({"position": pos + 1})
                    .eq("id", r["id"])
                    .execute()
                )

        payload["position"] = insert_pos
        created = self.supabase.table("categories").insert(payload).execute().data[0]
        return created

    async def delete_category(self, menu_id: str, category_id: str) -> dict:
        category_resp = (
            self.supabase
            .table("categories")
            .select("image")
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )
        
        if category_resp.data:
            image_path = category_resp.data[0].get("image")
            if image_path:
                self.supabase.storage.from_("categories").remove([image_path])

        deleted_resp = (
            self.supabase
            .table("categories")
            .delete()
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )
        
        if deleted_resp.data:
            await self._normalize_category_positions(menu_id)
        
        return deleted_resp.data[0] if deleted_resp.data else {}

    def _change_position(self, menu_id: str, category_id: str, new_position: int) -> None:
        current_resp = (
            self.supabase
            .table("categories")
            .select("id, position")
            .eq("id", category_id)
            .eq("menu_id", menu_id)
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
            .table("categories")
            .select("id, position")
            .eq("menu_id", menu_id)
            .eq("position", new_position)
            .limit(1)
            .execute()
        )
        target_rows = target_resp.data or []
        target_category = target_rows[0] if target_rows else None

        (
            self.supabase
            .table("categories")
            .update({"position": new_position})
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )

        if target_category:
            (
                self.supabase
                .table("categories")
                .update({"position": old_position})
                .eq("id", target_category["id"])
                .eq("menu_id", menu_id)
                .execute()
            )

    async def update_category(self, data: CategoryUpdate, menu_id: str, category_id: str) -> dict:
        current_resp = (
            self.supabase
            .table("categories")
            .select("image")
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )
        current_image = current_resp.data[0].get("image") if current_resp.data else None

        payload = data.model_dump(exclude_none=True)

        if data.image_bytes:
            new_image_path = await self._upload_image(data.image_bytes, category_id)
            payload["image"] = new_image_path
            
            if current_image:
                self.supabase.storage.from_("categories").remove([current_image])

        if data.position is not None:
            self._change_position(menu_id=menu_id, category_id=category_id, new_position=data.position)

        response = (
            self.supabase
            .table("categories")
            .update(payload)
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )
        return response.data[0] if response.data else {}
