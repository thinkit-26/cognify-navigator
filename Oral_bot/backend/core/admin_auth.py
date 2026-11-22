"""Admin-only access for the question management endpoints.

The browser sends the admin's Supabase access token. We ask Supabase who it belongs to, then check the
user_roles table with the service role key, so an admin is whoever Supabase says is one.
"""

import requests
from fastapi import Header, HTTPException

from core.supabase import rest_headers, supabase_conf


def require_admin(authorization: str = Header(default="")) -> str:
    scheme, _, token = authorization.partition(" ")
    conf = supabase_conf()

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Sign in as an admin.")
    if not conf:
        raise HTTPException(status_code=503, detail="Admin tools are not configured on the server.")

    url, key = conf
    try:
        who = requests.get(f"{url}/auth/v1/user", headers={"apikey": key, "Authorization": f"Bearer {token}"}, timeout=10)
        if who.status_code != 200:
            raise HTTPException(status_code=401, detail="Sign in as an admin.")
        user_id = who.json()["id"]
        role = requests.get(
            f"{url}/rest/v1/user_roles",
            params={"select": "id", "user_id": f"eq.{user_id}", "role": "eq.admin", "limit": "1"},
            headers=rest_headers(key),
            timeout=10,
        )
        role.raise_for_status()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="Could not check your account. Try again.")

    if not role.json():
        raise HTTPException(status_code=403, detail="This account is not an admin.")
    return user_id
