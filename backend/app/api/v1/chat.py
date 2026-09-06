from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.agent import orchestrator
from app.core.security import PromptInjectionDefense
from app.utils.logging import logger

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Main conversational endpoint interfacing with the AI Asset Intelligence Agent."""
    try:
        cleaned_message = PromptInjectionDefense.sanitize_text(request.message) if request.message else ""
        response = await orchestrator.process_message(
            user_message=cleaned_message or request.message,
            conversation_id=request.conversation_id,
            user_id=request.user_id or "default_user",
            active_asset=request.active_asset,
            timeframe=request.timeframe or "24h"
        )
        return response
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent reasoning failure: {str(e)}")
