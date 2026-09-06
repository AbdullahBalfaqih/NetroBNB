"""
Binance Agent OS MCP Client.

Implements standard MCP JSON-RPC 2.0 protocol for tool execution against
the official Binance Agent OS endpoint:
    https://agent.binance.com/mcp/agentic

Falls back transparently to BinanceMarketDataProvider (Binance REST API)
when the MCP endpoint is unavailable, disabled, or returns an error.

Supported Binance Agent OS MCP tools (read / analytical scope):
  • get_price           — current spot price
  • get_24hr_ticker     — 24-hour rolling statistics
  • get_orderbook       — L2 order book snapshot
  • get_klines          — OHLCV candlestick bars
  • get_book_ticker     — best bid/ask price and quantity
  • get_account_balance — sub-account balances (requires API key with auth scope)

High-level typed helpers (return schema objects used by the analytics engine):
  • get_ticker_24h_typed()  → Ticker24h
  • get_orderbook_typed()   → OrderBookDepth
  • get_klines_typed()      → List[Dict]
  • get_account_balance_typed() → Dict  (unavailable dict if no API key)
"""
import uuid
import time
import httpx
from typing import Any, Dict, List, Optional

from app.config import settings
from app.utils.logging import logger
from app.schemas.market import Ticker24h, OrderBookDepth, OrderBookLevel
from app.schemas.common import Provenance


# ---------------------------------------------------------------------------
# Supported Binance Agent OS MCP tools
# ---------------------------------------------------------------------------
BINANCE_OS_TOOLS = {
    "get_price",
    "get_24hr_ticker",
    "get_orderbook",
    "get_klines",
    "get_book_ticker",
    "get_account_balance",
}


