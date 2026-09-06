import math
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.cache.redis_client import cache
from app.utils.logging import logger


class MemoryService:
    """Multi-layer persistent agent memory with Short-Term, Session, and Semantic Long-Term tiers."""

    def __init__(self):
        # Local persistent memory store
        self._conversations_state: Dict[str, Dict[str, Any]] = {}
        self._user_sessions: Dict[str, Dict[str, Any]] = {}
        self._long_term_memories: Dict[str, List[Dict[str, Any]]] = {}

        # Default seeds for demonstration
        self._long_term_memories["default_user"] = [
            {
                "id": "mem_seed_1",
                "key": "analytical_preference",
                "content": "User prefers deep behavioral on-chain analysis and whale tracking over simple TA indicators.",
                "layer": "long_term_semantic",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "mem_seed_2",
                "key": "frequent_assets",
                "content": "User actively tracks SOL, ETH, BTC, and BNB.",
                "layer": "long_term_semantic",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

    # --- Short-term memory (Conversation specific) ---
    async def get_short_term(self, conversation_id: str) -> Dict[str, Any]:
        cache_key = f"mem:conv:{conversation_id}"
        cached = await cache.get_json(cache_key)
        if cached:
            return cached
        return self._conversations_state.get(conversation_id, {
            "active_asset": "SOL",
            "active_timeframe": "24h",
            "recent_queries": [],
            "last_analysis_summary": None,
            "tool_history": []
        })

    async def update_short_term(self, conversation_id: str, updates: Dict[str, Any]) -> None:
        state = await self.get_short_term(conversation_id)
        state.update(updates)
        self._conversations_state[conversation_id] = state
        cache_key = f"mem:conv:{conversation_id}"
        await cache.set_json(cache_key, state, ttl_seconds=3600)

    # --- Session memory (User specific preferences & watchlists) ---
    async def get_session(self, user_id: str = "default_user") -> Dict[str, Any]:
        cache_key = f"mem:session:{user_id}"
        cached = await cache.get_json(cache_key)
        if cached:
            return cached
        return self._user_sessions.get(user_id, {
            "preferred_assets": ["SOL", "ETH", "BTC", "BNB"],
            "preferred_timeframe": "24h",
            "watchlist": ["SOL", "ETH", "BNB", "BTC"],
            "last_analyzed_asset": "SOL",
            "risk_profile": "MODERATE_AGGRESSIVE"
        })

    async def update_session(self, user_id: str, key: str, value: Any) -> None:
        session = await self.get_session(user_id)
        session[key] = value
        self._user_sessions[user_id] = session
        cache_key = f"mem:session:{user_id}"
        await cache.set_json(cache_key, session, ttl_seconds=86400)

    # --- Long-term semantic memory ---
    async def add_semantic_memory(self, user_id: str, key: str, content: str) -> Dict[str, Any]:
        # Disallow sensitive strings
        for forbidden in ("private_key", "secret", "mnemonic", "password"):
            if forbidden in content.lower():
                raise ValueError("Security violation: Refusing to store credentials or private keys in memory.")

        if user_id not in self._long_term_memories:
            self._long_term_memories[user_id] = []

        item = {
            "id": f"mem_{len(self._long_term_memories[user_id]) + 1}",
            "key": key,
            "content": content,
            "layer": "long_term_semantic",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._long_term_memories[user_id].append(item)
        logger.info(f"Stored long-term memory for user {user_id}: {key}")
        return item

    async def search_semantic_memory(self, query: str, user_id: str = "default_user", limit: int = 3) -> List[Dict[str, Any]]:
        """Semantic/contextual search over long-term memories using term frequency vector similarity."""
        memories = self._long_term_memories.get(user_id, [])
        if not memories:
            return []

        def tokenize(text: str) -> set:
            return set(re.findall(r"\w+", text.lower()))

        query_tokens = tokenize(query)
        scored = []
        for mem in memories:
            mem_tokens = tokenize(mem["content"] + " " + mem["key"])
            overlap = len(query_tokens & mem_tokens)
            score = overlap / (math.sqrt(len(query_tokens) * len(mem_tokens)) + 1e-5)
            scored.append((score, mem))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for score, item in scored[:limit] if score > 0.05 or len(scored) <= 2]


memory_service = MemoryService()
