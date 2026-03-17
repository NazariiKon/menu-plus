from fastapi import APIRouter, Depends, HTTPException, status

from src.api.dependencies import get_supabase_client
from src.database import engine, Base


router = APIRouter(prefix="/database", tags=["Database"])


@router.post("/migrate")
async def migrate(client = Depends(get_supabase_client)):
    import src.models
    # client.rpc("drop_all_tables").execute()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return {"status": status.HTTP_200_OK, "tables": list(Base.metadata.tables.keys())}
