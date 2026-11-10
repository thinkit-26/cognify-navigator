import hashlib
import hmac
import os
import time

os.environ["VIVA_TOKEN_SECRET"] = "test-secret"

from fastapi import APIRouter, Depends, FastAPI
from fastapi.testclient import TestClient

from core.auth import is_valid_token, require_viva_token


def make_token(expiry_ms: int, secret: str = "test-secret") -> str:
    expiry = str(expiry_ms)
    return f"{expiry}." + hmac.new(secret.encode(), expiry.encode(), hashlib.sha256).hexdigest()


router = APIRouter()


@router.get("/protected")
def protected():
    return {"ok": True}


app = FastAPI()
app.include_router(router, dependencies=[Depends(require_viva_token)])
client = TestClient(app)
future = int(time.time() * 1000) + 60_000


def call(auth):
    return client.get("/protected", headers={"Authorization": auth} if auth is not None else {})


def test_valid_token_is_accepted():
    assert call(f"Bearer {make_token(future)}").status_code == 200


def test_missing_header_is_rejected():
    assert call(None).status_code == 401


def test_expired_token_is_rejected():
    assert call(f"Bearer {make_token(int(time.time() * 1000) - 1)}").status_code == 401


def test_token_signed_with_another_secret_is_rejected():
    assert call(f"Bearer {make_token(future, secret='other')}").status_code == 401


def test_tampered_expiry_is_rejected():
    expiry, signature = make_token(future).split(".")
    assert call(f"Bearer {int(expiry) + 1}.{signature}").status_code == 401


def test_malformed_tokens_are_rejected():
    for bad in ["Bearer ", "Bearer abc", "Bearer 123.", "Bearer .abc", "Basic xyz", f"Bearer {make_token(future)}.x"]:
        assert call(bad).status_code == 401, bad


def test_non_ascii_digits_do_not_crash():
    # Not reachable through an HTTP header, but is_valid_token must return False, not raise.
    assert is_valid_token("²5.abc") is False
    assert is_valid_token("5.ábc") is False
