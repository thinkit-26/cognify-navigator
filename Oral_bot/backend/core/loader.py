import json
import logging
import time
from pathlib import Path

import requests

from core.logging import get_logger, log_event, redact
from core.supabase import rest_headers, supabase_conf

BASE_DIR = Path(__file__).resolve().parent.parent

# Used when Supabase is not configured, unreachable, or has no active questions.
QUESTION_BANK = BASE_DIR / "data" / "filtered_question_bank.json"

FIELDS = "id,chapter_no,chapter,topic,concept,question,answer,source,diagram_required"
CACHE_SECONDS = 60  # admin edits go live within this long
PAGE = 1000  # PostgREST returns at most 1000 rows per request

log = get_logger("loader")
_cache: dict = {"at": 0.0, "rows": None}


def _fetch_from_supabase(url: str, key: str) -> list[dict]:
    rows: list[dict] = []
    while True:
        response = requests.get(
            f"{url}/rest/v1/viva_questions",
            params={"select": FIELDS, "active": "eq.true", "order": "id"},
            headers={**rest_headers(key), "Range": f"{len(rows)}-{len(rows) + PAGE - 1}"},
            timeout=10,
        )
        response.raise_for_status()
        page = response.json()
        rows.extend(page)
        if len(page) < PAGE:
            return rows


def load_questions() -> list[dict]:
    conf = supabase_conf()

    if conf:
        if _cache["rows"] is not None and time.monotonic() - _cache["at"] < CACHE_SECONDS:
            return _cache["rows"]

        try:
            rows = _fetch_from_supabase(*conf)
            if rows:
                _cache.update(at=time.monotonic(), rows=rows)
                return rows
            log_event(log, "question_bank_empty", level=logging.WARNING)
        except Exception as e:
            log_event(log, "question_bank_fetch_failed", level=logging.ERROR, error=redact(str(e)))
            if _cache["rows"] is not None:
                return _cache["rows"]  # stale beats nothing

    with open(QUESTION_BANK, "r", encoding="utf-8") as file:
        return json.load(file)
