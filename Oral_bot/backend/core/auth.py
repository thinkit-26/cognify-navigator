import hashlib
import hmac
import os
import time

from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

# Same secret as VIVA_TOKEN_SECRET on the Cloudflare site. Fail at startup, not open.
TOKEN_SECRET = os.getenv("VIVA_TOKEN_SECRET")

if not TOKEN_SECRET:
    raise RuntimeError("VIVA_TOKEN_SECRET not found.")


def is_valid_token(token: str) -> bool:
    """Token format "<expiryMs>.<hex HMAC-SHA256(expiryMs)>", issued by src/lib/viva/gate.functions.ts."""

    expiry, dot, signature = token.partition(".")

    if not dot or "." in signature:
        return False

    if not (expiry.isascii() and expiry.isdigit() and signature.isascii()):
        return False

    if int(expiry) <= time.time() * 1000:
        return False

    expected = hmac.new(TOKEN_SECRET.encode(), expiry.encode(), hashlib.sha256).hexdigest()

    return hmac.compare_digest(signature, expected)


def require_viva_token(authorization: str = Header(default="")):
    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not is_valid_token(token):
        raise HTTPException(status_code=401, detail="Missing or invalid access token.")
