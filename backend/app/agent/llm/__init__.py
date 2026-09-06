from app.agent.llm.base import BaseLLMProvider
from app.agent.llm.fallback import DeterministicIntelligenceSynthesizer
from app.config import settings

# Default synthesizer instance
llm_synthesizer: BaseLLMProvider = DeterministicIntelligenceSynthesizer()

__all__ = ["BaseLLMProvider", "DeterministicIntelligenceSynthesizer", "llm_synthesizer"]
