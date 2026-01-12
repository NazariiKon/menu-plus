
from fastapi import APIRouter, Depends, HTTPException, status

from src.schemas.venue import VenueBase
from src.api.dependencies import get_current_user, get_venue_service
from src.services.venue_service import VenueService


router = APIRouter(prefix="/venues", tags=["Venue"])

@router.post("/")
async def create_venue(
    data: VenueBase,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service)
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")
    if not data:
        raise HTTPException(status.HTTP_204_NO_CONTENT, "No data sent")
    
    newVenue = await vs.create_venue(current_user["sub"], data)

    return newVenue

@router.delete("/{venue_id}")
async def delete_venue_by_id(
    venue_id: str,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service)
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")
    if not venue_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No data sent")
    
    result = await vs.delete_venue_by_id(venue_id=venue_id, owner_id=current_user["sub"])
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nothing was removed")
    return result
    
