from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class BaseLLMProvider(ABC):
    """Abstract interface for LLM synthesis and reasoning providers."""

    @abstractmethod
    async def synthesize_response(
        self,
        intent: str,
        user_message: str,
        execution_results: Dict[str, Any],
        memory_context: List[Dict[str, Any]]
    ) -> str:
        """Synthesize a natural language intelligence report grounded in retrieved tool data."""
        pass
