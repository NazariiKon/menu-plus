from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from src.api.dependencies import get_supabase_client
from src.database import get_db
from src.models import Venue
from src.schemas import VenueRead, ProfileBase

router = APIRouter(prefix="/venues", tags=["Venue"])

