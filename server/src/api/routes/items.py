from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.datastructures import FormData
from realtime import Any, Dict

from src.services.item_service import ItemService
from src.schemas.venue import VenueRead
from src.api.dependencies import get_current_user, get_form_data, get_item_service, get_owned_venue
from src.schemas.menu import ItemCreate, ItemRead, ItemUpdate


router = APIRouter(prefix="/venues/{venue_id}/menus/{menu_id}/categories/{category_id}/items", tags=["Items"])

   
from fastapi import Request, Depends, status, HTTPException
from starlette.datastructures import FormData

MAX_PART_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/", response_model=list[ItemRead], status_code=status.HTTP_201_CREATED)
async def create_item(
    venue_id: str,
    menu_id: str,
    category_id: str,
    request: Request,
    raw_data: dict = Depends(get_form_data),
    current_user: dict = Depends(get_current_user),
    venue: VenueRead = Depends(get_owned_venue),
    itemS: ItemService = Depends(get_item_service),
):
    try:
        item_data = ItemCreate(**raw_data)
    except Exception as e:
        raise HTTPException(status.HTTP_424_FAILED_DEPENDENCY, detail=f"Invalid item data: {str(e)}")

    await itemS.create_item(item_data, category_id)
    return await itemS.get_items_by_category(category_id)


@router.delete("/{item_id}", response_model=list[ItemRead], status_code=status.HTTP_202_ACCEPTED)
async def delete_item(
    venue_id: str, 
    menu_id: str, 
    category_id: str,
    item_id: str,
    current_user: dict = Depends(get_current_user),
    venue: VenueRead = Depends(get_owned_venue),
    itemS: ItemService = Depends(get_item_service),
):
    await itemS.delete_item(category_id, item_id)
    return await itemS.get_items_by_category(category_id)

@router.patch("/{item_id}", response_model=list[ItemRead], status_code=status.HTTP_206_PARTIAL_CONTENT)
async def update_item(
    venue_id: str,
    menu_id: str,
    category_id: str,
    item_id: str,
    raw_data: Dict[str, Any] = Depends(get_form_data),
    current_user: dict = Depends(get_current_user),
    venue: VenueRead = Depends(get_owned_venue),
    itemS: ItemService = Depends(get_item_service),
):
    try:
        item_data = ItemUpdate(**raw_data)
    except Exception as e:
        raise HTTPException(status.HTTP_424_FAILED_DEPENDENCY, detail=f"Invalid item data: {str(e)}")

    await itemS.update_item(item_data, category_id, item_id)
    return await itemS.get_items_by_category(category_id)