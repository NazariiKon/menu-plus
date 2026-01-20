from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from src.api.dependencies import get_current_user, get_menu_service, get_owned_venue
from src.schemas.venue import VenueRead
from src.schemas.menu import MenuCreate, MenuUpdate
from src.services.menu_service import MenuService

router = APIRouter(prefix="/venues/{venue_id}/menus", tags=["Menu"])

@router.post("/", response_model=List[dict], status_code=status.HTTP_201_CREATED)
async def create_menu(
    venue_id: str,
    data: MenuCreate,
    current_user: dict = Depends(get_current_user),
    ms: MenuService = Depends(get_menu_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    await ms.create_menu(venue_id, data)
    return await ms.get_menus(venue_id)

@router.delete("/{menu_id}", response_model=List[dict], status_code=status.HTTP_202_ACCEPTED)
async def delete_menu(
    venue_id: str,
    menu_id: str,
    current_user: dict = Depends(get_current_user),
    ms: MenuService = Depends(get_menu_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    result = await ms.delete_menu(venue_id, menu_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "Menu not found"))
    return await ms.get_menus(venue_id)

@router.patch("/{menu_id}", response_model=List[dict])
async def update_menu(
    venue_id: str,
    menu_id: str,
    data: MenuUpdate,
    current_user: dict = Depends(get_current_user),
    ms: MenuService = Depends(get_menu_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    await ms.update_menu(data, venue_id, menu_id)
    return await ms.get_menus(venue_id)