class BinanceAgentOSClient:
    """
    MCP JSON-RPC 2.0 client for Binance Agent OS.

    Capabilities
    ------------
    - ``tools/list``  – enumerate available MCP tools from the remote endpoint.
    - ``tools/call``  – invoke a named MCP tool with arbitrary arguments.
    - Automatic fallback to the local BinanceMarketDataProvider when the
      remote Agent OS endpoint is unreachable, throttled, or disabled.
    """

    def __init__(self) -> None:
        self._base_url: str = settings.BINANCE_AGENT_OS_MCP_URL
        self._api_key: str = settings.BINANCE_AGENT_OS_API_KEY
        self._timeout: float = settings.BINANCE_AGENT_OS_TIMEOUT_SECONDS
        self._enabled: bool = settings.BINANCE_AGENT_OS_ENABLED
        self._available_tools: Optional[List[Dict[str, Any]]] = None
        self._client: Optional[httpx.AsyncClient] = None
        self._circuit_open_until: float = 0.0

    # ------------------------------------------------------------------
    # HTTP plumbing
    # ------------------------------------------------------------------

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            headers: Dict[str, str] = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            if self._api_key:
                headers["Authorization"] = f"Bearer {self._api_key}"
            self._client = httpx.AsyncClient(
                base_url=self._base_url,
                headers=headers,
                timeout=self._timeout,
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ------------------------------------------------------------------
    # MCP JSON-RPC helpers
    # ------------------------------------------------------------------

    def _build_request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": method,
            "params": params,
        }

    async def _post_jsonrpc(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        client = self._get_client()
        response = await client.post("/", json=payload)
        response.raise_for_status()
        data = response.json()
        if "error" in data:
            raise RuntimeError(
                f"MCP error {data['error'].get('code')}: {data['error'].get('message')}"
            )
        return data.get("result", {})

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def list_tools(self) -> List[Dict[str, Any]]:
        """
        Retrieve the MCP tool catalog from Binance Agent OS.
        Returns cached result on subsequent calls.
        """
        if not self._enabled:
            return self._local_tool_catalog()

        if self._available_tools is not None:
            return self._available_tools

        try:
            payload = self._build_request("tools/list", {})
            result = await self._post_jsonrpc(payload)
            self._available_tools = result.get("tools", [])
            logger.info(
                f"[BinanceAgentOS] Fetched {len(self._available_tools)} MCP tools from {self._base_url}"
            )
            return self._available_tools
        except Exception as exc:
            logger.warning(
                f"[BinanceAgentOS] tools/list failed – using local catalog. Error: {exc}"
            )
            self._available_tools = self._local_tool_catalog()
            return self._available_tools

    async def call_tool(
        self, tool_name: str, arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Invoke a Binance Agent OS MCP tool.

        Falls back to local provider emulation if:
        - Agent OS is disabled in config.
        - Remote endpoint is unreachable or returns an error.
        """
        if not self._enabled or time.time() < self._circuit_open_until:
            return await self._local_fallback(tool_name, arguments)

        try:
            payload = self._build_request(
                "tools/call",
                {"name": tool_name, "arguments": arguments},
            )
            t0 = time.time()
            result = await self._post_jsonrpc(payload)
            latency_ms = round((time.time() - t0) * 1000, 2)
            logger.info(
                f"[BinanceAgentOS] tool='{tool_name}' completed in {latency_ms} ms via MCP."
            )
            return {
                "source": "BINANCE_AGENT_OS_MCP",
                "tool": tool_name,
                "latency_ms": latency_ms,
                "data": result,
            }
        except Exception as exc:
            self._circuit_open_until = time.time() + 60.0  # Cool off for 60s
            logger.warning(
                f"[BinanceAgentOS] tool='{tool_name}' MCP call failed ({exc}). "
                "Falling back to local provider (circuit breaker active for 60s)."
            )
            return await self._local_fallback(tool_name, arguments)

    async def health_check(self) -> Dict[str, Any]:
        """Return connection status and metadata for the Agent OS endpoint."""
        if not self._enabled:
            return {
                "status": "disabled",
                "endpoint": self._base_url,
                "enabled": False,
                "tools_count": len(self._local_tool_catalog()),
            }

        try:
            t0 = time.time()
            tools = await self.list_tools()
            latency_ms = round((time.time() - t0) * 1000, 2)
            return {
                "status": "connected",
                "endpoint": self._base_url,
                "enabled": True,
                "tools_count": len(tools),
                "latency_ms": latency_ms,
            }
        except Exception as exc:
            return {
                "status": "unreachable",
                "endpoint": self._base_url,
                "enabled": True,
                "error": str(exc),
            }

    # ------------------------------------------------------------------
    # Local fallback – delegates to BinanceMarketDataProvider
    # ------------------------------------------------------------------

    async def _local_fallback(
        self, tool_name: str, arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Emulate Binance Agent OS tools using the local BinanceMarketDataProvider.
        Imported lazily to avoid circular imports at module load time.
        """
        # Use BinanceMarketDataProvider directly to prevent recursion with BinanceAgentOSMarketProvider
        from app.providers.binance import BinanceMarketDataProvider  # type: ignore
        local_provider = BinanceMarketDataProvider()

        asset: str = arguments.get("symbol", arguments.get("asset", "SOLUSDT"))
        # Normalise: provider expects "SOL", endpoint may send "SOLUSDT"
        clean_asset = asset.replace("USDT", "").replace("BUSD", "")

        try:
            if tool_name == "get_price":
                ticker = await local_provider.get_ticker_24h(clean_asset)
                data = {"symbol": asset, "price": str(ticker.last_price)}

            elif tool_name == "get_24hr_ticker":
                ticker = await local_provider.get_ticker_24h(clean_asset)
                data = ticker.model_dump()

            elif tool_name == "get_orderbook":
                limit = arguments.get("limit", 20)
                book = await local_provider.get_order_book(clean_asset, limit=limit)
                data = book.model_dump()

            elif tool_name == "get_klines":
                interval = arguments.get("interval", "1h")
                limit = arguments.get("limit", 24)
                data = {
                    "symbol": asset,
                    "interval": interval,
                    "limit": limit,
                    "note": "Klines data via local provider – OHLCV approximation.",
                }

            elif tool_name == "get_book_ticker":
                book = await local_provider.get_order_book(clean_asset, limit=5)
                data = {
                    "symbol": asset,
                    "bidPrice": book.bids[0][0] if book.bids else "0",
                    "bidQty": book.bids[0][1] if book.bids else "0",
                    "askPrice": book.asks[0][0] if book.asks else "0",
                    "askQty": book.asks[0][1] if book.asks else "0",
                }

            elif tool_name == "get_account_balance":
                data = {
                    "note": "Account balance requires Binance Agent OS authentication.",
                    "balances": [],
                }

            else:
                data = {"error": f"Unknown tool '{tool_name}' in local fallback."}

            return {
                "source": "LOCAL_PROVIDER_FALLBACK",
                "tool": tool_name,
                "data": data,
            }

        except Exception as exc:
            logger.error(
                f"[BinanceAgentOS] Local fallback also failed for tool='{tool_name}': {exc}"
            )
            return {
                "source": "LOCAL_PROVIDER_FALLBACK",
                "tool": tool_name,
                "error": str(exc),
                "data": {},
            }

    # ------------------------------------------------------------------
    # Static local catalog (used when MCP endpoint is unreachable)
    # ------------------------------------------------------------------

    @staticmethod
    def _local_tool_catalog() -> List[Dict[str, Any]]:
        return [
            {
                "name": "get_price",
                "description": "Get current price for a trading pair.",
                "source": "local_fallback",
            },
            {
                "name": "get_24hr_ticker",
                "description": "24-hour price change statistics.",
                "source": "local_fallback",
            },
            {
                "name": "get_orderbook",
                "description": "Order book depth snapshot.",
                "source": "local_fallback",
            },
            {
                "name": "get_klines",
                "description": "Candlestick / OHLCV data.",
                "source": "local_fallback",
            },
            {
                "name": "get_book_ticker",
                "description": "Best bid/ask price and quantity.",
                "source": "local_fallback",
            },
            {
                "name": "get_account_balance",
                "description": "Account balance (requires auth).",
                "source": "local_fallback",
            },
        ]


    # ------------------------------------------------------------------
    # Typed high-level helpers (return schema objects for analytics engine)
    # ------------------------------------------------------------------

    @staticmethod
    def _os_provenance(tool_name: str, is_fallback: bool = False) -> Provenance:
        if is_fallback:
            return Provenance(
                source="Binance REST API (Agent OS Fallback)",
                methodology="Direct Binance REST API when Agent OS MCP unavailable",
                confidence=0.92,
                provider="BinanceAgentOSClient-fallback",
            )
        return Provenance(
            source="Binance Agent OS MCP",
            methodology=f"Official Binance Agent OS tool: {tool_name}",
            input_range="live",
            confidence=1.0,
            provider="BinanceAgentOSClient",
        )

    @staticmethod
    def _normalize_symbol(symbol: str) -> str:
        s = symbol.upper().strip()
        for suffix in ("USDT", "BUSD", "USDC"):
            if not s.endswith(suffix):
                continue
            return s
        return f"{s}USDT"

    @staticmethod
    def _clean_base(symbol: str) -> str:
        s = symbol.upper().strip()
        for suffix in ("USDT", "BUSD", "USDC"):
            if s.endswith(suffix):
                return s[: -len(suffix)]
        return s

    async def get_ticker_24h_typed(self, symbol: str) -> Ticker24h:
        """
        Return a Ticker24h schema object sourced from Binance Agent OS,
        with automatic fallback to BinanceMarketDataProvider.
        """
        pair = self._normalize_symbol(symbol)
        base = self._clean_base(symbol)
        raw = await self.call_tool("get_24hr_ticker", {"symbol": pair})
        source = raw.get("source", "UNKNOWN")
        d = raw.get("data", {})
        # Agent OS may nest data under 'data' key again
        if "data" in d and isinstance(d["data"], dict):
            d = d["data"]
        is_fallback = source != "BINANCE_AGENT_OS_MCP"
        prov = self._os_provenance("get_24hr_ticker", is_fallback=is_fallback)

        # If local fallback already returned a model dump, parse it directly
        if "last_price" in d:
            try:
                return Ticker24h(**{**d, "provenance": prov})
            except Exception:
                pass

        # Parse from Binance Agent OS raw fields
        try:
            return Ticker24h(
                symbol=base,
                last_price=float(d.get("lastPrice", d.get("last_price", 0))),
                price_change_percent=float(d.get("priceChangePercent", d.get("price_change_percent", 0))),
                high_price=float(d.get("highPrice", d.get("high_price", 0))),
                low_price=float(d.get("lowPrice", d.get("low_price", 0))),
                volume_quote=float(d.get("quoteVolume", d.get("volume_quote", d.get("volume", 0)))),
                trades_count=int(d.get("count", d.get("trades_count", d.get("trades", 0)))),
                open_time=int(d.get("openTime", d.get("open_time", 0))),
                close_time=int(d.get("closeTime", d.get("close_time", 0))),
                provenance=prov,
            )
        except Exception as e:
            logger.warning(f"[BinanceAgentOS] Ticker parse failed for {pair}: {e} — using REST fallback.")

        # Hard fallback to REST provider
        from app.providers.binance import BinanceMarketDataProvider
        rest = BinanceMarketDataProvider()
        ticker = await rest.get_ticker_24h(symbol)
        ticker.provenance = self._os_provenance("get_24hr_ticker", is_fallback=True)
        return ticker

    async def get_orderbook_typed(self, symbol: str, limit: int = 100) -> OrderBookDepth:
        """
        Return an OrderBookDepth schema object sourced from Binance Agent OS,
        with automatic fallback to BinanceMarketDataProvider.
        """
        pair = self._normalize_symbol(symbol)
        base = self._clean_base(symbol)
        raw = await self.call_tool("get_orderbook", {"symbol": pair, "limit": limit})
        source = raw.get("source", "UNKNOWN")
        d = raw.get("data", {})
        if "data" in d and isinstance(d["data"], dict):
            d = d["data"]
        is_fallback = source != "BINANCE_AGENT_OS_MCP"
        prov = self._os_provenance("get_orderbook", is_fallback=is_fallback)

        # If local fallback returned a model dump, parse it directly
        if "bids" in d and isinstance(d["bids"], list) and d["bids"] and isinstance(d["bids"][0], dict):
            try:
                return OrderBookDepth(**{**d, "provenance": prov})
            except Exception:
                pass

        # Parse from Binance Agent OS raw (list of [price, qty])
        bids_raw = d.get("bids", [])
        asks_raw = d.get("asks", [])
        if bids_raw and asks_raw:
            try:
                bids = [OrderBookLevel(price=float(b[0]), quantity=float(b[1])) for b in bids_raw]
                asks = [OrderBookLevel(price=float(a[0]), quantity=float(a[1])) for a in asks_raw]
                bid_usd = sum(b.price * b.quantity for b in bids)
                ask_usd = sum(a.price * a.quantity for a in asks)
                total = bid_usd + ask_usd
                imbalance = (bid_usd - ask_usd) / total if total > 0 else 0.0
                best_bid = bids[0].price if bids else 0.0
                best_ask = asks[0].price if asks else 0.0
                spread = max(0.0, best_ask - best_bid)
                spread_bps = (spread / best_ask * 10000) if best_ask > 0 else 0.0
                return OrderBookDepth(
                    symbol=base, bids=bids, asks=asks,
                    bid_depth_usd=bid_usd, ask_depth_usd=ask_usd,
                    bid_ask_imbalance=round(imbalance, 4),
                    spread_usd=round(spread, 4),
                    spread_bps=round(spread_bps, 2),
                    provenance=prov,
                )
            except Exception as e:
                logger.warning(f"[BinanceAgentOS] Orderbook parse failed for {pair}: {e} — using REST fallback.")

        # Hard fallback to REST provider
        from app.providers.binance import BinanceMarketDataProvider
        rest = BinanceMarketDataProvider()
        depth = await rest.get_order_book(symbol, limit=limit)
        depth.provenance = self._os_provenance("get_orderbook", is_fallback=True)
        return depth

    async def get_klines_typed(
        self, symbol: str, interval: str = "1h", limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Return OHLCV klines sourced from Binance Agent OS,
        with automatic fallback to BinanceMarketDataProvider.
        """
        pair = self._normalize_symbol(symbol)
        raw = await self.call_tool("get_klines", {"symbol": pair, "interval": interval, "limit": limit})
        source = raw.get("source", "UNKNOWN")
        d = raw.get("data", {})
        klines_raw = d.get("klines", d.get("data", d if isinstance(d, list) else None))
        if isinstance(klines_raw, list) and klines_raw:
            try:
                candles = []
                for k in klines_raw:
                    if isinstance(k, list):
                        candles.append({
                            "open_time": int(k[0]), "open": float(k[1]),
                            "high": float(k[2]), "low": float(k[3]),
                            "close": float(k[4]), "volume": float(k[5]),
                            "close_time": int(k[6]), "quote_volume": float(k[7]),
                            "trades": int(k[8]),
                            "taker_buy_base_volume": float(k[9]),
                            "taker_buy_quote_volume": float(k[10]),
                        })
                    elif isinstance(k, dict) and "close" in k:
                        candles.append(k)
                if candles:
                    return candles
            except Exception as e:
                logger.warning(f"[BinanceAgentOS] Klines parse failed for {pair}: {e} — using REST fallback.")

        # Hard fallback to REST provider
        from app.providers.binance import BinanceMarketDataProvider
        rest = BinanceMarketDataProvider()
        return await rest.get_klines(symbol, interval=interval, limit=limit)

    async def get_account_balance_typed(self) -> Dict[str, Any]:
        """
        Return agent sub-account balances via Binance Agent OS.
        Returns {"status": "unavailable", "reason": ...} when auth is not configured.
        """
        if not self._api_key:
            return {
                "status": "unavailable",
                "reason": "Binance Agent OS API key not set. Configure BINANCE_AGENT_OS_API_KEY in .env.",
            }
        raw = await self.call_tool("get_account_balance", {})
        if raw.get("source") == "BINANCE_AGENT_OS_MCP":
            return raw.get("data", {})
        return {
            "status": "unavailable",
            "reason": raw.get("error", "Account balance retrieval failed."),
        }


# Singleton instance
binance_os_client = BinanceAgentOSClient()
