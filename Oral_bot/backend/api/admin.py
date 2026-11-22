import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from core.admin_auth import require_admin
from core.logging import get_logger, log_event, redact
from services.question_extractor import MAX_BYTES, extract_questions

log = get_logger("admin")

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


# A plain def so FastAPI runs it in a worker thread: the Gemini call blocks for a while.
@router.post("/extract-questions")
def extract(
    file: UploadFile = File(...),
    chapter_no: int = Form(..., ge=1, le=999),
    chapter: str = Form(..., min_length=1, max_length=200),
    known_topics: list[str] = Form(default=[]),
):
    data = file.file.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The file is empty.")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="The file is over 15 MB.")

    try:
        questions = extract_questions(data, file.filename or "", chapter_no, chapter.strip(), known_topics)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_event(log, "extract_failed", level=logging.ERROR, error_type=type(e).__name__, error=redact(str(e)))
        raise HTTPException(status_code=502, detail="Could not read the paper. Try again, or try a clearer file.")

    log_event(log, "extract_ok", chapter_no=chapter_no, questions=len(questions), bytes=len(data))
    return {"questions": questions}
