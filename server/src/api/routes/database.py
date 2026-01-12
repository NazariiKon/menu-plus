from fastapi import APIRouter, Depends, HTTPException, status

from src.database import engine, Base


router = APIRouter(prefix="/database", tags=["Database"])


@router.post("/migrate")
async def migrate():
    import src.models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return {"status": status.HTTP_200_OK, "tables": list(Base.metadata.tables.keys())}
