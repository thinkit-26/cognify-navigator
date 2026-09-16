import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

app = FastAPI(
    title="AI Oral Viva Backend",
    version="1.0"
)

# Comma-separated list of allowed origins, e.g.
#   CORS_ORIGINS=https://app.cognify.in,https://www.cognify.in
# Falls back to local dev origins when not set.
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080")
allow_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "status": "Backend Running"
    }