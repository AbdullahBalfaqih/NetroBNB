from typing import Optional
from sqlalchemy import String, Text, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base, TimestampMixin


class TradeOrder(Base, TimestampMixin):
    __tablename__ = "trade_orders"

    user_id: Mapped[str] = mapped_column(String(64), index=True, default="default_user")
    preview_token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    asset: Mapped[str] = mapped_column(String(32))
    side: Mapped[str] = mapped_column(String(16))  # 'BUY', 'SELL'
    order_type: Mapped[str] = mapped_column(String(16), default="MARKET")
    amount: Mapped[float] = mapped_column(Float)
    estimated_price: Mapped[float] = mapped_column(Float)
    estimated_usd_value: Mapped[float] = mapped_column(Float)
    estimated_slippage_bps: Mapped[float] = mapped_column(Float, default=10.0)
    status: Mapped[str] = mapped_column(
        String(32), default="PREVIEW_PENDING"
    )  # 'PREVIEW_PENDING', 'USER_CONFIRMED', 'EXECUTED', 'CANCELLED', 'REJECTED'
    strategy_rationale: Mapped[str] = mapped_column(Text)
    execution_result: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
