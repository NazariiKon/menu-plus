import re
from supabase import Client
from typing import Tuple, List

from src.schemas.venue import VenueBase


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

    async def delete_venue_by_id(self, venue_id: str, owner_id: str) -> dict:
        response = (
            self.supabase
            .table("venues")
            .delete()
            .eq("id", venue_id)
            .eq("owner_id", owner_id)
            .execute()
        )
        return response.data




    
    async def create_venue(self, owner_id: str, data: VenueBase) -> dict:
        payload = data.model_dump(exclude_none=True)
        payload["owner_id"] = owner_id
        payload["slug"] = slugify(payload["name"])

        venue_resp = (
            self.supabase
            .table("venues")
            .insert(payload)
            .execute()
        )
        venue = venue_resp.data[0]
        venue_id = venue["id"]

        menu_resp = (
            self.supabase
            .table("menus")
            .insert({"venue_id": venue_id, "name": "Main menu"})
            .execute()
        )
        menu = menu_resp.data[0]
        menu_id = menu["id"]

        default_categories = [
            {"menu_id": menu_id, "name": "Coffee", "desc": "Default category", "image": None},
            {"menu_id": menu_id, "name": "Tea", "desc": None, "image": None},
        ]
        cats_resp = (
            self.supabase
            .table("categories")
            .insert(default_categories)
            .execute()
        )
        categories = cats_resp.data

        cat_id_by_name = {c["name"]: c["id"] for c in categories}

        default_items = [
            {
                "category_id": cat_id_by_name["Coffee"],
                "name": "Espresso",
                "desc": None,
                "price": "2.50",
                "weight_g": 30,
            },
            {
                "category_id": cat_id_by_name["Coffee"],
                "name": "Americano",
                "desc": None,
                "price": "3.00",
                "weight_g": 250,
            },
            {
                "category_id": cat_id_by_name["Tea"],
                "name": "Black tea",
                "desc": None,
                "price": "2.80",
                "weight_g": 250,
            },
        ]
        items_resp = (
            self.supabase
            .table("items")
            .insert(default_items)
            .execute()
        )
        items = items_resp.data

        return {
            "venue": venue,
            "menu": menu,
            "categories": categories,
            "items": items,
        }

def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\\-]", "", s)
    return s