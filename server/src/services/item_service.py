import base64
from decimal import Decimal
import uuid
from fastapi.encoders import jsonable_encoder
from supabase import Client
from src.utils.position_manager import PositionManager
from src.schemas.menu import ItemCreate, ItemRead, ItemUpdate
from src.utils.image_handler import ImageHandler

class ItemService(PositionManager):
    def __init__(self, supabase: Client):
        super().__init__(supabase)
        self.supabase = supabase

    def _fix_decimals(data):
        return {k: str(v) if isinstance(v, Decimal) else v for k, v in data.items()}

    async def delete_item(self, category_id: str, item_id: str) -> dict:
        item_resp = (
            self.supabase
            .table("items")
            .select("image, position")
            .eq("id", item_id)
            .eq("category_id", category_id)
            .single()
            .execute()
        )
        
        if not item_resp.data:
            return {}

        ir = ImageHandler(self.supabase)
        item_images = [item_resp.data.get("image")]
        item_file_paths = ir.get_clean_file_paths(item_images)
        await ir.delete_non_default_images(item_file_paths)

        item_position = item_resp.data.get("position", 1)
        await self.shift_positions_lower("items", category_id, "category_id", item_position)

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
        payload = jsonable_encoder(data.model_dump(exclude_none=True, exclude={"image_bytes"}))
        payload["category_id"] = category_id
        if data.image_bytes:
            image_bytes = base64.b64decode(data.image_bytes)
        else:
            image_bytes = None
        image_path = await ImageHandler(self.supabase).upload_image(image_bytes, f"categories/{category_id}/{uuid.uuid4()}.jpg")
        if image_path:
            payload["image"] = image_path
        
        insert_pos = payload.get("position", 1)
        if insert_pos < 1:
            insert_pos = 1

        insert_pos = await self.insert_position("items", category_id, "category_id", insert_pos)
        payload["position"] = insert_pos

        created = self.supabase.table("items").insert(payload).execute().data[0]
        return ItemRead(**created)

    async def update_item(self, data: ItemUpdate, category_id: str, item_id: str) -> ItemRead:
        payload = jsonable_encoder(data.model_dump(exclude_none=True, exclude={"image_bytes", "position"}))
        if data.image_bytes:
            image_bytes = base64.b64decode(data.image_bytes)
        else:
            image_bytes = None
        image_path = await ImageHandler(self.supabase).upload_image(image_bytes, f"categories/{category_id}/{uuid.uuid4()}.jpg")
        if image_path:
            payload["image"] = image_path
            
        if data.position is not None:
            self.swap_positions("items", "category_id", category_id, item_id, data.position)
            payload.pop("position", None)

        response = (
            self.supabase
            .table("items")
            .update(payload)
            .eq("id", item_id)
            .eq("category_id", category_id)
            .execute()
        )
        return ItemRead(**response.data[0]) if response.data else None

    async def get_items_by_category(self, category_id: str) -> list[ItemRead]:
        response = (
            self.supabase
            .table("items")
            .select("*")
            .eq("category_id", category_id)
            .order("position")
            .execute()
        )
        return [ItemRead(**item) for item in response.data]

    async def normalize_positions(self, category_id: str) -> None:
        await self.normalize_positions("items", category_id, "category_id")
