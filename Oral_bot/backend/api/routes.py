from fastapi import APIRouter, Depends

from core.auth import require_viva_token

from api.chapters import router as chapter_router
from api.topics import router as topic_router
from api.viva import router as viva_router
from api.transcribe import router as transcribe_router

router = APIRouter()

router.include_router(chapter_router)
router.include_router(topic_router)
# /chapters and /topics only list names; everything that costs money or holds a session needs the token.
router.include_router(viva_router, dependencies=[Depends(require_viva_token)])
router.include_router(transcribe_router, dependencies=[Depends(require_viva_token)])

