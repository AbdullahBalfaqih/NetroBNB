from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class StrategyProposal(BaseModel):
    strategy_name: str
    asset: str
    action_side: str  # 'BUY', 'SELL', 'REBALANCE', 'HOLD'
    target_entry_price: float
    take_profit_price: float
    stop_loss_price: float
    risk_reward_ratio: float
    time_horizon: str
    rationale: str
    underlying_intelligence_summary: str
    risks: List[str]


class OrderPreviewRequest(BaseModel):
    asset: str
    side: str  # 'BUY', 'SELL'
    order_type: str = "MARKET"
    amount: float
    rationale: str = "Agent recommended trade"


class OrderPreviewResponse(BaseModel):
    preview_token: str
    asset: str
    side: str
    amount: float
    estimated_price_usd: float
    estimated_total_usd: float
    estimated_slippage_bps: float
    fee_estimate_usd: float
    execution_route: str = "Binance Spot Execution"
    safety_disclaimer: str = (
        "CONFIRMATION REQUIRED: This is a financial proposal. Trading involves market risk. "
        "Explicit user confirmation token is required to simulate/execute."
    )
    expires_in_seconds: int = 120


class OrderExecuteRequest(BaseModel):
    preview_token: str
    user_confirmed: bool = Field(..., description="Must explicitly be True to execute")


class OrderExecuteResponse(BaseModel):
    order_id: str
    status: str  # 'FILLED', 'REJECTED'
    asset: str
    side: str
    executed_amount: float
    executed_price_usd: float
    total_usd: float
    execution_timestamp: str
    tx_hash: str
    notes: str
