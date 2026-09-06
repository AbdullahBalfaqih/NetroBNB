from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application Settings and Configuration."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "NetroBNB Asset Intelligence Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: str = "production"

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./crypto_intelligence.db"

    # Redis Cache (falls back automatically to in-memory cache if unreachable)
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_DEFAULT_TTL: int = 60  # seconds
    PRICE_CACHE_TTL: int = 4     # seconds
    ORDERBOOK_CACHE_TTL: int = 5 # seconds
    ANALYTICS_CACHE_TTL: int = 300 # 5 minutes

    # External Provider APIs
    BINANCE_BASE_URL: str = "https://api.binance.com"
    BINANCE_TIMEOUT_SECONDS: float = 2.5

    # Binance Agent OS & MCP Integration
    BINANCE_AGENT_OS_ENABLED: bool = True
    BINANCE_AGENT_OS_MCP_URL: str = "https://agent.binance.com/mcp/agentic"
    BINANCE_AGENT_OS_API_KEY: str = ""           # Set in .env for authenticated scope
    BINANCE_AGENT_OS_TIMEOUT_SECONDS: float = 3.0
    BINANCE_AGENT_OS_SUBACCOUNT_SCOPE: str = "agentic_read_trade_sandbox"


    # LLM Provider Configuration
    LLM_PROVIDER: str = "fallback"  # Options: 'gemini', 'openai', 'fallback'
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"

    # Safety & Security
    SECRET_KEY: str = "netrobnb-super-secure-production-secret-key-2026"
    MAX_ORDER_SIZE_USD: float = 25000.0


settings = Settings()
