from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from app.schemas.common import Provenance


class OrderBookLevel(BaseModel):
    price: float
    quantity: float


class OrderBookDepth(BaseModel):
    symbol: str
    bids: List[OrderBookLevel]
    asks: List[OrderBookLevel]
    bid_depth_usd: float
    ask_depth_usd: float
    bid_ask_imbalance: float = Field(..., description="Value between -1.0 (all ask) and +1.0 (all bid)")
    spread_usd: float
    spread_bps: float
    provenance: Provenance


class Ticker24h(BaseModel):
    symbol: str
    last_price: float
    price_change_percent: float
    high_price: float
    low_price: float
    volume_quote: float
    trades_count: int
    open_time: int
    close_time: int
    provenance: Provenance


class MarketSummary(BaseModel):
    symbol: str
    ticker: Ticker24h
    order_book: OrderBookDepth
    momentum_1h: float
    momentum_24h: float
    volatility_24h: float
    volume_surge_ratio: float
    provenance: Provenance
