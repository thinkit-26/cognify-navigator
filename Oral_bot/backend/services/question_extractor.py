"""Turn an uploaded viva paper (PDF or Word) into draft questions for an admin to review.

Nothing is saved here: the admin page shows the draft, the admin fixes topics and answers, then saves.
"""

from __future__ import annotations

import io
import json
import re

MAX_BYTES = 15 * 1024 * 1024
MAX_QUESTIONS = 300

ITEM_SCHEMA = {
    "type": "object",
    "properties": {
        "topic": {"type": "string", "description": "Short topic name this question belongs to"},
        "concept": {"type": "string", "description": "Slug naming the idea tested, e.g. ch2.ohms-law"},
        "question": {"type": "string"},
        "answer": {"type": "string", "description": "Model answer exactly as in the paper; empty if the paper has none"},
        "diagram_required": {"type": "boolean"},
    },
    "required": ["topic", "concept", "question", "answer", "diagram_required"],
}
SCHEMA = {"type": "object", "properties": {"questions": {"type": "array", "items": ITEM_SCHEMA}}, "required": ["questions"]}


def docx_text(data: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(data))
    parts = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            parts.append(" | ".join(cell.text.strip() for cell in row.cells))
    return "\n".join(parts)


def build_prompt(chapter_no: int, chapter: str, known_topics: list[str]) -> str:
    topics = "; ".join(known_topics) if known_topics else "none yet"
    return (
        "You are preparing questions for an oral viva (spoken exam) question bank.\n"
        f"The attached paper is for chapter {chapter_no}: {chapter}.\n"
        "Extract every question in the paper with its model answer. Do not invent questions or answers: "
        "if the paper gives no answer for a question, leave answer empty.\n"
        "Group the questions by topic. Use the topic headings in the paper when there are any. "
        f"Topics already in the bank for this chapter: {topics}. Reuse one of those names exactly when it fits.\n"
        f"For concept, write a short lowercase slug prefixed with ch{chapter_no}. naming the idea being tested; "
        "questions that test the same idea in different words must share the same slug.\n"
        "Set diagram_required true only if answering needs a diagram or figure."
    )


def normalise(items: list[dict], chapter_no: int) -> list[dict]:
    """Clean what the model returned: trimmed text, no blank questions, a topic on every row, a sane cap."""
    out: list[dict] = []
    for item in items:
        question = re.sub(r"\s+", " ", str(item.get("question", ""))).strip()
        if not question:
            continue
        concept = re.sub(r"[^a-z0-9.\-]+", "-", str(item.get("concept", "")).strip().lower()).strip("-")
        out.append(
            {
                "topic": re.sub(r"\s+", " ", str(item.get("topic", ""))).strip() or "GENERAL",
                "concept": concept if concept.startswith(f"ch{chapter_no}.") else (f"ch{chapter_no}.{concept}" if concept else None),
                "question": question[:2000],
                "answer": str(item.get("answer", "")).strip()[:5000],
                "diagram_required": bool(item.get("diagram_required", False)),
            }
        )
    return out[:MAX_QUESTIONS]


def _call_gemini(prompt: str, pdf: bytes | None) -> dict:
    from google.genai import types

    from services.gemini_evaluator import MODEL, client

    parts: list = [prompt]
    if pdf is not None:
        parts.insert(0, types.Part.from_bytes(data=pdf, mime_type="application/pdf"))
    response = client.models.generate_content(
        model=MODEL,
        contents=parts,
        config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=SCHEMA),
    )
    return json.loads(response.text)


def extract_questions(
    data: bytes,
    filename: str,
    chapter_no: int,
    chapter: str,
    known_topics: list[str],
    generate=_call_gemini,
) -> list[dict]:
    name = filename.lower()
    prompt = build_prompt(chapter_no, chapter, known_topics)

    if name.endswith(".pdf"):
        raw = generate(prompt, data)
    elif name.endswith(".docx"):
        text = docx_text(data)
        if not text.strip():
            raise ValueError("The Word file has no text in it.")
        raw = generate(prompt + "\n\nPAPER TEXT:\n" + text, None)
    else:
        raise ValueError("Upload a PDF or a .docx Word file.")

    return normalise(raw.get("questions", []), chapter_no)
