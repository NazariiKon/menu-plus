from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class CreateOrderItem(BaseModel):
    product_id: UUID
    qty: int
    price_per_item: Decimal
    size: Optional[str] = None
    note: Optional[str] = None

class CreateOrder(BaseModel):
    name: str
    desc: Optional[str] = None
    price: Optional[Decimal] = None
    weight_g: Optional[int] = None

class ReadOrderItem(BaseModel):
    id: UUID
    product_id: UUID
    qty: int
    price_per_item: Decimal
    size: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: UUID
    name: str
    desc: Optional[str] = None
    price: Optional[Decimal] = None
    weight_g: Optional[int] = None
    venue_id: UUID
    items: List[ReadOrderItem] = [] 
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
