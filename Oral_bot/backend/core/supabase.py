"""Server-side Supabase access for the backend (service role key, never sent to a browser)."""

import os

from dotenv import load_dotenv

load_dotenv()


def supabase_conf() -> tuple[str, str] | None:
    """(url, service role key), or None when not configured, so local runs fall back to the JSON bank."""
    url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
    return (url, key) if url and key else None


def rest_headers(key: str) -> dict[str, str]:
    return {"apikey": key, "Authorization": f"Bearer {key}"}
