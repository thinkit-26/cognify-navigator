import os

os.environ.setdefault("VIVA_TOKEN_SECRET", "test-secret")
os.environ.setdefault("GEMINI_API_KEY", "x")
os.environ.setdefault("DEEPGRAM_API_KEY", "x")

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

import core.admin_auth as admin_auth
import core.loader as loader
from core.admin_auth import require_admin


class FakeResponse:
    def __init__(self, status=200, body=None):
        self.status_code = status
        self._body = body

    def json(self):
        return self._body

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"http {self.status_code}")


@pytest.fixture(autouse=True)
def supabase_env(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "service-key")
    loader._cache.update(at=0.0, rows=None)


def row(i):
    return {"id": i, "chapter_no": 2, "chapter": "ELECTRICITY", "topic": "T", "concept": None, "question": "q", "answer": "a", "source": "", "diagram_required": False}


def test_loader_reads_supabase_and_caches(monkeypatch):
    calls = []

    def fake_get(url, params=None, headers=None, timeout=None):
        calls.append(headers["Range"])
        return FakeResponse(body=[row(1), row(2)])

    monkeypatch.setattr(loader.requests, "get", fake_get)
    assert [q["id"] for q in loader.load_questions()] == [1, 2]
    loader.load_questions()
    assert calls == ["0-999"]  # second call served from the cache


def test_loader_pages_through_large_banks(monkeypatch):
    pages = {"0-999": [row(i) for i in range(1000)], "1000-1999": [row(1000)]}
    monkeypatch.setattr(loader.requests, "get", lambda url, params=None, headers=None, timeout=None: FakeResponse(body=pages[headers["Range"]]))
    assert len(loader.load_questions()) == 1001


def test_loader_falls_back_to_json_when_supabase_fails_or_is_empty(monkeypatch):
    monkeypatch.setattr(loader.requests, "get", lambda *a, **k: FakeResponse(500))
    assert len(loader.load_questions()) == 81
    loader._cache.update(at=0.0, rows=None)
    monkeypatch.setattr(loader.requests, "get", lambda *a, **k: FakeResponse(body=[]))
    assert len(loader.load_questions()) == 81


def test_loader_serves_stale_cache_when_supabase_goes_down(monkeypatch):
    loader._cache.update(at=0.0, rows=[row(9)])  # expired
    monkeypatch.setattr(loader.requests, "get", lambda *a, **k: FakeResponse(500))
    assert loader.load_questions()[0]["id"] == 9


def test_loader_uses_json_when_unconfigured(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL")
    assert len(loader.load_questions()) == 81


def admin_client():
    app = FastAPI()

    @app.get("/x", dependencies=[Depends(require_admin)])
    def x():
        return {"ok": True}

    return TestClient(app)


def test_admin_check(monkeypatch):
    def fake_get(url, params=None, headers=None, timeout=None):
        if url.endswith("/auth/v1/user"):
            return FakeResponse(200, {"id": "u1"}) if headers["Authorization"] == "Bearer good" else FakeResponse(401, {})
        return FakeResponse(200, [{"id": "r"}] if params["user_id"] == "eq.u1" else [])

    monkeypatch.setattr(admin_auth.requests, "get", fake_get)
    c = admin_client()
    assert c.get("/x").status_code == 401
    assert c.get("/x", headers={"Authorization": "Bearer bad"}).status_code == 401
    assert c.get("/x", headers={"Authorization": "Bearer good"}).status_code == 200

    monkeypatch.setattr(admin_auth.requests, "get", lambda url, params=None, headers=None, timeout=None: FakeResponse(200, {"id": "u2"}) if url.endswith("/user") else FakeResponse(200, []))
    assert c.get("/x", headers={"Authorization": "Bearer good"}).status_code == 403


def test_admin_requires_server_config(monkeypatch):
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY")
    assert admin_client().get("/x", headers={"Authorization": "Bearer t"}).status_code == 503
