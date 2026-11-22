import io
import os

os.environ.setdefault("VIVA_TOKEN_SECRET", "test-secret")
os.environ.setdefault("GEMINI_API_KEY", "x")
os.environ.setdefault("DEEPGRAM_API_KEY", "x")

import pytest
from docx import Document
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

import core.admin_auth as admin_auth
import core.loader as loader
from core.admin_auth import require_admin
from services.question_extractor import docx_text, extract_questions, normalise


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


def test_normalise_cleans_and_prefixes_concepts():
    items = [
        {"topic": "  Ohm's   Law ", "concept": "Ohms Law!", "question": "  What is  V=IR? ", "answer": " V by I ", "diagram_required": 0},
        {"topic": "", "concept": "ch2.series", "question": "Why series?", "answer": "", "diagram_required": True},
        {"topic": "X", "concept": "c", "question": "   ", "answer": "dropped", "diagram_required": False},
    ]
    out = normalise(items, 2)
    assert len(out) == 2
    assert out[0] == {"topic": "Ohm's Law", "concept": "ch2.ohms-law", "question": "What is V=IR?", "answer": "V by I", "diagram_required": False}
    assert out[1]["topic"] == "GENERAL" and out[1]["concept"] == "ch2.series" and out[1]["diagram_required"] is True


def make_docx(*lines):
    doc = Document()
    for line in lines:
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_docx_text_reads_paragraphs():
    assert docx_text(make_docx("Q1. What is current?", "Ans: flow of charge")) == "Q1. What is current?\nAns: flow of charge"


def test_extract_routes_by_file_type_and_rejects_others():
    seen = {}

    def generate(prompt, pdf):
        seen["pdf"], seen["prompt"] = pdf, prompt
        return {"questions": [{"topic": "T", "concept": "x", "question": "q?", "answer": "a", "diagram_required": False}]}

    assert extract_questions(b"%PDF", "p.PDF", 2, "ELECTRICITY", ["OLD"], generate)[0]["concept"] == "ch2.x"
    assert seen["pdf"] == b"%PDF" and "OLD" in seen["prompt"]

    extract_questions(make_docx("Q1 hello"), "p.docx", 2, "ELECTRICITY", [], generate)
    assert seen["pdf"] is None and "Q1 hello" in seen["prompt"]

    with pytest.raises(ValueError):
        extract_questions(b"x", "p.txt", 2, "E", [], generate)
    with pytest.raises(ValueError):
        extract_questions(make_docx(), "p.docx", 2, "E", [], generate)


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
