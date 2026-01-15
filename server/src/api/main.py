from fastapi import APIRouter

from src.api.routes import user, database, profile, venue, menu, categories

api_router = APIRouter()
api_router.include_router(user.router)
api_router.include_router(database.router)
api_router.include_router(profile.router)
api_router.include_router(venue.router)
api_router.include_router(menu.router)
api_router.include_router(categories.router)
