from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.providers import portfolio_provider

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("")
async def get_portfolio(user_id: str = Query("default_user")):
    """Retrieve user holdings, open positions, unrealized P/L, and allocation breakdown."""
    try:
        balances = await portfolio_provider.get_balances(user_id)
        positions = await portfolio_provider.get_positions(user_id)
        trades = await portfolio_provider.get_trades(user_id, limit=10)

        total_value = sum(b["value_usd"] for b in balances)
        unrealized_pnl_usd = sum(p["unrealized_pnl_usd"] for p in positions)

        return {
            "user_id": user_id,
            "total_portfolio_usd": round(total_value, 2),
            "unrealized_pnl_usd": round(unrealized_pnl_usd, 2),
            "balances": balances,
            "positions": positions,
            "recent_trades": trades
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio retrieval failed: {str(e)}")
