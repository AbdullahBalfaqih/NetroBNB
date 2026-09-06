"""
Binance Agent OS Orchestrator.

Tool router and execution trace logger.  Routes tool calls through
BinanceAgentOSClient and captures:
  - Unique Run ID per invocation
  - Source provenance (MCP vs local fallback)
  - Execution latency
  - Error states

This orchestrator is the single entry point for all Binance Agent OS
tool calls within the agent pipeline.
"""
import uuid
import time
from typing import Any, Dict, List, Optional

from app.agent.binance_os.client import binance_os_client, BINANCE_OS_TOOLS
from app.utils.logging import logger


class ExecutionTrace:
    """Lightweight immutable record of a single tool execution event."""

    __slots__ = (
        "run_id",
        "tool_name",
        "arguments",
        "source",
        "latency_ms",
        "success",
        "error",
        "result",
    )

    def __init__(
        self,
        run_id: str,
        tool_name: str,
        arguments: Dict[str, Any],
        source: str,
        latency_ms: float,
        success: bool,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ) -> None:
        self.run_id = run_id
        self.tool_name = tool_name
        self.arguments = arguments
        self.source = source
        self.latency_ms = latency_ms
        self.success = success
        self.result = result or {}
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "tool_name": self.tool_name,
            "arguments": self.arguments,
            "source": self.source,
            "latency_ms": self.latency_ms,
            "success": self.success,
            "error": self.error,
        }


class BinanceAgentOSOrchestrator:
    """
    Routes agent tool calls through the Binance Agent OS MCP layer and
    maintains a per-request execution trace for observability.
    """

    def __init__(self) -> None:
        self._trace_log: List[ExecutionTrace] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def is_binance_os_tool(self, tool_name: str) -> bool:
        """Return True if the tool should be routed via Binance Agent OS."""
        return tool_name in BINANCE_OS_TOOLS

    async def execute(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute a Binance Agent OS tool, record a trace, and return the result.

        Parameters
        ----------
        tool_name : str
            Name of the MCP tool (e.g. ``get_24hr_ticker``).
        arguments : dict
            Tool-specific payload.
        run_id : str | None
            External run identifier; auto-generated if omitted.

        Returns
        -------
        dict
            ``{"status": "SUCCESS"|"ERROR", "run_id": ..., "source": ...,
               "tool_name": ..., "result": ..., "latency_ms": ...}``
        """
        run_id = run_id or f"bos_{uuid.uuid4().hex[:12]}"
        t0 = time.time()

        logger.info(
            f"[BinanceOS Orchestrator] run_id={run_id} tool={tool_name} args={arguments}"
        )

        try:
            raw = await binance_os_client.call_tool(tool_name, arguments)
            latency_ms = round((time.time() - t0) * 1000, 2)
            source = raw.get("source", "UNKNOWN")

            trace = ExecutionTrace(
                run_id=run_id,
                tool_name=tool_name,
                arguments=arguments,
                source=source,
                latency_ms=latency_ms,
                success=True,
                result=raw.get("data", {}),
            )
            self._trace_log.append(trace)

            logger.info(
                f"[BinanceOS Orchestrator] run_id={run_id} tool={tool_name} "
                f"source={source} latency={latency_ms}ms SUCCESS"
            )

            return {
                "status": "SUCCESS",
                "run_id": run_id,
                "source": source,
                "tool_name": tool_name,
                "result": raw.get("data", {}),
                "latency_ms": latency_ms,
            }

        except Exception as exc:
            latency_ms = round((time.time() - t0) * 1000, 2)
            error_msg = str(exc)

            trace = ExecutionTrace(
                run_id=run_id,
                tool_name=tool_name,
                arguments=arguments,
                source="ERROR",
                latency_ms=latency_ms,
                success=False,
                error=error_msg,
            )
            self._trace_log.append(trace)

            logger.error(
                f"[BinanceOS Orchestrator] run_id={run_id} tool={tool_name} "
                f"FAILED in {latency_ms}ms – {error_msg}"
            )

            return {
                "status": "ERROR",
                "run_id": run_id,
                "source": "ERROR",
                "tool_name": tool_name,
                "error": error_msg,
                "latency_ms": latency_ms,
            }

    async def execute_pipeline(
        self,
        calls: List[Dict[str, Any]],
        run_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Execute multiple Binance Agent OS tool calls sequentially,
        sharing the same run ID for correlated tracing.

        Parameters
        ----------
        calls : list of dict
            Each item: ``{"tool_name": str, "arguments": dict}``.
        run_id : str | None
            Shared run identifier for the whole pipeline batch.
        """
        shared_run_id = run_id or f"bos_{uuid.uuid4().hex[:12]}"
        results = []
        for call in calls:
            result = await self.execute(
                tool_name=call["tool_name"],
                arguments=call.get("arguments", {}),
                run_id=shared_run_id,
            )
            results.append(result)
        return results

    def get_traces(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return the most recent execution traces (newest first)."""
        return [t.to_dict() for t in reversed(self._trace_log[-limit:])]

    def clear_traces(self) -> None:
        self._trace_log.clear()


# Singleton instance
binance_os_orchestrator = BinanceAgentOSOrchestrator()
