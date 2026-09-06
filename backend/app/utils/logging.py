import logging
import sys
import json
from datetime import datetime, timezone
from typing import Any, Dict


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as structured JSON without leaking credentials."""

    SENSITIVE_KEYS = {"api_key", "secret", "private_key", "password", "token", "authorization"}

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include custom attributes if present
        for attr in ("request_id", "conversation_id", "agent_run_id", "tool_name", "duration_ms"):
            if hasattr(record, attr):
                log_obj[attr] = getattr(record, attr)

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        # Sanitize sensitive fields
        sanitized = self._sanitize(log_obj)
        return json.dumps(sanitized)

    def _sanitize(self, obj: Any) -> Any:
        if isinstance(obj, dict):
            return {
                k: ("[REDACTED]" if any(s in k.lower() for s in self.SENSITIVE_KEYS) else self._sanitize(v))
                for k, v in obj.items()
            }
        elif isinstance(obj, list):
            return [self._sanitize(i) for i in obj]
        return obj


def setup_logger(name: str = "asset_intelligence") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


logger = setup_logger()
