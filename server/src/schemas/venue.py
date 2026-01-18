from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from src.schemas.menu import CategoryRead, ItemRead, MenuRead

class VenueBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(default="Jopa Caffe", max_length=100)
    desc: Optional[str] = Field(default=None, max_length=100)

    phone: Optional[str] = Field(default="353079644297", max_length=20)
    wifiPassword: Optional[str] = Field(default="strongPassword", max_length=20)

    address: Optional[str] = Field(default="70A Hillcreast Park", max_length=255)
    google_maps_link: Optional[str] = Field(default=None, max_length=255)
    inst_link: Optional[str] = Field(default=None, max_length=255)
    facebook_link: Optional[str] = Field(default=None, max_length=255)
    tiktok_link: Optional[str] = Field(default=None, max_length=255)

    max_tables: Optional[int] = 20
    currency: str = "USD"
    language: str = "English"
    logo: str = "default.png"
    background: str = "defaultBG.png"

class VenueCreateResponse(BaseModel):
    venue: VenueRead
    menus: List[MenuRead]
    categories: List[CategoryRead]
    items: List[ItemRead]

class VenueUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    wifiPassword: Optional[str] = Field(default=None, max_length=20)
    desc: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=255)
    google_maps_link: Optional[str] = Field(default=None, max_length=300)
    inst_link: Optional[str] = Field(default=None, max_length=300)
    facebook_link: Optional[str] = Field(default=None, max_length=300)
    tiktok_link: Optional[str] = Field(default=None, max_length=300)

    max_tables: Optional[int] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    logo: Optional[str] = None
    background: Optional[str] = None


class VenueRead(VenueBase):
    id: UUID
    slug: str = Field(max_length=50)
    owner_id: UUID
    created_at: datetime
    is_editable: Optional[bool] = False
    menus: list["MenuRead"] = Field(default_factory=list)

class ApiResponse(BaseModel):
    success: bool
    data: List[VenueRead] = []
    total: int

VenueRead.model_rebuild()