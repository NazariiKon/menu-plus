from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import engine, Base, get_db


router = APIRouter(prefix="/database", tags=["Database"])


@router.post("/migrate")
async def migrate(db: AsyncSession = Depends(get_db)):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return {"status": "Tables created if not exists"}