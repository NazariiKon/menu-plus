from decimal import Decimal
from typing import Optional
from unittest.mock import Base
from uuid import UUID
from sqlalchemy import UUID as SQL_UUID, ForeignKey, String, Numeric, Integer, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from server.src.models.order import Order

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[UUID] = mapped_column(
        SQL_UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    order_id: Mapped[UUID] = mapped_column(
        SQL_UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False
    )

    product_id: Mapped[UUID] = mapped_column(SQL_UUID(as_uuid=True), nullable=False)

    qty: Mapped[int] = mapped_column(Integer, nullable=False)

    price_per_item: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    size: Mapped[Optional[str]] = mapped_column(String(20))

    order: Mapped["Order"] = relationship("Order", back_populates="items")
