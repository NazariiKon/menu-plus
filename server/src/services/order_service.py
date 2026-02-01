from typing import Dict, List
import uuid
from fastapi.encoders import jsonable_encoder
from supabase import Client

from src.schemas.order import CreateOrder, CreateOrderItem, OrderRead


class OrderService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def create_order(
        self,
        venue_id: str,
        data: CreateOrder,
        order_items: List[CreateOrderItem]
    ) -> dict:
        order_payload = jsonable_encoder(data.model_dump(exclude_none=True))

        total_price = sum(
            float(item.qty * item.price_per_item) for item in order_items
        )

        order_payload["id"] = str(uuid.uuid4())
        order_payload["venue_id"] = venue_id
        order_payload["price"] = str(total_price)

        order = (
            self.supabase
            .table("orders")
            .insert(order_payload)
            .execute()
            .data[0]
        )
        order_id = order["id"]

        items_payload = [
            jsonable_encoder({
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "product_id": str(item.product_id),
                "qty": item.qty,
                "price_per_item": str(item.price_per_item),
                "size": item.size,
                "note": item.note,
            })
            for item in order_items
        ]

        if items_payload:
            self.supabase.table("order_items").insert(items_payload).execute()

        return order


    async def get_orders_by_venue(self, venue_id: str):
        response = (
            self.supabase
            .table("orders")
            .select("*, order_items(product_id, *, items!product_id(name, desc, price))")
            .eq("venue_id", venue_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data