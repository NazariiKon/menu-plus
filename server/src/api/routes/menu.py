from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List

from src.schemas.venue import VenueRead
from src.api.dependencies import get_current_user, get_menu_service, get_owned_venue, get_venue_service
from src.schemas.menu import MenuCreate, MenuRead, MenuUpdate
from src.services.menu_service import MenuService
from src.services.venue_service import VenueService

router = APIRouter(prefix="/venues/{venue_id}/menus", tags=["Menu"])


@router.post("/", response_model=List[MenuRead], status_code=status.HTTP_201_CREATED)
async def create_menu (
    venue_id: str,
    data: MenuCreate,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    ms: MenuService = Depends(get_menu_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    await ms.create_menu(venue_id, data)
    return await ms.get_menus(venue_id)

@router.delete("/{menu_id}", response_model=List[MenuRead], status_code=status.HTTP_202_ACCEPTED)
async def delete_menu (
    venue_id: str,
    menu_id: str,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    ms: MenuService = Depends(get_menu_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    await ms.delete_menu(venue_id, menu_id)
    return await ms.get_menus(venue_id)

@router.patch("/{menu_id}", response_model=List[MenuRead], status_code=status.HTTP_206_PARTIAL_CONTENT)
async def update_menu (
    venue_id: str,
    menu_id: str,
    data: MenuUpdate,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    ms: MenuService = Depends(get_menu_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    await ms.update_menu(data, venue_id, menu_id)
    return await ms.get_menus(venue_id)

