from pydantic import BaseModel, Field
from typing import Optional

class ProfileBase(BaseModel):
    name: str = Field(..., max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    name: Optional[str] = None
    phone: Optional[str] = None
