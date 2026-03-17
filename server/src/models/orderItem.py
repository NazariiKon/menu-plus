from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import ForeignKey, String, Numeric, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from src.database import Base

if TYPE_CHECKING:
    from src.models.order import Order
    from src.models.menu import Item

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    order_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False
    )

    product_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("items.id"),
        nullable=False
    )

    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_item: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), 
        nullable=False
    )
    size: Mapped[Optional[str]] = mapped_column(String)
    note: Mapped[Optional[str]] = mapped_column(String)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )

    order: Mapped["Order"] = relationship(
        "Order", 
        back_populates="items"
    )
    item: Mapped["Item"] = relationship(
        "Item", 
        back_populates="order_items"
    )
