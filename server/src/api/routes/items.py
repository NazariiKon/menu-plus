from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from src.services.item_service import ItemService
from src.schemas.venue import VenueRead
from src.api.dependencies import get_current_user, get_item_service, get_owned_venue
from src.schemas.menu import ItemCreate, ItemRead


router = APIRouter(prefix="/venues/{venue_id}/menus/{menu_id}/categories/{category_id}/items", tags=["Items"])

# 
@router.post("/", response_model=list[ItemRead], status_code=status.HTTP_201_CREATED)
async def create_item(
    venue_id: str, 
    menu_id: str, 
    category_id: str,
    data: ItemCreate = Form(),
    current_user: dict = Depends(get_current_user),
    venue: VenueRead = Depends(get_owned_venue),
    itemS: ItemService = Depends(get_item_service),
):
    await itemS.create_item(data, category_id)
    return await itemS.get_items_by_category(category_id)