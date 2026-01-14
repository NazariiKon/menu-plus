from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List

from src.api.dependencies import get_current_user, get_menu_service, get_venue_service
from src.schemas.menu import MenuCreate, MenuRead
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
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")

    venue = await vs.get_venue_by_id_for_owner(venue_id=venue_id, owner_id=current_user["sub"])
    if not venue:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This venue is not yours")

    await ms.create_menu(venue_id, data)
    return await ms.get_menus(venue_id)

@router.delete("/{menu_id}", response_model=List[MenuRead], status_code=status.HTTP_201_CREATED)
async def delete_menu (
    venue_id: str,
    menu_id: str,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    ms: MenuService = Depends(get_menu_service),
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")

    venue = await vs.get_venue_by_id_for_owner(venue_id=venue_id, owner_id=current_user["sub"])
    if not venue:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This venue is not yours")

    await ms.delete_menu(venue_id, menu_id)
    return await ms.get_menus(venue_id)

