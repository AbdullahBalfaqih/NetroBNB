from app.providers.base import MarketDataProvider, OnchainDataProvider, PortfolioProvider
from app.providers.binance import BinanceMarketDataProvider
from app.providers.onchain import MultiChainOnchainDataProvider
from app.providers.portfolio import UserPortfolioProvider
from app.config import settings

# Market data provider — Binance Agent OS when enabled, REST fallback otherwise
# NOTE: BinanceAgentOSMarketProvider is imported lazily here to avoid a circular
# import caused by: providers → agent_os → agent.binance_os.client → ... → providers
if settings.BINANCE_AGENT_OS_ENABLED:
    from app.providers.agent_os import BinanceAgentOSMarketProvider  # noqa: PLC0415
    market_provider = BinanceAgentOSMarketProvider()
else:
    market_provider = BinanceMarketDataProvider()

onchain_provider = MultiChainOnchainDataProvider()
portfolio_provider = UserPortfolioProvider(BinanceMarketDataProvider())

__all__ = [
    "MarketDataProvider",
    "OnchainDataProvider",
    "PortfolioProvider",
    "BinanceMarketDataProvider",
    "MultiChainOnchainDataProvider",
    "UserPortfolioProvider",
    "market_provider",
    "onchain_provider",
    "portfolio_provider",
]

