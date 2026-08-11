import os
import json
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ClientError, ServerError

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found.")

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.5-flash"

EVALUATION_SCHEMA = {
    "type": "object",
    "properties": {
        "overall_score": {
            "type": "integer",
            "description": "Overall score out of 100 across all questions",
        },
        "overall_feedback": {
            "type": "string",
            "description": "2-4 sentence summary of the student's performance",
        },
        "per_question": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question_id": {"type": "integer"},
                    "score": {
                        "type": "integer",
                        "description": "Score out of 10 for this answer",
                    },
                    "feedback": {
                        "type": "string",
                        "description": "1-2 sentence feedback on this specific answer",
                    },
                },
                "required": ["question_id", "score", "feedback"],
            },
        },
    },
    "required": ["overall_score", "overall_feedback", "per_question"],
}


def _build_prompt(answers: list[dict]) -> str:
    lines = [
        "You are evaluating a student's oral viva (spoken exam) transcript.",
        "For each question below, compare the student's spoken answer against the expected answer.",
        "The student's answer was transcribed from speech, so ignore minor grammar, punctuation, "
        "and phrasing differences that come from speaking rather than writing. Judge on conceptual "
        "correctness and completeness, not wording.",
        "",
    ]

    for item in answers:
        lines.append(f"Question ID: {item['question_id']}")
        lines.append(f"Question: {item['question']}")
        lines.append(f"Expected answer: {item['correct_answer']}")
        lines.append(f"Student's spoken answer: {item['student_answer']}")
        lines.append("")

    return "\n".join(lines)


def evaluate_session(answers: list[dict], max_retries: int = 4) -> dict:
    """
    Raw Gemini call. Returns {overall_score, overall_feedback, per_question}.
    Retries with exponential backoff on transient errors (rate limiting,
    server overload) since these are common and usually resolve within
    seconds to tens of seconds.
    """

    prompt = _build_prompt(answers)

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=EVALUATION_SCHEMA,
                ),
            )
            return json.loads(response.text)

        except (ClientError, ServerError) as e:
            status = getattr(e, "code", None)
            is_retryable = (
                status in (429, 503)
                or "UNAVAILABLE" in str(e)
                or "RESOURCE_EXHAUSTED" in str(e)
            )

            if is_retryable and attempt < max_retries - 1:
                wait_time = 3 * (2 ** attempt)  # 3s, 6s, 12s, 24s
                time.sleep(wait_time)
                continue

            raise


def build_final_evaluation(answers: list[dict], raw_eval: dict) -> dict:
    """
    Merges Gemini's per-question scores with the actual question text
    and the student's transcribed answer from the session, and computes
    correct_count/accuracy so the frontend doesn't have to.
    """

    score_lookup = {
        pq["question_id"]: pq for pq in raw_eval.get("per_question", [])
    }

    questions = []
    correct_count = 0
    correct_scores = []

    for ans in answers:
        qid = ans["question_id"]
        pq = score_lookup.get(qid, {"score": 0, "feedback": "No evaluation available"})
        score = pq.get("score", 0)
        is_correct = score >= 7

        if is_correct:
            correct_count += 1
            correct_scores.append(score)

        questions.append({
            "question_id": qid,
            "question": ans["question"],
            "student_answer": ans["student_answer"],
            "score": score,
            "is_correct": is_correct,
            "feedback": pq.get("feedback", ""),
        })

    total = len(answers)
    accuracy_of_correct = (
        (sum(correct_scores) / len(correct_scores)) * 10
        if correct_scores else 0
    )

    return {
        "overall_score": raw_eval.get("overall_score", 0),
        "overall_feedback": raw_eval.get("overall_feedback", ""),
        "total_questions": total,
        "correct_count": correct_count,
        "accuracy_of_correct": round(accuracy_of_correct, 1),
        "questions": questions,
    }