from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from core.admin_auth import require_admin
from core.loader import load_questions
from services.question_extractor import MAX_BYTES, State, get_job, start_extraction

router = APIRouter(prefix="/admin", tags=["Admin"])


# A plain def so FastAPI runs it in a worker thread: opening a large PDF takes a moment.
@router.post("/extract-questions")
def start(
    file: UploadFile = File(...),
    chapter_no: int | None = Form(default=None, ge=1, le=999),
    chapter: str = Form(default="", max_length=200),
    user_id: str = Depends(require_admin),
):
    """Starts reading a booklet and returns a job id. With chapter_no and chapter set, every question is filed
    under that chapter; otherwise chapters are detected from the booklet's own headings."""
    data = file.file.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The file is empty.")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="The file is over 25 MB.")

    fallback = State(chapter_no, chapter.strip()) if chapter_no and chapter.strip() else None
    try:
        job = start_extraction(data, file.filename or "", user_id, load_questions(), fallback)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="That file could not be opened. Is it a damaged PDF?")
    return {"job_id": job.id, "total": job.total}


@router.get("/extract-questions/{job_id}")
def progress(job_id: str, user_id: str = Depends(require_admin)):
    job = get_job(job_id, user_id)
    if job is None:
        raise HTTPException(status_code=404, detail="That job is gone. Upload the file again.")
    body = {"status": job.status, "total": job.total, "done": job.done, "warnings": job.warnings}
    if job.status == "done":
        body["questions"] = job.questions
    if job.status == "error":
        body["error"] = job.error
    return body
