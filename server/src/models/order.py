from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import ForeignKey, Integer, String, Numeric, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from src.database import Base


if TYPE_CHECKING:
    from src.models.venue import Venue
    from src.models.orderItem import OrderItem

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    
    venue_id: Mapped[UUID] = mapped_column(
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False
    )
    
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    desc: Mapped[Optional[str]] = mapped_column(String)
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    weight_g: Mapped[Optional[int]] = mapped_column(Integer)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    venue: Mapped["Venue"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
