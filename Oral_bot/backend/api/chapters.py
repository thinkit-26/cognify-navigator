from fastapi import APIRouter
from core.loader import load_questions

router = APIRouter(
    prefix="/chapters",
    tags=["Chapters"]
)


@router.get("/")
def get_chapters():

    questions = load_questions()

    chapters = {}

    for q in questions:

        chap_no = q["chapter_no"]
        chap_name = q["chapter"]
        topic = q["topic"]

        if chap_no not in chapters:

            chapters[chap_no] = {
                "chapter_no": chap_no,
                "chapter": chap_name,
                "topics": set()
            }

        chapters[chap_no]["topics"].add(topic)

    result = []

    for chapter in chapters.values():

        chapter["topics"] = sorted(list(chapter["topics"]))

        result.append(chapter)

    result.sort(key=lambda x: x["chapter_no"])

    return result