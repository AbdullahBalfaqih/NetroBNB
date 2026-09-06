import time
import inspect
from typing import Callable, Dict, Any, List, Optional
from pydantic import BaseModel
from app.utils.logging import logger
from app.agent.binance_os.client import BINANCE_OS_TOOLS


# Valid provider identifiers
PROVIDER_BINANCE_AGENT_OS_MCP = "BINANCE_AGENT_OS_MCP"
PROVIDER_CUSTOM_ANALYTICS = "CUSTOM_ANALYTICS"
PROVIDER_ONCHAIN_INTELLIGENCE = "ONCHAIN_INTELLIGENCE"
PROVIDER_PORTFOLIO_ENGINE = "PORTFOLIO_ENGINE"


class ToolDefinition(BaseModel):
    name: str
    description: str
    permission_level: str = "READ_ONLY"  # 'READ_ONLY', 'ANALYTICAL', 'SENSITIVE_ACTION'
    timeout_seconds: float = 15.0
    input_schema: Dict[str, Any]
    output_schema: Optional[Dict[str, Any]] = None
    provider: str = PROVIDER_CUSTOM_ANALYTICS  # Data/execution provider metadata


class ToolRegistry:
    """Dynamic tool registry managing agent tools, schema validation, and execution."""

    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._definitions: Dict[str, ToolDefinition] = {}

    def register(
        self,
        name: str,
        description: str,
        permission_level: str = "READ_ONLY",
        timeout_seconds: float = 15.0,
        provider: Optional[str] = None,
    ):
        def decorator(func: Callable):
            sig = inspect.signature(func)
            parameters = {}
            for param_name, param in sig.parameters.items():
                if param_name in ("self", "cls"):
                    continue
                param_type = "string"
                if param.annotation == int:
                    param_type = "integer"
                elif param.annotation == float:
                    param_type = "number"
                elif param.annotation == bool:
                    param_type = "boolean"
                elif param.annotation == dict:
                    param_type = "object"
                elif param.annotation == list:
                    param_type = "array"

                parameters[param_name] = {
                    "type": param_type,
                    "required": param.default == inspect.Parameter.empty
                }

            # Auto-detect provider from tool name if not explicitly provided
            resolved_provider = provider
            if resolved_provider is None:
                if name in BINANCE_OS_TOOLS:
                    resolved_provider = PROVIDER_BINANCE_AGENT_OS_MCP
                else:
                    resolved_provider = PROVIDER_CUSTOM_ANALYTICS

            defn = ToolDefinition(
                name=name,
                description=description,
                permission_level=permission_level,
                timeout_seconds=timeout_seconds,
                input_schema=parameters,
                provider=resolved_provider,
            )
            self._tools[name] = func
            self._definitions[name] = defn
            return func
        return decorator

    def get_tool(self, name: str) -> Optional[Callable]:
        return self._tools.get(name)

    def get_definition(self, name: str) -> Optional[ToolDefinition]:
        return self._definitions.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._definitions.values())

    async def execute(self, name: str, **kwargs) -> Dict[str, Any]:
        tool_fn = self.get_tool(name)
        if not tool_fn:
            raise ValueError(f"Tool '{name}' not found in registry.")

        defn = self._definitions.get(name)
        provider = defn.provider if defn else PROVIDER_CUSTOM_ANALYTICS

        start_time = time.time()
        logger.info(f"Executing tool {name} (provider={provider}) with args: {kwargs}")
        try:
            if inspect.iscoroutinefunction(tool_fn):
                result = await tool_fn(**kwargs)
            else:
                result = tool_fn(**kwargs)
            duration = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "SUCCESS",
                "tool_name": name,
                "provider": provider,
                "result": result,
                "duration_ms": duration
            }
        except Exception as e:
            duration = round((time.time() - start_time) * 1000, 2)
            logger.error(f"Error executing tool {name}: {str(e)}")
            return {
                "status": "ERROR",
                "tool_name": name,
                "provider": provider,
                "error": str(e),
                "duration_ms": duration
            }


tool_registry = ToolRegistry()
