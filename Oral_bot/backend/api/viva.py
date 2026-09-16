from fastapi import APIRouter

from core.loader import load_questions
from models.schemas import VivaRequest, AnswerRequest
from services.session_manager import session_manager
from services.gemini_evaluator import evaluate_session, build_final_evaluation

router = APIRouter(
    prefix="/viva",
    tags=["Viva"]
)


@router.post("/start")
def start_viva(request: VivaRequest):

    questions = load_questions()

    session = session_manager.create_session(
        questions,
        request.chapters,
        request.topics
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
def submit_answer(request: AnswerRequest):

    session = session_manager.get_session(request.session_id)

    if session is None:
        return {"error": "Session not found"}

    session.submit_answer(request.answer)

    if session.is_completed():

        try:
            raw_eval = evaluate_session(session.answers)
            final_eval = build_final_evaluation(session.answers, raw_eval)
            session.set_evaluation(final_eval)
        except Exception as e:
            session.set_evaluation({"error": f"Evaluation failed: {str(e)}"})

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

    session = session_manager.get_session(session_id)

    if session is None:
        return {"error": "Session not found"}

    if session.evaluation is None:
        return {"status": "pending"}

    return {
        "status": "ready",
        "evaluation": session.evaluation
    }