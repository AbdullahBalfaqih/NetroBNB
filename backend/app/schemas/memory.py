from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class MemoryCreate(BaseModel):
    layer: str = Field(..., description="'short_term', 'session', or 'long_term_semantic'")
    key: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


class MemoryResponse(BaseModel):
    id: str
    layer: str
    key: str
    content: str
    created_at: str
    relevance_score: float = 1.0
