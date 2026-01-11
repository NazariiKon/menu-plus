from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from supabase import AuthApiError, Client

from src.api.dependencies import get_current_user, get_supabase_client


router = APIRouter(prefix="/auth", tags=["Auth"])

class Register(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(reg: Register, supabase: Client = Depends(get_supabase_client)):
    try:
        signup_res = supabase.auth.sign_up({
            "email": reg.email,
            "password": reg.password,
        })
        
        return {
            "success": True,
            "user": signup_res.user
        }
        
    except AuthApiError as e:
        error_msg = str(e).lower()
        if "already registered" in error_msg or "already exists" in error_msg:
            raise HTTPException(status.HTTP_409_CONFLICT, "Account already exists. Please Sign In")
        if "too many requests" in error_msg or "rate limit" in error_msg:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests. Wait 60 seconds")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


class Login(BaseModel):
    email: EmailStr = "nazar.konechniy2@gmail.com"
    password: str = "nazar.konechniy2@gmail.com"

@router.post("/login")
async def sign_in(login: Login, supabase: Client = Depends(get_supabase_client)):
    try:
        signin_res = supabase.auth.sign_in_with_password({
            "email": login.email,
            "password": login.password,
        })
    
        return {
            "success": True,
            "user": signin_res.user,
            "access_token": signin_res.session.access_token,
            "refresh_token": signin_res.session.refresh_token
        }
    
    except AuthApiError as e:
        error_msg = str(e).lower()
        if any(x in error_msg for x in ["invalid login credentials", "invalid email or password"]):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
        if "too many requests" in error_msg or "rate limit" in error_msg:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests. Wait 60 seconds")
        if "email not confirmed" in error_msg:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Please verify your email first")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))
    

@router.post("/verify-signup")
async def verify_signup(email: str, token: str, supabase: Client = Depends(get_supabase_client)):
    res = supabase.auth.verify_otp({
        "email": email, 
        "token": token, 
        "type": "signup"
    })
    if res.user:
        return {"message": "Confirmed", "user": res.user.id, "session": res.session.access_token}
    raise HTTPException(status.HTTP_400_BAD_REQUEST, "Verification failed - token expired or invalid")
