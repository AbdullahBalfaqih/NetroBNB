from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.common import Citation, ActionProposal
from app.schemas.analysis import AssetAnalysisResult, BehavioralScore


class ChatRequest(BaseModel):
    message: str = Field(..., description="User query or command")
    conversation_id: Optional[str] = Field(None, description="Optional existing conversation ID")
    user_id: Optional[str] = Field("default_user", description="Identifier for user")
    active_asset: Optional[str] = Field(None, description="Active dashboard asset context")
    timeframe: Optional[str] = Field("24h", description="Default timeframe window")


class ChatToolExecution(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result_summary: str
    duration_ms: float
    # Observability — Binance Agent OS tracing fields
    data_source: Optional[str] = Field(
        None,
        description="Actual data source: 'BINANCE_AGENT_OS_MCP' | 'LOCAL_PROVIDER_FALLBACK' | 'CUSTOM_ANALYTICS'",
    )
    provider: Optional[str] = Field(
        None,
        description="Provider class that served the data",
    )
    run_id: Optional[str] = Field(
        None,
        description="Binance Agent OS MCP run ID for this tool call",
    )


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    structured_analysis: Optional[AssetAnalysisResult] = None
    behavioral_score: Optional[int] = None
    confidence: Optional[float] = None
    tool_calls: List[ChatToolExecution] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    proposed_actions: List[ActionProposal] = Field(default_factory=list)
    active_asset: Optional[str] = None
    active_timeframe: Optional[str] = None
    # Binance Agent OS observability fields
    binance_os_run_id: Optional[str] = Field(
        None,
        description="Shared Binance Agent OS run ID for this agent turn",
    )
    binance_os_traces: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Per-tool Binance Agent OS execution traces for this agent turn",
    )
