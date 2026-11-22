import logging
import time

from fastapi import APIRouter, BackgroundTasks, HTTPException

from core.loader import load_questions
from core.logging import get_logger, log_event, redact
from models.schemas import VivaRequest, AnswerRequest
from services.session_manager import session_manager
from services.gemini_evaluator import evaluate_session, build_final_evaluation

log = get_logger("viva")

router = APIRouter(
    prefix="/viva",
    tags=["Viva"],
)


def _run_evaluation(session_id: str) -> None:
    """
    Runs after the answer response has been sent, so a slow Gemini call (up to
    ~45s of retry backoff) can no longer outlive the client's request timeout.
    /viva/evaluation/{id} still reports "pending" until this finishes, which is
    exactly what the frontend already polls for.
    """
    session = session_manager.get_session(session_id)
    if session is None:
        log_event(
            log,
            "evaluation_session_missing",
            level=logging.WARNING,
            session_id=session_id,
        )
        return

    started = time.perf_counter()
    log_event(
        log,
        "evaluation_started",
        session_id=session_id,
        total_answers=len(session.answers),
    )

    try:
        raw_eval = evaluate_session(session.answers)
        final_eval = build_final_evaluation(session.answers, raw_eval)
        session.set_evaluation(final_eval)
        log_event(
            log,
            "evaluation_finished",
            session_id=session_id,
            elapsed_ms=round((time.perf_counter() - started) * 1000),
            overall_score=final_eval.get("overall_score"),
            total_questions=final_eval.get("total_questions"),
        )
    except Exception as e:
        session.set_evaluation({"error": f"Evaluation failed: {str(e)}"})
        log_event(
            log,
            "evaluation_failed",
            level=logging.ERROR,
            session_id=session_id,
            elapsed_ms=round((time.perf_counter() - started) * 1000),
            error_type=type(e).__name__,
            error=redact(str(e)),
        )


@router.post("/start")
def start_viva(request: VivaRequest):

    questions = load_questions()

    session = session_manager.create_session(
        questions,
        request.chapters,
        request.topics,
        question_count=request.question_count,
    )

    if not session.questions:
        log_event(
            log,
            "session_empty",
            level=logging.WARNING,
            chapters=request.chapters,
            topics=request.topics,
        )
        raise HTTPException(
            status_code=400,
            detail="No questions are available for the selected topics.",
        )

    selected_topics = sorted({q["topic"] for q in session.questions})
    selected_concepts = len({q.get("concept") or q["id"] for q in session.questions})
    missing_topics = sorted(set(request.topics) - set(selected_topics))

    log_event(
        log,
        "session_created",
        session_id=session.session_id,
        chapters=len(request.chapters),
        topics=len(request.topics),
        total_questions=len(session.questions),
        selected_topics=len(selected_topics),
        selected_concepts=selected_concepts,
        missing_topics=missing_topics,
    )

    if missing_topics:
        log_event(
            log,
            "session_topics_missing",
            level=logging.WARNING,
            session_id=session.session_id,
            missing_topics=missing_topics,
        )

    return {
        "session_id": session.session_id,
        "total_questions": len(session.questions),
        "status": session.status
    }


@router.get("/question/{session_id}")
def get_question(session_id: str):

    session = session_manager.get_session(session_id)

    if session is None:
        return {"error": "Session not found"}

    if session.is_completed():
        return {"status": "completed"}

    question = session.get_current_question()

    return {
        "question_number": session.current_index + 1,
        "total_questions": len(session.questions),
        "question": question
    }


@router.post("/answer")
def submit_answer(request: AnswerRequest, background_tasks: BackgroundTasks):

    session = session_manager.get_session(request.session_id)

    if session is None:
        log_event(
            log,
            "answer_session_missing",
            level=logging.WARNING,
            session_id=request.session_id,
        )
        return {"error": "Session not found"}

    session.submit_answer(request.answer)

    if session.is_completed():

        log_event(
            log,
            "session_completed",
            session_id=request.session_id,
            total_answers=len(session.answers),
        )
        # Handled after the response is sent — see _run_evaluation.
        background_tasks.add_task(_run_evaluation, request.session_id)

        return {
            "status": "completed",
            "total_answers": len(session.answers)
        }

    return {
        "status": "running",
        "next_question": session.get_current_question(),
        "question_number": session.current_index + 1,
        "total_questions": len(session.questions)
    }


@router.get("/evaluation/{session_id}")
def get_evaluation(session_id: str):
    # Polled every 2s by the frontend, so deliberately not logged.

    session = session_manager.get_session(session_id)

    if session is None:
        return {"error": "Session not found"}

    if session.evaluation is None:
        return {"status": "pending"}

    return {
        "status": "ready",
        "evaluation": session.evaluation
    }
