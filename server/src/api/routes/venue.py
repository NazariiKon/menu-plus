
from fastapi import APIRouter, Depends, HTTPException, status

from src.schemas.venue import VenueBase
from src.api.dependencies import get_current_user, get_venue_service
from src.services.venue_service import VenueService


router = APIRouter(prefix="/venues", tags=["Venue"])

@router.post("/create-venue")
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
    
