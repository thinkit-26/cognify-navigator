"""Turn an uploaded viva booklet (PDF or Word) into draft questions for an admin to review.

Built for the Cognify "INSIGHTS" booklets: chapters start with "CHAPTER 2 - ELECTRICITY", topics with
"A. BEFORE OHM'S LAW", and every question is a bullet (the arrow glyph) followed by its answer, with an
optional [NCERT] / [CBSE] tag. A booklet is 100+ pages, so the work is split into small chunks that are
read in parallel, and the chapter and topic in force at the start of each chunk are found locally.

Nothing is saved here: the admin page shows the draft, the admin fixes it, then saves.
"""

from __future__ import annotations

import io
import json
import logging
import re
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

from core.logging import get_logger, log_event, redact

MAX_BYTES = 25 * 1024 * 1024
MAX_QUESTIONS = 1000
CHUNK_PAGES = 5  # pages per Gemini call: small enough to finish fast and never hit the output limit
WORKERS = 4
JOB_TTL_SECONDS = 3600

ARROW = "ð"  # the bullet glyph (Wingdings arrow) the booklets use for a question
CHAPTER_RE = re.compile(r"^CHAPTER\s*(\d+)\s*[–—-]\s*(\S.*?)\s*$", re.I)
# The name must start with letters: lines like "I.<1" in a magnification table are not headings.
TOPIC_RE = re.compile(r"^(?:TOPIC\s+)?([A-Z])\s*[.\-–]\s*([A-Za-z][^\n]{2,}?)\s*$")
TOPIC_PREFIX_RE = re.compile(r"^(?:TOPIC\s+)?[A-Z]\s*[.\-–]\s+", re.I)
# Lines printed on every page of the booklets; they carry nothing and cost tokens.
RUNNING_HEADERS = {"DATE -", "DATE –", "COGNIFY", "SCIENCE – X PART 1", "SCIENCE - X PART 1"}
SOURCES = {"NCERT", "CBSE"}

log = get_logger("extractor")

ITEM_SCHEMA = {
    "type": "object",
    "properties": {
        "chapter_no": {"type": "integer"},
        "chapter": {"type": "string"},
        "topic": {"type": "string"},
        "concept": {"type": "string", "description": "Slug for the idea tested, e.g. ch2.ohms-law"},
        "question": {"type": "string"},
        "answer": {"type": "string", "description": "The model answer exactly as printed; empty if there is none"},
        "source": {"type": "string", "description": "NCERT or CBSE if the question is tagged so, else empty"},
        "diagram_required": {"type": "boolean"},
    },
    "required": ["chapter_no", "chapter", "topic", "concept", "question", "answer", "source", "diagram_required"],
}
SCHEMA = {"type": "object", "properties": {"questions": {"type": "array", "items": ITEM_SCHEMA}}, "required": ["questions"]}


# ---------------------------------------------------------------- reading the file

def docx_text(data: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(data))
    parts = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            parts.append(" | ".join(cell.text.strip() for cell in row.cells))
    return "\n".join(parts)


def split_text(text: str, size: int = 6000) -> list[str]:
    """Pseudo-pages for a Word file, broken on line ends."""
    pages, current = [], ""
    for line in text.split("\n"):
        if current and len(current) + len(line) > size:
            pages.append(current)
            current = ""
        current += line + "\n"
    return pages + ([current] if current.strip() else [])


def pdf_pages(data: bytes) -> list[str]:
    import pymupdf

    with pymupdf.open(stream=data, filetype="pdf") as doc:
        return [page.get_text() for page in doc]


def pdf_slice(data: bytes, first: int, last: int) -> bytes:
    """Pages first..last (0-based, inclusive) as a small PDF, for scanned files with no text layer."""
    import pymupdf

    with pymupdf.open(stream=data, filetype="pdf") as src, pymupdf.open() as out:
        out.insert_pdf(src, from_page=first, to_page=min(last, len(src) - 1))
        return out.tobytes()


# ---------------------------------------------------------------- chapter / topic tracking

@dataclass
class State:
    chapter_no: int | None = None
    chapter: str = ""
    topic: str = ""
    letter: str = ""  # letter of the current topic heading: a fresh "A." after "C." means a new chapter began


