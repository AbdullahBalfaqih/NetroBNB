from fastapi import APIRouter
from app.api.v1.chat import router as chat_router
from app.api.v1.assets import router as assets_router
from app.api.v1.portfolio import router as portfolio_router
from app.api.v1.trading import router as trading_router
from app.api.v1.memory import router as memory_router
from app.api.v1.agent import router as agent_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(chat_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(portfolio_router)
api_v1_router.include_router(trading_router)
api_v1_router.include_router(memory_router)
api_v1_router.include_router(agent_router)

__all__ = ["api_v1_router"]
