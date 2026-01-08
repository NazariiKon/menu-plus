# from typing import Annotated

# from fastapi import Depends
# from sqlalchemy.ext.asyncio import AsyncSession
# from src.services.user_service import UserService
# from src.database import get_session

# SessionDep = Annotated[AsyncSession, Depends(get_session)]

# async def get_user_service(session: AsyncSession = Depends(get_session)):
#     return UserService(session)