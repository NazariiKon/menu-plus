from typing import TYPE_CHECKING, Optional
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from src.models import Venue
from src.database import Base

class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    venues: Mapped["Venue"] = relationship("Venues", back_populates="owner")