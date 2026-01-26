from sqlalchemy import ForeignKey, String, Integer, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import Profile, Menu
from src.database import Base


class Venue(Base):
    __tablename__ = "venues"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    desc: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    wifiPassword: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    google_maps_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    inst_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    facebook_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tiktok_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    show_cart: Mapped[Optional[bool]] = mapped_column(bool, nullable=False, default=True)
    make_order: Mapped[Optional[bool]] = mapped_column(bool, nullable=False, default=True)
    max_tables: Mapped[Optional[int]] = mapped_column(Integer, default=20)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    currency: Mapped[str] = mapped_column(String(30), default="USD")
    language: Mapped[str] = mapped_column(String(20), default="English")
    logo: Mapped[str] = mapped_column(String(255), default="default.png")
    background: Mapped[str] = mapped_column(String(255), default="defaultBG.png")

    
    menus: Mapped[list["Menu"]] = relationship("Menu", back_populates="venue")

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id"))
    owner: Mapped["Profile"] = relationship("Owner", back_populates="venues")