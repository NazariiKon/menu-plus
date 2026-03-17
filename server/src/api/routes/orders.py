from typing import Dict, List
from fastapi import APIRouter, Depends, status

from src.services.order_service import OrderService
from src.api.dependencies import get_current_user, get_order_service, get_owned_venue, get_public_venue, get_venue_service
from src.schemas.order import CreateOrder, CreateOrderItem, OrderRead
from src.schemas.venue import  VenueRead


router = APIRouter(prefix="/orders/{venue_id}", tags=["Orders"])

@router.post("/", response_model=List[OrderRead], status_code=status.HTTP_201_CREATED)
async def create_order(
    venue_id: str,
    data: dict,
    order_service: OrderService = Depends(get_order_service),
    venue: VenueRead = Depends(get_public_venue)
):
    create_order = CreateOrder(**data)
    create_items = [CreateOrderItem(**item) for item in data.get("items", [])]

    await order_service.create_order(venue_id, create_order, create_items)
    return await order_service.get_orders_by_venue(venue_id)

@router.get("/")
async def read_orders_by_venue(
    venue_id: str,
    current_user: dict = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    return await order_service.get_orders_by_venue(venue_id)