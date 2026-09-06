from typing import Optional
from sqlalchemy import String, Text, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base, TimestampMixin


class MemoryItem(Base, TimestampMixin):
    __tablename__ = "memory_items"

    user_id: Mapped[str] = mapped_column(String(64), index=True, default="default_user")
    layer: Mapped[str] = mapped_column(String(32), index=True)  # 'short_term', 'session', 'long_term_semantic'
    key: Mapped[str] = mapped_column(String(128), index=True)
    content: Mapped[str] = mapped_column(Text)
    embedding_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    relevance_score: Mapped[float] = mapped_column(Float, default=1.0)