def clean_heading(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def tidy_page(page: str) -> str:
    kept = [l.rstrip() for l in page.split("\n") if l.strip() not in RUNNING_HEADERS and not re.fullmatch(r"\d{1,3}", l.strip())]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(kept)).strip()


def count_arrows(page: str) -> int:
    return sum(1 for line in page.split("\n") if line.strip() == ARROW or line.strip().startswith(ARROW + " "))


def toc_chapters(pages: list[str], arrows: list[int]) -> dict[int, str]:
    """Chapter number to name from the contents pages (the ones with no questions on them), in book order."""
    found: dict[int, str] = {}
    for page, n_arrows in zip(pages, arrows):
        if n_arrows:
            continue
        for line in (l.strip() for l in page.split("\n")):
            m = CHAPTER_RE.match(line)
            if m:
                found.setdefault(int(m.group(1)), clean_heading(m.group(2)))
    return dict(sorted(found.items()))


def states_at_page_starts(pages: list[str], arrows: list[int]) -> tuple[list[State], list[str]]:
    """The chapter and topic in force at the top of each page, and the pages with chapter headings made explicit.

    Only pages that hold questions update the state: the contents pages at the front also contain
    "CHAPTER n" and "A. ..." lines and would otherwise leave the tracker in the wrong place. Some chapters
    have no heading of their own in the body, only a topic list that starts again at "A.". A restart moves on
    to the next chapter in the contents, and the heading is written into the page text so the reader sees it.
    """
    toc = toc_chapters(pages, arrows)
    current = State()
    starts: list[State] = []
    marked: list[str] = []
    for page, n_arrows in zip(pages, arrows):
        starts.append(State(current.chapter_no, current.chapter, current.topic, current.letter))
        if not n_arrows:
            marked.append(page)
            continue
        lines = page.split("\n")
        out: list[str] = []
        for line in lines:
            text = line.strip()
            m = CHAPTER_RE.match(text)
            if m:
                current = State(int(m.group(1)), clean_heading(m.group(2)))
            else:
                m = TOPIC_RE.match(text)
                if m:
                    letter = m.group(1).upper()
                    if letter == "A" and current.letter not in ("", "A"):
                        later = [n for n in toc if n > (current.chapter_no or 0)]
                        if later:
                            current = State(later[0], toc[later[0]])
                            out.append(f"CHAPTER {current.chapter_no} – {current.chapter}")
                    current.topic, current.letter = clean_heading(m.group(2)), letter
            out.append(line)
        marked.append("\n".join(out))
    return starts, marked


@dataclass
class Chunk:
    first: int  # 0-based page indexes, inclusive
    last: int
    text: str
    state: State
    scanned: bool = False


def make_chunks(pages: list[str], pdf: bytes | None = None, pages_per_chunk: int = CHUNK_PAGES) -> list[Chunk]:
    total_chars = sum(len(p.strip()) for p in pages)

    if pdf is not None and total_chars < 100:  # scanned: no text layer, so Gemini has to look at the pages
        return [
            Chunk(i, min(i + pages_per_chunk, len(pages)) - 1, "", State(), scanned=True)
            for i in range(0, len(pages), pages_per_chunk)
        ]

    arrows = [count_arrows(p) for p in pages]
    if not any(arrows):  # a booklet without the arrow glyph: read every page that has text
        arrows = [1 if p.strip() else 0 for p in pages]
    starts, pages = states_at_page_starts(pages, arrows)

    chunks: list[Chunk] = []
    i = 0
    while i < len(pages):
        if not arrows[i]:
            i += 1
            continue
        last = min(i + pages_per_chunk, len(pages)) - 1
        text = "\n".join(f"[PAGE {n + 1}]\n{tidy_page(pages[n])}" for n in range(i, last + 1))
        if last + 1 < len(pages):  # an answer can run onto the next page
            text += f"\n[NEXT PAGE, only to finish an answer that runs over]\n{tidy_page(pages[last + 1])[:1200]}"
        chunks.append(Chunk(i, last, text, starts[i]))
        i = last + 1
    return chunks


# ---------------------------------------------------------------- Gemini

