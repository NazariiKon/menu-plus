from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from src.services.venue_service import VenueService
from src.api.dependencies import get_current_user, get_venue_service
from src.schemas.venue import ApiResponse


router = APIRouter(prefix="/profile", tags=["Profiles"])


@router.get("/my-venues", response_model=ApiResponse)
async def get_my_venues(
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service)
):
    venues, total = await vs.get_my_venues(current_user["sub"])

    if not venues:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No venues found")
    return {"success": True, "data": venues, "total": total} 
    
