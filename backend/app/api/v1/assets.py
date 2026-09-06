from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.analytics import analysis_engine
from app.providers import market_provider
from app.schemas.analysis import AssetAnalysisResult, BehavioralScore, AnomalyDetection
from app.schemas.market import MarketSummary, OrderBookDepth

router = APIRouter(prefix="/assets", tags=["Assets & Market Intelligence"])

CATALOG = [
    {"symbol": "SOL", "name": "Solana", "chain": "Solana", "category": "Layer 1"},
    {"symbol": "BTC", "name": "Bitcoin", "chain": "Bitcoin", "category": "Store of Value"},
    {"symbol": "ETH", "name": "Ethereum", "chain": "Ethereum", "category": "Smart Contracts"},
    {"symbol": "BNB", "name": "BNB", "chain": "BNB Chain", "category": "Ecosystem"},
    {"symbol": "XRP", "name": "XRP", "chain": "Ripple", "category": "Payments"},
    {"symbol": "DOGE", "name": "Dogecoin", "chain": "Dogecoin", "category": "Meme"},
    {"symbol": "ADA", "name": "Cardano", "chain": "Cardano", "category": "Layer 1"},
    {"symbol": "AVAX", "name": "Avalanche", "chain": "Avalanche", "category": "Layer 1"},
    {"symbol": "SUI", "name": "Sui Network", "chain": "Sui", "category": "Move VM"},
    {"symbol": "TON", "name": "Toncoin", "chain": "TON", "category": "Social"},
    {"symbol": "LINK", "name": "Chainlink", "chain": "Ethereum", "category": "Oracle"},
    {"symbol": "NEAR", "name": "NEAR Protocol", "chain": "NEAR", "category": "Layer 1"},
]


@router.get("", response_model=List[Dict[str, Any]])
async def list_assets():
    """Retrieve supported assets available for deep behavioral analysis."""
    return CATALOG


@router.get("/{symbol}/analysis", response_model=AssetAnalysisResult)
async def get_asset_analysis(symbol: str, timeframe: str = Query("24h", description="Timeframe e.g. 1h, 24h, 7d")):
    """Run full 10-module intelligence analysis on the requested asset."""
    try:
        return await analysis_engine.analyze_asset(symbol, timeframe=timeframe)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed for {symbol}: {str(e)}")


@router.get("/{symbol}/market")
async def get_asset_market_data(symbol: str):
    """Retrieve live spot ticker, 24h stats, and order book depth."""
    try:
        ticker = await market_provider.get_ticker_24h(symbol)
        depth = await market_provider.get_order_book(symbol, limit=50)
        return {
            "symbol": symbol.upper(),
            "ticker": ticker.model_dump(),
            "order_book": depth.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market data fetch failed for {symbol}: {str(e)}")


@router.get("/{symbol}/behavior", response_model=BehavioralScore)
async def get_asset_behavioral_score(symbol: str, timeframe: str = "24h"):
    """Retrieve the explainable composite behavioral score and component contributions."""
    try:
        analysis = await analysis_engine.analyze_asset(symbol, timeframe=timeframe)
        return analysis.behavioral_score_breakdown
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Behavioral score calculation failed for {symbol}: {str(e)}")


@router.get("/{symbol}/anomalies", response_model=AnomalyDetection)
async def get_asset_anomalies(symbol: str):
    """Retrieve active statistical anomalies and baseline deviations."""
    try:
        analysis = await analysis_engine.analyze_asset(symbol)
        return analysis.anomalies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly scan failed for {symbol}: {str(e)}")
