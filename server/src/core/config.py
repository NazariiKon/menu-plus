from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

import os

load_dotenv()
BASE_DIR = Path(__file__).parent.parent.parent

class DbSettings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY")
    url: str = os.getenv("DATABASE_URL")
    echo: bool = True

class AuthJWT(BaseSettings):
    jwt_secret: str = os.getenv("SUPABASE_JWT_SECRET")
    algorithm: str = "HS256"
    audience: str = "authenticated"

class Settings(BaseSettings):
    db: DbSettings = DbSettings()
    auth_jwt: AuthJWT = AuthJWT()

settings = Settings()