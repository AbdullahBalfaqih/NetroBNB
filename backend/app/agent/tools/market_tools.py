"""
Market data tools — powered by Binance Agent OS MCP.

These tools are registered in the agent tool registry and route all market data
retrieval through binance_os_orchestrator, which:
  1. Calls the official Binance Agent OS MCP endpoint (get_24hr_ticker,
     get_orderbook, get_klines) first.
  2. Records a full execution trace (Run ID, source, latency, error).
  3. Falls back transparently to Binance REST API on connectivity issues.

Returned data flows directly into the existing 10 analytical modules.
"""
from app.agent.tools.registry import tool_registry, PROVIDER_BINANCE_AGENT_OS_MCP
from app.providers import market_provider
from app.agent.binance_os.orchestrator import binance_os_orchestrator
from app.utils.logging import logger


@tool_registry.register(
    name="get_market_overview",
    description=(
        "Retrieve live 24h ticker metrics (spot price, high/low, volume, trades) "
        "via Binance Agent OS MCP with fallback to Binance REST API."
    ),
    permission_level="READ_ONLY",
    provider=PROVIDER_BINANCE_AGENT_OS_MCP,
)
async def get_market_overview(asset: str) -> dict:
    """Fetch 24h ticker via Binance Agent OS, fall back to REST provider."""
    aos_result = await binance_os_orchestrator.execute(
        tool_name="get_24hr_ticker",
        arguments={"symbol": f"{asset.upper()}USDT"},
    )
    if aos_result["status"] == "SUCCESS":
        data = aos_result.get("result", {})
        return {
            **data,
            "_meta": {
                "source": aos_result.get("source", "BINANCE_AGENT_OS_MCP"),
                "run_id": aos_result.get("run_id"),
                "latency_ms": aos_result.get("latency_ms"),
            },
        }
    # Hard fallback: direct provider call
    logger.warning(f"[market_tools] Agent OS get_24hr_ticker failed for {asset} – using provider.")
    ticker = await market_provider.get_ticker_24h(asset)
    result = ticker.model_dump()
    result["_meta"] = {"source": "LOCAL_PROVIDER_FALLBACK"}
    return result


@tool_registry.register(
    name="get_order_book_depth",
    description=(
        "Retrieve live L2 order book depth, bid/ask imbalance, and spread metrics "
        "via Binance Agent OS MCP with fallback to Binance REST API."
    ),
    permission_level="READ_ONLY",
    provider=PROVIDER_BINANCE_AGENT_OS_MCP,
)
async def get_order_book_depth(asset: str, limit: int = 100) -> dict:
    """Fetch order book via Binance Agent OS, fall back to REST provider."""
    aos_result = await binance_os_orchestrator.execute(
        tool_name="get_orderbook",
        arguments={"symbol": f"{asset.upper()}USDT", "limit": limit},
    )
    if aos_result["status"] == "SUCCESS":
        data = aos_result.get("result", {})
        return {
            **data,
            "_meta": {
                "source": aos_result.get("source", "BINANCE_AGENT_OS_MCP"),
                "run_id": aos_result.get("run_id"),
                "latency_ms": aos_result.get("latency_ms"),
            },
        }
    logger.warning(f"[market_tools] Agent OS get_orderbook failed for {asset} – using provider.")
    depth = await market_provider.get_order_book(asset, limit=limit)
    result = depth.model_dump()
    result["_meta"] = {"source": "LOCAL_PROVIDER_FALLBACK"}
    return result


@tool_registry.register(
    name="get_candlesticks",
    description=(
        "Retrieve OHLCV candlestick bars via Binance Agent OS MCP for momentum "
        "and volatility analysis. Falls back to Binance REST API."
    ),
    permission_level="READ_ONLY",
    provider=PROVIDER_BINANCE_AGENT_OS_MCP,
)
async def get_candlesticks(asset: str, interval: str = "1h", limit: int = 48) -> dict:
    """Fetch klines via Binance Agent OS, fall back to REST provider."""
    aos_result = await binance_os_orchestrator.execute(
        tool_name="get_klines",
        arguments={"symbol": f"{asset.upper()}USDT", "interval": interval, "limit": limit},
    )
    if aos_result["status"] == "SUCCESS":
        data = aos_result.get("result", {})
        return {
            **data,
            "_meta": {
                "source": aos_result.get("source", "BINANCE_AGENT_OS_MCP"),
                "run_id": aos_result.get("run_id"),
                "latency_ms": aos_result.get("latency_ms"),
            },
        }
    logger.warning(f"[market_tools] Agent OS get_klines failed for {asset} – using provider.")
    klines = await market_provider.get_klines(asset, interval=interval, limit=limit)
    return {"klines": klines, "_meta": {"source": "LOCAL_PROVIDER_FALLBACK"}}