def build_prompt(chunk: Chunk, known_topics: list[str], known_concepts: list[str], fallback: State | None) -> str:
    state = chunk.state if chunk.state.chapter_no else (fallback or State())
    where = "unknown"
    if state.chapter_no:
        where = f"chapter {state.chapter_no} {state.chapter}" + (f", topic {state.topic}" if state.topic else "")
    return (
        "You are preparing an oral viva question bank from a printed study booklet.\n"
        "Each question in the booklet is a bullet (shown as the glyph 'ð') followed by its model answer. "
        "A question may carry a [NCERT] or [CBSE] tag. The glyph 'è' marks notes and points to remember: not questions.\n"
        "Return every question on the pages below, in order, with its answer copied exactly as printed (do not shorten, "
        "paraphrase or correct it). Drop the tag from the question and put it in source. Drop a leading 'Ans:' from the answer. "
        "If a table is the answer, write it out as plain text, row by row. If a bullet has an 'OR' alternative question, "
        "return each alternative as its own question with the same answer and the same concept.\n"
        "Skip anything that is not a question with an answer. If a page starts with answer text but no question, it "
        "continues the previous page: ignore it. Text after [NEXT PAGE] is only there to finish an answer.\n"
        f"These pages begin in: {where}. The chapter heading looks like 'CHAPTER 2 - ELECTRICITY' and a topic heading like "
        "'A. BEFORE OHM'S LAW' or 'TOPIC B. NAME'. Use the heading printed on the pages when there is one, otherwise the place above. "
        "Give the topic without its letter prefix, exactly as printed.\n"
        f"Topics already in the bank for this chapter (reuse the name exactly when it is the same topic): {'; '.join(known_topics) or 'none'}.\n"
        f"Concept slugs already used for this chapter: {'; '.join(known_concepts[:80]) or 'none'}.\n"
        "concept is a short lowercase slug starting with ch<chapter number>. that names the single idea the question tests; "
        "questions testing the same idea in different words must share a slug, and reuse an existing slug when it fits.\n"
        "Set diagram_required true only if answering needs a drawing or figure (for example 'draw a ray diagram').\n\n"
        + chunk.text
    )


def _call_gemini(prompt: str, pdf: bytes | None = None) -> dict:
    from google.genai import types

    from services.gemini_evaluator import MODEL, client

    parts: list = [prompt]
    if pdf is not None:
        parts.insert(0, types.Part.from_bytes(data=pdf, mime_type="application/pdf"))

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=parts,
                config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=SCHEMA),
            )
            return json.loads(response.text)
        except Exception as e:
            transient = any(code in str(e) for code in ("429", "503", "UNAVAILABLE", "RESOURCE_EXHAUSTED"))
            if not transient or attempt == 2:
                raise
            time.sleep(3 * 2**attempt)
    raise RuntimeError("unreachable")


# ---------------------------------------------------------------- cleaning

