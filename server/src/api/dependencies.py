from fastapi import Depends, HTTPException, Request, Security, status
from fastapi.datastructures import FormData
from fastapi.security import APIKeyHeader, HTTPBearer
from realtime import Optional
from supabase import Client, create_client
from jose import JWTError, jwt
import requests
from functools import lru_cache

from src.services.order_service import OrderService
from src.services.item_service import ItemService
from src.schemas.venue import VenueRead
from src.services.category_service import CategoryService
from src.services.menu_service import MenuService
from src.services.profile_service import ProfileService
from src.services.venue_service import VenueService
from src.core.config import settings

security = HTTPBearer()
security_scheme = APIKeyHeader(
    name="Authorization",
    auto_error=False
)

from fastapi import Header, Depends
from typing import Optional, Annotated

async def get_current_user_optional(authorization: Optional[str] = Security(security_scheme)) -> Optional[dict]:
    if not authorization:
        return None
    
    if "Bearer" not in authorization:
        return None
    
    _, token = authorization.split(" ", 1)
    try:
        jwk = get_jwks()['keys'][0]
        payload = jwt.decode(token, jwk, algorithms=["ES256"], audience="authenticated")
        return payload
    except JWTError:
        return None

def get_supabase_client(request: Request) -> Client:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    client = create_client(
        supabase_url=settings.db.supabase_url,
        supabase_key=settings.db.supabase_anon_key
    )
    
    if token:
        client.auth.set_session(access_token=token, refresh_token="") 
    
    return client


# dependencies.py
from fastapi import Request, Depends, HTTPException
from starlette.datastructures import FormData
from typing import Annotated, Dict, Any

MAX_PART_SIZE = 10 * 1024 * 1024  # 10 MB
# dependencies.py
from fastapi import Request, Depends, HTTPException
from starlette.datastructures import FormData
from typing import Dict, Any

MAX_PART_SIZE = 10 * 1024 * 1024  # 10 MB
async def get_form_data(request: Request) -> Dict[str, Any]:
    try:
        form_data: FormData = await request.form(max_part_size=MAX_PART_SIZE)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Error parsing form data (max 10 MB): {str(e)}",
        )

    raw_data = dict(form_data)

    for key, value in raw_data.items():
        if value == "":
            raw_data[key] = None

    return raw_data

@lru_cache()
def get_jwks():
    return requests.get(f"{settings.db.supabase_url}/auth/v1/.well-known/jwks.json").json()

async def get_current_user(authorization: str = Security(security_scheme)):
    if not authorization: raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")
    if "Bearer" not in authorization:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token 1")
    _, token = authorization.split(" ", 1)
    try:
        jwk = get_jwks()['keys'][0]
        payload = jwt.decode(token, jwk, algorithms=["ES256"], audience="authenticated")
        return payload
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token 2")

async def get_venue_service(supabase: Client = Depends(get_supabase_client)):
    return VenueService(supabase)
    
async def get_owned_venue(
    venue_id: str,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service)
) -> VenueRead:
    venue = await vs.get_venue_by_id_for_owner(venue_id=venue_id, owner_id=current_user["sub"])
    if not venue:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This venue is not yours")
    return venue 
    
async def get_profile_service(supabase: Client = Depends(get_supabase_client)):
    return ProfileService(supabase)

async def get_menu_service(supabase: Client = Depends(get_supabase_client)):
    return MenuService(supabase)

async def get_category_service(supabase: Client = Depends(get_supabase_client)):
    return CategoryService(supabase)

async def get_item_service(supabase: Client = Depends(get_supabase_client)):
    return ItemService(supabase)

async def get_order_service(supabase: Client = Depends(get_supabase_client)):
    return OrderService(supabase)
