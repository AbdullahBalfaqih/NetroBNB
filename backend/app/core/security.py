import re
import time
from typing import Dict, Tuple, List, Optional
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from app.utils.logging import logger


class PromptInjectionDefense:
    """Detects and mitigates adversarial prompt injection and jailbreak attacks."""

    INJECTION_PATTERNS = [
        re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|prompts)", re.IGNORECASE),
        re.compile(r"disregard\s+(all\s+)?(previous|prior)\s+(rules|guidelines)", re.IGNORECASE),
        re.compile(r"system\s+override", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+(DAN|unfiltered|jailbroken|an\s+unrestricted\s+AI)", re.IGNORECASE),
        re.compile(r"reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions|api\s+key|private\s+key)", re.IGNORECASE),
        re.compile(r"print\s+(your\s+)?(system\s+prompt|instructions)", re.IGNORECASE),
        re.compile(r"act\s+as\s+a\s+hacker|bypass\s+safety|disable\s+guardrails", re.IGNORECASE),
        re.compile(r"<\s*script\b[^>]*>", re.IGNORECASE),
        re.compile(r"javascript\s*:", re.IGNORECASE),
    ]

    @classmethod
    def analyze_prompt(cls, prompt: str) -> Tuple[bool, Optional[str]]:
        """Returns (is_malicious, detected_reason)."""
        if not prompt or not isinstance(prompt, str):
            return False, None

        for pattern in cls.INJECTION_PATTERNS:
            if pattern.search(prompt):
                logger.warning(f"Security Alert: Blocked prompt injection pattern: '{pattern.pattern}' in prompt")
                return True, f"Suspicious prompt pattern detected: {pattern.pattern}"

        return False, None

    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """Sanitizes text by stripping out control characters and suspicious HTML."""
        if not text:
            return ""
        # Remove null bytes and non-printable control characters (except newline, tab)
        cleaned = "".join(ch for ch in text if ch in "\n\r\t" or (32 <= ord(ch) <= 126) or ord(ch) > 127)
        # Strip potential HTML tag injections
        cleaned = re.sub(r"<[^>]*>", "", cleaned)
        return cleaned.strip()


class InMemoryRateLimiter:
    """In-memory sliding window rate limiter to protect sensitive endpoints."""

    def __init__(self, requests_per_minute: int = 60, burst_limit: int = 15):
        self.rpm = requests_per_minute
        self.burst_limit = burst_limit
        # ip -> list of timestamps
        self._records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - 60.0
        burst_start = now - 2.0

        # Clean old records
        self._records[client_ip] = [t for t in self._records[client_ip] if t > window_start]
        recent_requests = self._records[client_ip]

        # Check burst limit (max 15 requests in 2 seconds)
        burst_count = sum(1 for t in recent_requests if t > burst_start)
        if burst_count > self.burst_limit:
            logger.warning(f"Rate Limiter: Burst limit exceeded for client {client_ip}")
            return False

        # Check minute limit
        if len(recent_requests) >= self.rpm:
            logger.warning(f"Rate Limiter: Minute limit ({self.rpm}) exceeded for client {client_ip}")
            return False

        self._records[client_ip].append(now)
        return True


# Global rate limiter instance
global_rate_limiter = InMemoryRateLimiter(requests_per_minute=120, burst_limit=25)
sensitive_rate_limiter = InMemoryRateLimiter(requests_per_minute=30, burst_limit=8)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces strict production security headers on all incoming/outgoing responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"

        # Apply rate limiting on chat and trading endpoints
        path = request.url.path
        if "/api/v1/chat" in path or "/api/v1/trading" in path:
            if not sensitive_rate_limiter.is_allowed(client_ip):
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please cool down before repeating this action."}
                )
        else:
            if not global_rate_limiter.is_allowed(client_ip):
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded. Try again later."}
                )

        # Check payload size (max 1MB to prevent memory exhaustion DOS)
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 1_048_576:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request payload too large. Maximum allowed size is 1MB."}
            )

        response = await call_next(request)

        # Add hardened security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
