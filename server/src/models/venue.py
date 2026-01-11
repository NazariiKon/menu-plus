from sqlalchemy import ForeignKey, String, Integer, Text, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import Profile
from src.database import Base


class Venue(Base):
    __tablename__ = "venues"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    address: Mapped[Optional[str]] = mapped_column(Text)
    max_tables: Mapped[Optional[int]] = mapped_column(Integer, default=20)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id"))
    currency: Mapped[str] = mapped_column(String(30), default="USD")
    language: Mapped[str] = mapped_column(String(20), default="English")
    logo: Mapped[str] = mapped_column(String(20), default="default.png")
    
    owner: Mapped["Profile"] = relationship("Owner", back_populates="venues")