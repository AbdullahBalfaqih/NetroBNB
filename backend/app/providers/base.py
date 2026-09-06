from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.schemas.market import Ticker24h, OrderBookDepth


class MarketDataProvider(ABC):
    """Abstract interface for exchange and market data providers."""

    @abstractmethod
    async def get_price(self, symbol: str) -> float:
        """Get current spot price in USD/USDT."""
        pass

    @abstractmethod
    async def get_ticker_24h(self, symbol: str) -> Ticker24h:
        """Get 24h ticker metrics including high, low, volume, and change."""
        pass

    @abstractmethod
    async def get_order_book(self, symbol: str, limit: int = 100) -> OrderBookDepth:
        """Get order book depth with bids and asks."""
        pass

    @abstractmethod
    async def get_klines(self, symbol: str, interval: str = "1h", limit: int = 100) -> List[Dict[str, Any]]:
        """Get historical candlestick bars."""
        pass


class OnchainDataProvider(ABC):
    """Abstract interface for blockchain on-chain metrics and holder data."""

    @abstractmethod
    async def get_transfers(self, symbol: str, timeframe: str = "24h") -> Dict[str, Any]:
        """Get token transfer counts, volumes, and velocity metrics."""
        pass

    @abstractmethod
    async def get_holders(self, symbol: str) -> Dict[str, Any]:
        """Get holder concentration, distribution, and top holders."""
        pass

    @abstractmethod
    async def get_holder_activity(self, symbol: str, timeframe: str = "24h") -> Dict[str, Any]:
        """Get active address count, new address growth, and reactivation."""
        pass

    @abstractmethod
    async def get_token_metrics(self, symbol: str) -> Dict[str, Any]:
        """Get circulating supply, total supply, and age-distribution."""
        pass


class PortfolioProvider(ABC):
    """Abstract interface for portfolio balances, positions, and trades."""

    @abstractmethod
    async def get_balances(self, user_id: str) -> List[Dict[str, Any]]:
        """Get token balances and values in USD."""
        pass

    @abstractmethod
    async def get_positions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get open positions, entry prices, and unrealized PnL."""
        pass

    @abstractmethod
    async def get_trades(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get trade history and execution logs."""
        pass
