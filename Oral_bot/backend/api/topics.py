from fastapi import APIRouter, Query

from core.loader import load_questions

router = APIRouter(
    prefix="/topics",
    tags=["Topics"]
)


@router.get("")
def get_topics(chapters: list[int] = Query(...)):

    questions = load_questions()

    topics = set()

    for q in questions:
        if q["chapter_no"] in chapters:
            topics.add(q["topic"])

    return sorted(list(topics))