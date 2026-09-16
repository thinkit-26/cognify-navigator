from fastapi import APIRouter

from core.loader import load_questions

from api.chapters import router as chapter_router
from api.topics import router as topic_router
from api.viva import router as viva_router
from api.transcribe import router as transcribe_router

router = APIRouter()

router.include_router(chapter_router)
router.include_router(topic_router)
router.include_router(viva_router)
router.include_router(transcribe_router)


@router.get("/questions")
def get_questions():
    return load_questions()