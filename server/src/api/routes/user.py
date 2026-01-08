from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

import os

router = APIRouter(prefix="/auth", tags=["Auth"])

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class Register(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(reg: Register):
    res = supabase.auth.sign_up({
        "email": reg.email,
        "password": reg.password,
    })
    if res.user:
        return {"user_id": str(res.user.id)}
    raise HTTPException(400, "Failed")

@router.post("/verify-signup")
async def verify_signup(email: str, token: str):
    res = supabase.auth.verify_otp({
        "email": email, 
        "token": token, 
        "type": "signup"
    })
    if res.user:
        return {"message": "Confirmed", "user": res.user.id, "session": res.session.access_token}
    raise HTTPException(400, "Verification failed - token expired or invalid")
