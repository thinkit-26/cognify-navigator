"""Structured JSON logging for the viva backend.

Stdlib only: no new dependencies, no new infrastructure. Lines are written to
stdout, which Render already captures under Dashboard -> Logs.

Every line carries an ``event`` name plus a ``response_id`` or ``session_id``
where one exists, so a single oral response can be followed end to end by
timestamp. Audio, transcripts and credentials are never written here.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from datetime import datetime, timezone
from typing import Any

ROOT_LOGGER = "viva"

# Anything shaped like a credential, plus "Bearer <value>".
_SENSITIVE = re.compile(
    r"(?i)\b(api[_-]?key|token|secret|authorization|password|bearer)\b\s*[=:]\s*\S+"
)
_BEARER = re.compile(r"(?i)\b(bearer)\s+\S+")

_ERROR_LIMIT = 300


def redact(text: str | None, limit: int = _ERROR_LIMIT) -> str:
    """Strip anything that looks like a credential, then cap the length."""
    if not text:
        return ""
    cleaned = _BEARER.sub("Bearer [redacted]", text)
    cleaned = _SENSITIVE.sub(lambda m: f"{m.group(1)}=[redacted]", cleaned)
    return cleaned[:limit]


class JsonLineFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "event": getattr(record, "event", record.getMessage()),
        }

        fields = getattr(record, "fields", None)
        if isinstance(fields, dict):
            payload.update(fields)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False, default=str)


_configured = False


def _configure() -> None:
    global _configured
    if _configured:
        return

    logger = logging.getLogger(ROOT_LOGGER)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonLineFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False

    _configured = True


def get_logger(name: str) -> logging.Logger:
    _configure()
    return logging.getLogger(f"{ROOT_LOGGER}.{name}")


def log_event(logger: logging.Logger, event: str, level: int = logging.INFO, **fields: Any) -> None:
    logger.log(level, event, extra={"event": event, "fields": fields})
