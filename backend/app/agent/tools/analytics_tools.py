from app.agent.tools.registry import tool_registry
from app.analytics import analysis_engine


@tool_registry.register(
    name="run_full_asset_analysis",
    description="Run deep 10-module behavioral and market intelligence analysis on an asset (e.g. SOL, BTC, ETH) over a timeframe.",
    permission_level="ANALYTICAL"
)
async def run_full_asset_analysis(asset: str, timeframe: str = "24h") -> dict:
    result = await analysis_engine.analyze_asset(asset, timeframe=timeframe)
    return result.model_dump()


@tool_registry.register(
    name="detect_asset_anomalies",
    description="Identify statistical market, volume, flow, and holder movement anomalies for an asset.",
    permission_level="ANALYTICAL"
)
async def detect_asset_anomalies(asset: str) -> dict:
    result = await analysis_engine.analyze_asset(asset)
    return result.anomalies.model_dump()
