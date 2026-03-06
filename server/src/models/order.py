from decimal import Decimal
from typing import TYPE_CHECKING, Optional, List
from unittest.mock import Base
from uuid import UUID
from sqlalchemy import (
    UUID as SQL_UUID,
    String,
    Numeric,
    Integer,
    ForeignKey,
    func,
    DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from src.models.orderItem import OrderItem
from src.models.venue import Venue


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(
        SQL_UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    venue_id: Mapped[UUID] = mapped_column(
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    desc: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    weight_g: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )

    venue: Mapped["Venue"] = relationship("Venue", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
