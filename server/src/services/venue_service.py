import re
from supabase import Client
from typing import Any, Tuple, List

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
    
    async def get_venue_menu_by_slug(self, slug: str, owner_id: str) -> dict:
        response = (
            self.supabase
            .table("venues")
            .select("""*, menus (*, categories (*, items ( * )))""")
            .eq("slug", slug)
            .eq("owner_id", owner_id)
            .execute()
        )
        return response.data
    
    async def get_venue_by_id_for_owner(self, venue_id: str, owner_id: str) -> dict:
        response = (
            self.supabase
            .table("venues")
            .select("""*, menus (*, categories (*, items ( * )))""")
            .eq("owner_id", owner_id)
            .eq("id", venue_id)
            .execute()
        )
        return response.data
    
    
    async def update_venue(self, venue_id: str, owner_id: str, patch: dict) -> dict:
        response = (
            self.supabase
            .table("venues")
            .update(patch)
            .eq("id", venue_id)
            .eq("owner_id", owner_id)
            .execute()
        )
        return response.data[0] if response.data else {}

    
    async def create_venue(self, owner_id: str, data: VenueBase) -> dict:
        payload = data.model_dump(exclude_none=True)
        payload["owner_id"] = owner_id
        payload["slug"] = slugify(payload["name"])

        # 1) Venue
        venue_resp = (
            self.supabase
            .table("venues")
            .insert(payload)
            .execute()
        )
        venue = venue_resp.data[0]
        venue_id = venue["id"]

        # 2) Two menus: Drinks + Food
        menus_resp = (
            self.supabase
            .table("menus")
            .insert([
                {"venue_id": venue_id, "name": "Drinks", "position": 1},
                {"venue_id": venue_id, "name": "Food", "position": 2},
            ])
            .execute()
        )
        menus = menus_resp.data

        menu_id_by_name = {m["name"]: m["id"] for m in menus}
        drinks_menu_id = menu_id_by_name["Drinks"]
        food_menu_id = menu_id_by_name["Food"]

        # 3) Categories
        default_categories = [
            # Drinks
            {"menu_id": drinks_menu_id, "name": "Coffee", "image": "categories/coffee.png", "position": 1},
            {"menu_id": drinks_menu_id, "name": "Tea", "image": "categories/tea.png", "position": 2},
            {"menu_id": drinks_menu_id, "name": "Soft Drinks", "image": "categories/drinks.png", "position": 3},
            {"menu_id": drinks_menu_id, "name": "Cocktails", "image": "categories/cocktails.png", "position": 4},

            # Food
            {"menu_id": food_menu_id, "name": "Breakfast", "image": "categories/breakfast.png", "position": 1},
            {"menu_id": food_menu_id, "name": "Burgers", "image": "categories/burgers.png", "position": 2},
            {"menu_id": food_menu_id, "name": "Salads", "image": "categories/salads.png", "position": 3},
            {"menu_id": food_menu_id, "name": "Desserts", "image": "categories/desserts.png", "position": 4},
        ]

        cats_resp = (
            self.supabase
            .table("categories")
            .insert(default_categories)
            .execute()
        )
        categories = cats_resp.data

        cat_id_by_menu_and_name = {(c["menu_id"], c["name"]): c["id"] for c in categories}

        def cid(menu_id: str, name: str) -> str:
            return cat_id_by_menu_and_name[(menu_id, name)]

        # 4) Items (more test data)
        default_items = [
            # Coffee
            {"position": 1, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Espresso", "desc": "Single shot", "price": "2.50", "weight_g": 30},
            {"position": 2, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Double Espresso", "desc": "Double shot", "price": "3.20", "weight_g": 60},
            {"position": 3, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Americano", "desc": "Espresso + hot water", "price": "3.00", "weight_g": 250},
            {"position": 4, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Cappuccino", "desc": "Foamy milk", "price": "3.60", "weight_g": 250},
            {"position": 5, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Latte", "desc": "Milky coffee", "price": "3.80", "weight_g": 300},
            {"position": 6, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Flat White", "desc": "Smooth microfoam", "price": "3.70", "weight_g": 200},
            {"position": 7, "category_id": cid(drinks_menu_id, "Coffee"), "name": "Iced Latte", "desc": "With ice", "price": "4.20", "weight_g": 350},

            # Tea
            {"position": 1, "category_id": cid(drinks_menu_id, "Tea"), "name": "Black Tea", "desc": None, "price": "2.80", "weight_g": 250},
            {"position": 2, "category_id": cid(drinks_menu_id, "Tea"), "name": "Green Tea", "desc": None, "price": "3.00", "weight_g": 250},
            {"position": 3, "category_id": cid(drinks_menu_id, "Tea"), "name": "Earl Grey", "desc": "Bergamot", "price": "3.10", "weight_g": 250},
            {"position": 4, "category_id": cid(drinks_menu_id, "Tea"), "name": "Chamomile", "desc": "Caffeine-free", "price": "3.20", "weight_g": 250},

            # Soft Drinks
            {"position": 1, "category_id": cid(drinks_menu_id, "Soft Drinks"), "name": "Coca-Cola", "desc": "330 ml can", "price": "2.50", "weight_g": 330},
            {"position": 2, "category_id": cid(drinks_menu_id, "Soft Drinks"), "name": "Coca-Cola Zero", "desc": "330 ml can", "price": "2.50", "weight_g": 330},
            {"position": 3, "category_id": cid(drinks_menu_id, "Soft Drinks"), "name": "Sparkling Water", "desc": "500 ml", "price": "2.20", "weight_g": 500},
            {"position": 4, "category_id": cid(drinks_menu_id, "Soft Drinks"), "name": "Orange Juice", "desc": "Fresh", "price": "3.50", "weight_g": 300},

            # Cocktails
            {"position": 1, "category_id": cid(drinks_menu_id, "Cocktails"), "name": "Mojito", "desc": "Rum, mint, lime", "price": "9.50", "weight_g": 250},
            {"position": 2, "category_id": cid(drinks_menu_id, "Cocktails"), "name": "Aperol Spritz", "desc": "Aperol, prosecco", "price": "10.00", "weight_g": 250},
            {"position": 3, "category_id": cid(drinks_menu_id, "Cocktails"), "name": "Whiskey Sour", "desc": "Whiskey, lemon", "price": "11.00", "weight_g": 200},

            # Breakfast
            {"position": 1, "category_id": cid(food_menu_id, "Breakfast"), "name": "Avocado Toast", "desc": "Sourdough, chili flakes", "price": "8.90", "weight_g": 250},
            {"position": 2, "category_id": cid(food_menu_id, "Breakfast"), "name": "Pancakes", "desc": "Maple syrup", "price": "7.50", "weight_g": 300},
            {"position": 3, "category_id": cid(food_menu_id, "Breakfast"), "name": "Omelette", "desc": "Cheese & herbs", "price": "7.80", "weight_g": 280},

            # Burgers
            {"position": 1, "category_id": cid(food_menu_id, "Burgers"), "name": "Classic Beef Burger", "desc": "Cheddar, pickles", "price": "12.50", "weight_g": 420},
            {"position": 2, "category_id": cid(food_menu_id, "Burgers"), "name": "Chicken Burger", "desc": "Spicy mayo", "price": "11.80", "weight_g": 400},
            {"position": 3, "category_id": cid(food_menu_id, "Burgers"), "name": "Veggie Burger", "desc": "Plant-based patty", "price": "11.50", "weight_g": 380},

            # Salads
            {"position": 1, "category_id": cid(food_menu_id, "Salads"), "name": "Caesar Salad", "desc": "Chicken, parmesan", "price": "10.50", "weight_g": 320},
            {"position": 2, "category_id": cid(food_menu_id, "Salads"), "name": "Greek Salad", "desc": "Feta, olives", "price": "9.80", "weight_g": 300},

            # Desserts
            {"position": 1, "category_id": cid(food_menu_id, "Desserts"), "name": "Cheesecake", "desc": "New York style", "price": "6.50", "weight_g": 180},
            {"position": 2, "category_id": cid(food_menu_id, "Desserts"), "name": "Chocolate Brownie", "desc": "With ice cream", "price": "6.90", "weight_g": 200},
            {"position": 3, "category_id": cid(food_menu_id, "Desserts"), "name": "Ice Cream", "desc": "Vanilla / chocolate", "price": "4.50", "weight_g": 150},
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
            "menus": menus,
            "categories": categories,
            "items": items,
        }

def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\\-]", "", s)
    return s