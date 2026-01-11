from fastapi import Depends, HTTPException, Request, Security, status
from fastapi.security import APIKeyHeader, HTTPBearer
from supabase import Client, create_client
from jose import JWTError, jwt
import requests
from functools import lru_cache

from src.services.venue_service import VenueService
from src.core.config import settings

security = HTTPBearer()
security_scheme = APIKeyHeader(
    name="Authorization",
    auto_error=False
)


def get_supabase_client(request: Request) -> Client:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    client = create_client(
        supabase_url=settings.db.supabase_url,
        supabase_key=settings.db.supabase_anon_key
    )
    
    if token:
        client.auth.set_session(access_token=token, refresh_token="") 
    
    return client

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
    
# Services: 
async def get_venue_service(supabase: Client = Depends(get_supabase_client)):
    return VenueService(supabase)
