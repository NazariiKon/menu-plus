from typing import List, Dict
from supabase import Client
import uuid
from src.utils.position_manager import PositionManager
from src.utils.image_handler import ImageHandler
from src.services.item_service import ItemService
from src.schemas.menu import CategoryCreate, CategoryUpdate

class CategoryService(PositionManager):
    def __init__(self, supabase: Client):
        super().__init__(supabase)
        self.supabase = supabase

    async def get_categories(self, menu_id: str) -> List[Dict]:
        response = (
            self.supabase
            .table("categories")
            .select("""*, items(*)""")
            .eq("menu_id", menu_id)
            .order("position")
            .execute()
        )
        return response.data or []

    async def create_category(self, menu_id: str, data: CategoryCreate) -> Dict:
        payload = data.model_dump(exclude_none=True, exclude={"image_bytes"})
        payload["menu_id"] = menu_id

        image_path = await ImageHandler(self.supabase).upload_image(data.image_bytes, f"categories/{uuid.uuid4()}.jpg")
        if image_path:
            payload["image"] = image_path

        insert_pos = payload.get("position", 1)
        if insert_pos < 1:
            insert_pos = 1

        insert_pos = await self.insert_position("categories", menu_id, "menu_id", insert_pos)
        payload["position"] = insert_pos

        created = self.supabase.table("categories").insert(payload).execute().data[0]
        return created

    async def delete_category(self, venue_id: str, menu_id: str, category_id: str) -> Dict:
        items_resp = (
            self.supabase
            .table("items")
            .select("id")
            .eq("category_id", category_id)
            .execute()
        )

        itemS = ItemService(self.supabase)
        for item in items_resp.data or []:
            await itemS.delete_item(category_id, item["id"])

        category_resp = (
            self.supabase
            .table("categories")
            .select("image")
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )

        ir = ImageHandler(self.supabase)
        category_images = [category_resp.data[0].get("image")] if category_resp.data else []
        category_file_paths = ir.get_clean_file_paths(category_images)
        await ir.delete_non_default_images(category_file_paths)

        deleted_resp = (
            self.supabase
            .table("categories")
            .delete()
            .eq("id", category_id)
            .eq("menu_id", menu_id)
            .execute()
        )

        await self.shift_positions_lower("categories", menu_id, "menu_id", deleted_resp.data[0].get("position", 1) if deleted_resp.data else 1)
        return deleted_resp.data[0] if deleted_resp.data else {}

    async def update_category(self, data: CategoryUpdate, current_menu_id: str, category_id: str) -> Dict:
        current_resp = self.supabase.table("categories") \
            .select("*, items(*)") \
            .eq("id", category_id).eq("menu_id", current_menu_id).single().execute()

        if not current_resp.data:
            raise ValueError("Category not found")

        current_cat = current_resp.data
        current_position = current_cat.get("position", 0)

        payload = data.model_dump(exclude_none=True, exclude={"image_bytes", "menu_id", "position"})

        if data.image_bytes:
            image_bytes = data.image_bytes
            if hasattr(image_bytes, 'read'):
                image_bytes = await image_bytes.read()

            new_image_path = await ImageHandler(self.supabase).upload_image(image_bytes, f"categories/{category_id}.jpg")
            payload["image"] = new_image_path

        if data.menu_id and data.menu_id != current_menu_id:
            await self.shift_positions_lower("categories", current_menu_id, "menu_id", current_position)

            new_position = await self.get_max_position("categories", data.menu_id, "menu_id") + 1
            payload["menu_id"] = data.menu_id
            payload["position"] = new_position

        elif data.position is not None and data.position != current_position:
            self.swap_positions("categories", "menu_id", current_menu_id, category_id, data.position)
            payload.pop("position", None)

        if payload:
            response = self.supabase.table("categories") \
                .update(payload).eq("id", category_id).execute()
            result = response.data[0] if response.data else current_cat
        else:
            result = current_cat

        return result
