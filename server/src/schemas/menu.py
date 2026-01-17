from dataclasses import dataclass
from fastapi import File, Form, UploadFile
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from typing import Optional, Union
from uuid import UUID

class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class ItemRead(ORMBase):
    id: UUID
    category_id: UUID
    name: str = Field(max_length=50)
    desc: Optional[str] = Field(default=None, max_length=255)
    image: Optional[str] = Field(default=None, max_length=255)
    price: Optional[Decimal] = None
    weight_g: Optional[int] = None
    position: int

class CategoryRead(ORMBase):
    id: UUID
    menu_id: UUID
    name: str = Field(max_length=20)
    image: Optional[str] = Field(default=None, max_length=255)
    position: int
    items: list[ItemRead] = Field(default_factory=list)


class MenuRead(ORMBase):
    id: UUID
    venue_id: UUID
    name: str = Field(max_length=20)
    position: int

    categories: list[CategoryRead] = Field(default_factory=list)

class ItemCreate(ORMBase):
    name: str = Field(max_length=50)
    desc: Optional[str] = Field(default=None, max_length=100)
    image: Optional[str] = Field(default=None, max_length=255)
    price: Optional[Decimal] = None
    weight_g: Optional[int] = None
    position: int


class CategoryCreate(BaseModel):
    name: str
    image_bytes: bytes | None = None
    position: int = 1

class CategoryUpdate(ORMBase):
    name: Optional[str] = Field(max_length=20)
    position: Optional[int]
    image_bytes: Optional[Union[bytes, UploadFile]] = None

class MenuCreate(ORMBase):
    name: str = Field(max_length=20)
    position: int
    
class MenuUpdate(ORMBase):
    name: Optional[str] = Field(max_length=20)
    position: Optional[int]

MenuRead.model_rebuild()
