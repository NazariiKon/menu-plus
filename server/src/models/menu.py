from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, Integer, ForeignKey, Numeric, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from src.models import Venue
from src.database import Base


class Menu(Base):
    __tablename__ = "menus"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )    
    name: Mapped[str] = mapped_column(String(20), nullable=False)

    categories: Mapped[list["Category"]] = relationship(
        "Category",
        back_populates="menu"
    )

    venue_id: Mapped[UUID] = mapped_column(
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False
    )
    venue: Mapped["Venue"] = relationship("Venue", back_populates="menus")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )
    menu_id: Mapped[UUID] = mapped_column (
        ForeignKey("menus.id", ondelete="CASCADE"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(String(20), nullable=False)
    desc: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    menu: Mapped["Menu"] = relationship("Menu", back_populates="categories")
    items: Mapped[list["Item"]] = relationship(
        "Item",
        back_populates="category"
    )

class Item(Base):
    __tablename__ = "items"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )
    category_id: Mapped[UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    desc: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    weight_g: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    category: Mapped["Category"] = relationship("Category", back_populates="items")
