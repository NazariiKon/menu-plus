
from fastapi.encoders import jsonable_encoder
from supabase import Client

from src.schemas.menu import ItemCreate, ItemRead
from src.utils.image_remove import ImageRemover


class ItemService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def delete_item(self, category_id: str, item_id: str) -> dict:
        item_resp = (
            self.supabase
            .table("items")
            .select("image")
            .eq("id", item_id)
            .eq("category_id", category_id)
            .single()
            .execute()
        )
        ir = ImageRemover(self.supabase)
        item_images = [item_resp.data.get("image")] if item_resp.data else []
        item_file_paths = ir.get_clean_file_paths(item_images)
        await ir.delete_non_default_images(item_file_paths)

        deleted_resp = (
            self.supabase
            .table("items")
            .delete()
            .eq("id", item_id)
            .eq("category_id", category_id)
            .execute()
        )
        
        return deleted_resp.data[0] if deleted_resp.data else {}
    
    async def create_item(self, data: ItemCreate, category_id: str) -> ItemRead:
        payload = jsonable_encoder(data.model_dump(exclude_none=True))
        payload["category_id"] = category_id
        insert_pos = payload.get("position") or 1
        if insert_pos < 1:
            insert_pos = 1

        existing = await self._fetch_item_positions(category_id)
        for r in sorted(existing, key=lambda m: (m.get("position") or 0), reverse=True):
            pos = r.get("position") or 0
            if pos >= insert_pos:
                self.supabase \
                    .table("items") \
                    .update({"position": pos + 1}) \
                    .eq("id", r["id"]) \
                    .execute()

        payload["position"] = insert_pos

        created = self.supabase.table("items").insert(payload).execute().data[0]

        return ItemRead(**created)


    async def get_items_by_category(self, category_id: str) -> list[ItemRead]:
        response = (
            self.supabase
            .table("items")
            .select("*")
            .eq("category_id", category_id)
            .execute()
        )
        return [ItemRead(**item) for item in response.data]


    async def _fetch_item_positions(self, category_id: str) -> list[dict]:
        response = (
            self.supabase
            .table("items")
            .select("id, position")
            .eq("category_id", category_id)
            .execute()
        )
        return response.data
