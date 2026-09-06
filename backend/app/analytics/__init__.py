from app.providers import market_provider, onchain_provider
from app.analytics.engine import AssetAnalysisEngine

analysis_engine = AssetAnalysisEngine(
    market_provider=market_provider,
    onchain_provider=onchain_provider
)

__all__ = ["AssetAnalysisEngine", "analysis_engine"]