def norm_question(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def normalise(items: list[dict], bank: list[dict], fallback: State | None = None) -> list[dict]:
    """Tidy what the model returned: canonical chapter names, clean topics, no repeats, bank duplicates flagged."""
    bank_names = {q["chapter_no"]: q["chapter"] for q in bank}
    bank_questions = {norm_question(q["question"]) for q in bank}
    seen: set[str] = set()
    out: list[dict] = []

    for item in items:
        question = re.sub(r"\s+", " ", str(item.get("question", ""))).strip()
        question = re.sub(r"\s*\[(NCERT|CBSE)\]\s*$", "", question, flags=re.I).strip()
        key = norm_question(question)
        if not key or key in seen:
            continue

        try:
            chapter_no = int(item.get("chapter_no") or 0)
        except (TypeError, ValueError):
            chapter_no = 0
        if chapter_no <= 0 and fallback and fallback.chapter_no:
            chapter_no = fallback.chapter_no
        if chapter_no <= 0:
            continue
        chapter = bank_names.get(chapter_no) or clean_heading(str(item.get("chapter", ""))) or (fallback.chapter if fallback else "")
        if not chapter:
            continue

        seen.add(key)
        topic = TOPIC_PREFIX_RE.sub("", clean_heading(str(item.get("topic", "")))) or "GENERAL"
        slug = re.sub(r"[^a-z0-9.\-]+", "-", str(item.get("concept", "")).strip().lower()).strip("-")
        source = str(item.get("source", "")).strip().upper()
        answer = re.sub(r"^\s*ans\s*:\s*", "", str(item.get("answer", "")), flags=re.I).strip()

        out.append(
            {
                "chapter_no": chapter_no,
                "chapter": chapter,
                "topic": topic,
                "concept": slug if slug.startswith(f"ch{chapter_no}.") else (f"ch{chapter_no}.{slug}" if slug else None),
                "question": question[:2000],
                "answer": answer[:5000],
                "source": source if source in SOURCES else "",
                "diagram_required": bool(item.get("diagram_required", False)),
                "duplicate": key in bank_questions,
            }
        )
    return out[:MAX_QUESTIONS]


# ---------------------------------------------------------------- jobs

@dataclass
class Job:
    id: str
    user_id: str
    total: int = 0
    done: int = 0
    status: str = "running"  # running | done | error
    questions: list[dict] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    error: str = ""
    created: float = field(default_factory=time.time)


# shortcut: jobs live in this process's memory, which is right while the backend runs as one uvicorn
# process; move them to a Supabase table if it is ever run with several workers.
_jobs: dict[str, Job] = {}
_lock = threading.Lock()


def get_job(job_id: str, user_id: str) -> Job | None:
    with _lock:
        job = _jobs.get(job_id)
    return job if job and job.user_id == user_id else None


def _forget_old_jobs() -> None:
    cutoff = time.time() - JOB_TTL_SECONDS
    with _lock:
        for job_id in [j for j, job in _jobs.items() if job.created < cutoff]:
            del _jobs[job_id]


def read_chunks(data: bytes, filename: str) -> list[Chunk]:
    name = filename.lower()
    if name.endswith(".pdf"):
        return make_chunks(pdf_pages(data), pdf=data)
    if name.endswith(".docx"):
        text = docx_text(data)
        if not text.strip():
            raise ValueError("The Word file has no text in it.")
        return make_chunks(split_text(text))
    raise ValueError("Upload a PDF or a .docx Word file.")


def start_extraction(
    data: bytes,
    filename: str,
    user_id: str,
    bank: list[dict],
    fallback: State | None = None,
    generate=_call_gemini,
) -> Job:
    """Validate the file, then read it in the background. Poll get_job() for progress and the result."""
    chunks = read_chunks(data, filename)
    if not chunks:
        raise ValueError("No questions were found in that file.")

    _forget_old_jobs()
    job = Job(id=uuid.uuid4().hex, user_id=user_id, total=len(chunks))
    with _lock:
        _jobs[job.id] = job

    topics_by_chapter: dict[int, list[str]] = {}
    concepts_by_chapter: dict[int, list[str]] = {}
    for q in bank:
        topics = topics_by_chapter.setdefault(q["chapter_no"], [])
        if q["topic"] not in topics:
            topics.append(q["topic"])
        if q.get("concept"):
            concepts_by_chapter.setdefault(q["chapter_no"], []).append(q["concept"])

    def work(chunk: Chunk) -> list[dict]:
        state = chunk.state if chunk.state.chapter_no else (fallback or State())
        prompt = build_prompt(
            chunk,
            topics_by_chapter.get(state.chapter_no or 0, []),
            sorted(set(concepts_by_chapter.get(state.chapter_no or 0, []))),
            fallback,
        )
        pdf = pdf_slice(data, chunk.first, chunk.last) if chunk.scanned else None
        try:
            return generate(prompt, pdf).get("questions", [])
        except Exception as e:
            log_event(log, "chunk_failed", level=logging.ERROR, pages=f"{chunk.first + 1}-{chunk.last + 1}", error=redact(str(e)))
            with _lock:
                job.warnings.append(f"Pages {chunk.first + 1} to {chunk.last + 1} could not be read.")
            return []
        finally:
            with _lock:
                job.done += 1

    def run() -> None:
        try:
            with ThreadPoolExecutor(max_workers=WORKERS) as pool:
                results = list(pool.map(work, chunks))
            items = [item for chunk_items in results for item in chunk_items]
            job.questions = normalise(items, bank, fallback)
            if job.questions:
                job.status = "done"
            else:
                job.status = "error"
                job.error = "The paper could not be read. Try again." if job.warnings else "No questions were found in that file."
        except Exception as e:
            log_event(log, "extract_job_failed", level=logging.ERROR, error=redact(str(e)))
            job.status, job.error = "error", "The paper could not be read. Try again."

    threading.Thread(target=run, daemon=True).start()
    return job
