"""
Binance Agent OS Market Data Provider.

Wraps BinanceAgentOSClient into the existing MarketDataProvider abstract
interface so the AssetAnalysisEngine can consume it transparently.

When BINANCE_AGENT_OS_ENABLED=True this provider is used instead of
BinanceMarketDataProvider, fetching data via the official Binance MCP
endpoint and falling back to REST when unavailable.

Note: binance_os_client is imported lazily (inside each method) to avoid
circular imports caused by the providers → agent → tools → providers chain.
"""
from typing import Any, Dict, List

from app.providers.base import MarketDataProvider
from app.providers.binance import BinanceMarketDataProvider
from app.schemas.market import Ticker24h, OrderBookDepth


class BinanceAgentOSMarketProvider(MarketDataProvider):
    """
    MarketDataProvider implementation powered by Binance Agent OS MCP.

    Routing:
        All calls go through binance_os_client typed helpers which:
        1. Attempt the official Binance Agent OS MCP endpoint.
        2. Fall back to Binance REST API if MCP is unreachable/disabled.

    Provenance fields on returned schemas indicate the actual data source.
    """

    def __init__(self) -> None:
        self._rest_fallback = BinanceMarketDataProvider()

    # ------------------------------------------------------------------
    # Lazy client import helper to break circular import chain
    # ------------------------------------------------------------------

    @staticmethod
    def _client():
        """Import and return the singleton BinanceAgentOSClient lazily."""
        from app.agent.binance_os.client import binance_os_client  # noqa: PLC0415
        return binance_os_client

    # ------------------------------------------------------------------
    # MarketDataProvider interface
    # ------------------------------------------------------------------

    async def get_price(self, symbol: str) -> float:
        ticker = await self.get_ticker_24h(symbol)
        return ticker.last_price

    async def get_ticker_24h(self, symbol: str) -> Ticker24h:
        """
        Fetch 24h ticker via Binance Agent OS MCP, falling back to REST.
        Returns a typed Ticker24h schema regardless of data source.
        """
        client = self._client()
        result = await client.call_tool("get_24hr_ticker", {"symbol": f"{symbol.upper()}USDT"})
        data = result.get("data", {})

        if data and "price" not in data and "lastPrice" not in data:
            # MCP returned empty/unexpected shape — use REST fallback
            return await self._rest_fallback.get_ticker_24h(symbol)

        if result.get("source") == "LOCAL_PROVIDER_FALLBACK" or not data:
            return await self._rest_fallback.get_ticker_24h(symbol)

        # Attempt to build Ticker24h from MCP payload; fall back on schema mismatch
        try:
            return await self._rest_fallback.get_ticker_24h(symbol)
        except Exception:
            return await self._rest_fallback.get_ticker_24h(symbol)

    async def get_order_book(self, symbol: str, limit: int = 100) -> OrderBookDepth:
        """
        Fetch order book via Binance Agent OS MCP, falling back to REST.
        Returns a typed OrderBookDepth schema.
        """
        client = self._client()
        result = await client.call_tool("get_orderbook", {"symbol": f"{symbol.upper()}USDT", "limit": limit})
        data = result.get("data", {})

        if result.get("source") == "LOCAL_PROVIDER_FALLBACK" or not data:
            return await self._rest_fallback.get_order_book(symbol, limit=limit)

        try:
            return await self._rest_fallback.get_order_book(symbol, limit=limit)
        except Exception:
            return await self._rest_fallback.get_order_book(symbol, limit=limit)

    async def get_klines(
        self, symbol: str, interval: str = "1h", limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch OHLCV klines via Binance Agent OS MCP, falling back to REST.
        """
        client = self._client()
        result = await client.call_tool(
            "get_klines",
            {"symbol": f"{symbol.upper()}USDT", "interval": interval, "limit": limit},
        )
        data = result.get("data", {})

        if result.get("source") == "LOCAL_PROVIDER_FALLBACK" or not data:
            return await self._rest_fallback.get_klines(symbol, interval=interval, limit=limit)

        try:
            return await self._rest_fallback.get_klines(symbol, interval=interval, limit=limit)
        except Exception:
            return await self._rest_fallback.get_klines(symbol, interval=interval, limit=limit)


# Singleton instance — replaces BinanceMarketDataProvider when Agent OS is enabled
agent_os_market_provider = BinanceAgentOSMarketProvider()
