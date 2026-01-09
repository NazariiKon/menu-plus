from fastapi import APIRouter, HTTPException, Depends, Security, status
from fastapi.security import APIKeyHeader, HTTPBearer
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from dotenv import load_dotenv
from jose import JWTError, jwt
import requests
from functools import lru_cache
import os

from src.models.profile import Profile


router = APIRouter(prefix="/auth", tags=["Auth"])

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
supabase: Client = create_client(SUPABASE_URL, os.getenv("SUPABASE_ANON_KEY"))
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"
AUDIENCE = "authenticated"

security = HTTPBearer()

security_scheme = APIKeyHeader(
    name="Authorization",
    auto_error=False
)

@lru_cache()
def get_jwks():
    return requests.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json").json()

async def get_current_user(authorization: str = Security(security_scheme)):
    if not authorization: raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")
    scheme, token = authorization.split(" ", 1)
    if scheme.lower() != "bearer":
        raise HTTPException(401)
    try:
        jwk = get_jwks()['keys'][0]
        payload = jwt.decode(token, jwk, algorithms=["ES256"], audience="authenticated")
        return payload
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    data = supabase.table("profiles").select("*").eq("id", user["sub"]).maybe_single().execute()
    
    profile = Profile(**data.data) if data else None
    
    return {
        "email": user["email"],
        "profile": profile
    }


class Register(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(reg: Register):
    signup_res = supabase.auth.sign_up({
        "email": reg.email,
        "password": reg.password,
    })
    
    if not signup_res.user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Registration failed")
    
    if not signup_res.user.identities:
        raise HTTPException(status.HTTP_409_CONFLICT, "Account already exists. Please Sign In")
    
    login_res = supabase.auth.sign_in_with_password({
        "email": reg.email,
        "password": reg.password,
    })
    
    if login_res.session:
        return {
            "success": True,
            "user_id": str(signup_res.user.id),
            "access_token": login_res.session.access_token,
            "refresh_token": login_res.session.refresh_token
        }
    
    raise HTTPException(status.HTTP_400_BAD_REQUEST, "Login after signup failed")

class Login(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def sign_in(login: Login):
    signin_res = supabase.auth.sign_in_with_password({
        "email": login.email,
        "password": login.password,
    })
    
    if not signin_res.user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    
    if not signin_res.session:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Sign in failed")
    
    user = {
        "id": str(signin_res.user.id),
        "email": signin_res.user.email,
        "email_verified": getattr(signin_res.user, 'email_confirmed_at') is not None,
        "created_at": signin_res.user.created_at.isoformat() if signin_res.user.created_at else None,
    }
    
    return {
        "success": True,
        "user": user,
        "access_token": signin_res.session.access_token,
        "refresh_token": signin_res.session.refresh_token
    }



@router.post("/verify-signup")
async def verify_signup(email: str, token: str):
    res = supabase.auth.verify_otp({
        "email": email, 
        "token": token, 
        "type": "signup"
    })
    if res.user:
        return {"message": "Confirmed", "user": res.user.id, "session": res.session.access_token}
    raise HTTPException(status.HTTP_400_BAD_REQUEST, "Verification failed - token expired or invalid")
