from fastapi import APIRouter

from src.api.routes import user, database, profile

api_router = APIRouter()
api_router.include_router(user.router)
api_router.include_router(database.router)
api_router.include_router(profile.router)