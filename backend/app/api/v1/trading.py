from fastapi import APIRouter, HTTPException
from app.schemas.trading import (
    OrderPreviewRequest,
    OrderPreviewResponse,
    OrderExecuteRequest,
    OrderExecuteResponse
)
from app.trading.executor import trading_executor

router = APIRouter(prefix="/trading", tags=["Trading Actions & Safety"])


@router.post("/preview", response_model=OrderPreviewResponse)
async def preview_trade(request: OrderPreviewRequest):
    """Generate a non-custodial order preview with estimated slippage and a secure temporary confirmation token."""
    try:
        preview = await trading_executor.preview_order(
            asset=request.asset,
            side=request.side,
            amount=request.amount,
            rationale=request.rationale
        )
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/execute", response_model=OrderExecuteResponse)
async def execute_trade(request: OrderExecuteRequest):
    """Executes a previously previewed trade strictly upon verified user confirmation."""
    try:
        response = await trading_executor.execute_order(
            preview_token=request.preview_token,
            user_confirmed=request.user_confirmed
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
