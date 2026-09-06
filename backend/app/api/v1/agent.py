"""
Agent Diagnostics API – v1.

Endpoints:
  GET /agent/tools                – list all registered agent tools
  GET /agent/binance-os/status    – Binance Agent OS connection health & metadata
  GET /agent/binance-os/tools     – Binance Agent OS MCP tool catalog
  GET /agent/binance-os/traces    – recent BOS execution traces (observability)
"""
from fastapi import APIRouter, Query
from typing import Any, Dict, List

from app.agent.tools.registry import tool_registry, ToolDefinition
from app.agent.binance_os.client import binance_os_client
from app.agent.binance_os.orchestrator import binance_os_orchestrator

router = APIRouter(prefix="/agent", tags=["Agent Diagnostics"])


# ---------------------------------------------------------------------------
# Existing endpoint – preserved without breaking changes
# ---------------------------------------------------------------------------

@router.get("/tools", response_model=List[ToolDefinition])
async def list_agent_tools():
    """List registered agent analytical and execution tools along with schemas."""
    return tool_registry.list_tools()


# ---------------------------------------------------------------------------
# Binance Agent OS diagnostic endpoints
# ---------------------------------------------------------------------------

@router.get("/binance-os/status")
async def binance_os_status() -> Dict[str, Any]:
    """
    Inspect the Binance Agent OS connection state, MCP endpoint URL,
    and tool count. Returns connectivity latency when reachable.
    """
    health = await binance_os_client.health_check()
    recent_traces = binance_os_orchestrator.get_traces(limit=5)
    return {
        "binance_agent_os": health,
        "total_traces_recorded": len(binance_os_orchestrator._trace_log),
        "recent_traces_sample": recent_traces,
    }



@router.get("/binance-os/tools", response_model=List[Dict[str, Any]])
async def binance_os_tools():
    """
    Retrieve the full MCP tool catalog from Binance Agent OS.
    Returns cached local catalog when MCP endpoint is unreachable.
    """
    return await binance_os_client.list_tools()


@router.get("/binance-os/traces", response_model=List[Dict[str, Any]])
async def binance_os_traces(
    limit: int = Query(default=20, ge=1, le=200, description="Number of recent traces to return"),
):
    """
    Return recent Binance Agent OS tool execution traces for observability.
    Traces include: run_id, tool_name, source, latency_ms, success, error.
    """
    return binance_os_orchestrator.get_traces(limit=limit)
