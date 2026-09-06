from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.memory.service import memory_service
from app.schemas.memory import MemoryCreate, MemoryResponse

router = APIRouter(prefix="/memory", tags=["Agent Memory"])


@router.get("/session")
async def get_session_memory(user_id: str = Query("default_user")):
    """Retrieve session memory containing watchlists and analytical preferences."""
    return await memory_service.get_session(user_id)


@router.get("/semantic")
async def search_semantic_memory(query: str = Query(...), user_id: str = Query("default_user")):
    """Search long-term semantic agent facts and historical conclusions."""
    return await memory_service.search_semantic_memory(query=query, user_id=user_id)


@router.post("", response_model=Dict[str, Any])
async def add_memory_item(item: MemoryCreate, user_id: str = Query("default_user")):
    """Add a verified fact or constraint to the agent's long-term memory."""
    try:
        return await memory_service.add_semantic_memory(
            user_id=user_id,
            key=item.key,
            content=item.content
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
