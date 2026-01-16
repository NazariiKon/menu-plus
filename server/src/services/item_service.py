
from supabase import Client

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