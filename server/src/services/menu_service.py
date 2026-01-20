from typing import List, Dict
import postgrest
from src.utils.position_manager import PositionManager
from src.services.category_service import CategoryService
from src.utils.image_handler import ImageHandler
from src.schemas.menu import MenuCreate, MenuUpdate
from supabase import Client

class MenuService(PositionManager):
    def __init__(self, supabase: Client):
        super().__init__(supabase)
        self.supabase = supabase

    async def get_menus(self, venue_id: str) -> List[Dict]:
        response = (
            self.supabase
            .table("menus")
            .select("""*, categories (*, items(*))""")
            .eq("venue_id", venue_id)
            .order("position")
            .execute()
        )
        return response.data or []

    async def get_menu_by_id(self, menu_id: str, venue_id: str) -> Dict | None:
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

    async def create_menu(self, venue_id: str, data: MenuCreate) -> Dict:
        payload = data.model_dump(exclude_none=True)
        payload["venue_id"] = venue_id

        insert_pos = payload.get("position", 1)
        if insert_pos < 0:
            insert_pos = 0

        insert_pos = await self.insert_position("menus", venue_id, "venue_id", insert_pos)
        payload["position"] = insert_pos

        created = self.supabase.table("menus").insert(payload).execute().data[0]
        return created

    async def delete_menu(self, venue_id: str, menu_id: str) -> Dict:
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
            ir = ImageHandler(self.supabase)
            paths = ir.get_clean_file_paths([image_url])
            try:
                await ir.delete_non_default_images(paths)
            except:
                pass

        self.supabase.table("menus").delete().eq("id", menu_id).eq("venue_id", venue_id).execute()
        await self.shift_positions_lower("menus", venue_id, "venue_id", check_resp.data.get("position", 1))

        return {"success": True}

    async def update_menu(self, data: MenuUpdate, venue_id: str, menu_id: str) -> Dict:
        payload = data.model_dump(exclude_none=True, exclude={"position"})

        if data.position is not None:
            self.swap_positions("menus", "venue_id", venue_id, menu_id, data.position)

        response = (
            self.supabase
            .table("menus")
            .update(payload)
            .eq("id", menu_id)
            .eq("venue_id", venue_id)
            .execute()
        )
        return response.data[0] if response.data else {}
