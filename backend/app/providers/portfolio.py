from typing import Dict, Any, List
from app.providers.base import PortfolioProvider
from app.providers.binance import BinanceMarketDataProvider


class UserPortfolioProvider(PortfolioProvider):
    """User portfolio provider tracking holdings, execution entries, and exposure risks."""

    def __init__(self, market_provider: BinanceMarketDataProvider):
        self.market_provider = market_provider
        # Demo portfolio initialized for hackathon
        self._mock_positions = {
            "default_user": [
                {
                    "asset": "SOL",
                    "amount": 85.0,
                    "avg_entry_price": 142.20,
                    "target_allocation_pct": 35.0
                },
                {
                    "asset": "ETH",
                    "amount": 2.5,
                    "avg_entry_price": 2850.0,
                    "target_allocation_pct": 30.0
                },
                {
                    "asset": "BNB",
                    "amount": 12.0,
                    "avg_entry_price": 580.0,
                    "target_allocation_pct": 20.0
                },
                {
                    "asset": "USDT",
                    "amount": 8500.0,
                    "avg_entry_price": 1.0,
                    "target_allocation_pct": 15.0
                }
            ]
        }

    async def get_balances(self, user_id: str) -> List[Dict[str, Any]]:
        positions = self._mock_positions.get(user_id, self._mock_positions["default_user"])
        results = []
        total_portfolio_usd = 0.0

        for pos in positions:
            asset = pos["asset"]
            amount = pos["amount"]
            if asset == "USDT":
                price = 1.0
            else:
                price = await self.market_provider.get_price(asset)

            usd_val = amount * price
            total_portfolio_usd += usd_val
            results.append({
                "asset": asset,
                "amount": amount,
                "price_usd": price,
                "value_usd": round(usd_val, 2),
                "avg_entry_price": pos["avg_entry_price"],
                "target_allocation_pct": pos["target_allocation_pct"]
            })

        for r in results:
            r["current_allocation_pct"] = round((r["value_usd"] / total_portfolio_usd * 100.0), 2) if total_portfolio_usd > 0 else 0.0

        return results

    async def get_positions(self, user_id: str) -> List[Dict[str, Any]]:
        balances = await self.get_balances(user_id)
        positions = []
        for b in balances:
            if b["asset"] == "USDT":
                continue
            cur_price = b["price_usd"]
            entry_price = b["avg_entry_price"]
            pnl_pct = ((cur_price - entry_price) / entry_price * 100.0) if entry_price > 0 else 0.0
            pnl_usd = (cur_price - entry_price) * b["amount"]

            positions.append({
                "asset": b["asset"],
                "amount": b["amount"],
                "entry_price": entry_price,
                "current_price": cur_price,
                "unrealized_pnl_usd": round(pnl_usd, 2),
                "unrealized_pnl_pct": round(pnl_pct, 2),
                "risk_status": "HIGH_GAIN" if pnl_pct > 20 else "NORMAL"
            })
        return positions

    async def get_trades(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "trade_id": "tr-sol-01",
                "asset": "SOL",
                "side": "BUY",
                "amount": 25.0,
                "price": 142.20,
                "timestamp": "2026-08-28T14:22:00Z",
                "status": "FILLED"
            },
            {
                "trade_id": "tr-eth-02",
                "asset": "ETH",
                "side": "BUY",
                "amount": 1.5,
                "price": 2850.0,
                "timestamp": "2026-08-29T10:15:00Z",
                "status": "FILLED"
            }
        ]
