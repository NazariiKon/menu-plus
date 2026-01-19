
from fastapi import APIRouter, Depends, HTTPException, status
from realtime import Optional

from src.schemas.venue import VenueBase, VenueCreateResponse, VenueRead, VenueUpdate
from src.api.dependencies import get_current_user, get_current_user_optional, get_owned_venue, get_venue_service
from src.services.venue_service import VenueService


router = APIRouter(prefix="/venues", tags=["Venue"])

@router.post("/", response_model=VenueCreateResponse)
async def create_venue(
    data: VenueBase,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service)
):
    if not data:
        raise HTTPException(status.HTTP_204_NO_CONTENT, "No data sent")
    
    newVenue = await vs.create_venue(current_user["sub"], data)

    return newVenue

@router.delete("/{venue_id}")
async def delete_venue_by_id(
    venue_id: str,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    result = await vs.delete_venue_by_id(venue_id=venue_id, owner_id=current_user["sub"])
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nothing was removed")
    return result
    
@router.get("/p/{slug}", response_model=VenueRead)
async def get_venue_by_slug(
    slug: str,
    current_user: Optional[dict] = Depends(get_current_user_optional),
    vs: VenueService = Depends(get_venue_service)
):
    if not slug:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This slug doesn't exist")
    
    result = await vs.get_venue_menu_by_slug(slug=slug)
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This slug doesn't exist")
    result.is_editable = (
        current_user is not None and 
        str(current_user["sub"]) == str(result.owner_id)
    )
    return result

@router.patch("/{venue_id}", response_model=VenueRead)
async def patch_venue(
    venue_id: str,
    data: VenueUpdate,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    venue: VenueRead = Depends(get_owned_venue)
):
    patch = data.model_dump(exclude_unset=True)
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update")

    updated = await vs.update_venue(venue_id=venue_id, owner_id=current_user["sub"], patch=patch)
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Venue not found")

    return await venue

