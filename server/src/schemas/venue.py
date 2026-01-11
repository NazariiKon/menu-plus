from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class VenueBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class VenueRead(VenueBase):
    id: UUID
    slug: str
    name: str
    logo: str = Field(default="default.png")
    phone: Optional[str] = None
    address: Optional[str] = None
    max_tables: Optional[int] = Field(default=20)
    created_at: Optional[datetime] = None
    currency: str = Field(default="USD")
    language: str = Field(default="English")

    model_config = ConfigDict(from_attributes=True)

class VenueCreate(BaseModel):
    slug: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    max_tables: Optional[int] = Field(default=20)
    currency: str = Field(default="USD")
    language: str = Field(default="English")
    logo: str = Field(default="default.png")

class VenueUpdate(BaseModel):
    slug: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    max_tables: Optional[int] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    logo: Optional[str] = None

class ApiResponse(BaseModel):
    success: bool
    data: List[VenueRead] = []
    total: int
