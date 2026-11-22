import io
import os
import time

os.environ.setdefault("VIVA_TOKEN_SECRET", "test-secret")
os.environ.setdefault("GEMINI_API_KEY", "x")
os.environ.setdefault("DEEPGRAM_API_KEY", "x")

import pytest
from docx import Document

from services import question_extractor as qe

A = qe.ARROW

TOC = [
    "CHAPTER 1 – CHEMICAL REACTION & EQUATIONS\nA. PREREQUISITES\nB. BALANCING",
    "CHAPTER 2 – ELECTRICITY\nA. BEFORE OHM'S LAW\nB. OHM'S LAW",
    "CHAPTER 3 – LIGHT\nA. INTRODUCTION",
]


def body(heading: str, n: int = 1) -> str:
    qs = "".join(f"\n{A}\nQuestion {i}?\nAnswer {i}.\n" for i in range(n))
    return f"DATE -\nCOGNIFY\nSCIENCE – X PART 1\n7\n{heading}\nINSIGHTS\n{qs}"


# chapter 1 has a heading, chapter 2 and 3 do not: they only restart the topic letters at "A."
BOOK = TOC + [
    body("CHAPTER 1 – CHEMICAL REACTIONS & EQUATIONS\nTOPIC B. BALANCING - INSIGHTS"),
    body("C. REDOX REACTION"),
    "A diagram page with no questions",
    body("A. BEFORE OHM'S LAW"),
    body("B. OHM'S LAW"),
    body("A.  Intro to light"),
]


def test_toc_and_state_tracking_without_chapter_headings():
    arrows = [qe.count_arrows(p) for p in BOOK]
    assert arrows == [0, 0, 0, 1, 1, 0, 1, 1, 1]
    assert qe.toc_chapters(BOOK, arrows) == {1: "CHEMICAL REACTION & EQUATIONS", 2: "ELECTRICITY", 3: "LIGHT"}

    starts, marked = qe.states_at_page_starts(BOOK, arrows)
    assert (starts[4].chapter_no, starts[4].topic) == (1, "BALANCING - INSIGHTS")
    assert (starts[6].chapter_no, starts[6].topic) == (1, "REDOX REACTION")
    assert (starts[7].chapter_no, starts[7].topic) == (2, "BEFORE OHM'S LAW")  # "A." again: chapter 2 began
    assert (starts[8].chapter_no, starts[8].topic) == (2, "OHM'S LAW")
    assert "CHAPTER 2 – ELECTRICITY" in marked[6]  # the missing heading was written into the page
    assert "CHAPTER 3 – LIGHT" in marked[8]
    assert "CHAPTER 2" not in marked[0] + marked[2]  # contents pages are left alone


def test_chunks_skip_pages_without_questions_and_drop_running_headers():
    chunks = qe.make_chunks(BOOK, pages_per_chunk=2)
    assert [(c.first, c.last) for c in chunks] == [(3, 4), (6, 7), (8, 8)]
    assert "COGNIFY" not in chunks[0].text and "DATE -" not in chunks[0].text
    assert "[NEXT PAGE" in chunks[0].text  # the page after a chunk can finish an answer


def test_booklet_without_arrow_glyph_reads_every_text_page():
    pages = ["Q1 What is x?\nA1 y", "", "Q2 What is z?\nA2 w"]
    assert [(c.first, c.last) for c in qe.make_chunks(pages)] == [(0, 2)]


def test_scanned_pdf_gets_page_images_instead_of_text():
    chunks = qe.make_chunks(["", "", "", ""], pdf=b"%PDF", pages_per_chunk=3)
    assert [(c.first, c.last, c.scanned) for c in chunks] == [(0, 2, True), (3, 3, True)]


BANK = [{"id": 1, "chapter_no": 2, "chapter": "ELECTRICITY", "topic": "OHM'S LAW", "concept": "ch2.ohm", "question": "What is Ohm's law?", "answer": "a"}]


def item(**kw):
    base = {"chapter_no": 2, "chapter": "Electricity", "topic": "B. OHM'S LAW", "concept": "Ohm Law!", "question": "Why?", "answer": "Ans: Because.", "source": "cbse", "diagram_required": 0}
    return {**base, **kw}


def test_normalise_cleans_names_flags_duplicates_and_drops_repeats():
    out = qe.normalise(
        [
            item(question="  Why   is it so? [NCERT]  "),
            item(question="why is it so?"),  # repeat of the first
            item(question="What is Ohm's law?"),  # already in the bank
            item(topic="TOPIC C - RESISTANCE", question="Third?", concept="", source="other"),
            item(chapter_no=0, question="No chapter"),
            item(question="  "),
        ],
        BANK,
    )
    assert [q["question"] for q in out] == ["Why is it so?", "What is Ohm's law?", "Third?"]
    first = out[0]
    assert first["chapter"] == "ELECTRICITY"  # the bank's spelling wins over the booklet's
    assert first["topic"] == "OHM'S LAW" and first["concept"] == "ch2.ohm-law" and first["answer"] == "Because."
    assert first["source"] == "CBSE" and first["diagram_required"] is False and first["duplicate"] is False
    assert out[1]["duplicate"] is True
    assert out[2]["topic"] == "RESISTANCE" and out[2]["concept"] is None and out[2]["source"] == ""


def test_normalise_uses_fallback_chapter_when_model_gives_none():
    out = qe.normalise([item(chapter_no=0, chapter="")], [], qe.State(7, "CARBON"))
    assert (out[0]["chapter_no"], out[0]["chapter"]) == (7, "CARBON")


def wait(job):
    for _ in range(200):
        if job.status != "running":
            return job
        time.sleep(0.02)
    raise AssertionError("job did not finish")


def pdf_bytes(pages):
    import pymupdf

    doc = pymupdf.open()
    for text in pages:
        # enough text on the first page that the file is not mistaken for a scan
        doc.new_page().insert_text((72, 72), (text + " filler text" * 12) if text else "")
    return doc.tobytes()


def test_job_reads_chunks_in_parallel_and_merges():
    seen = []

    def generate(prompt, pdf):
        seen.append(prompt)
        n = len(seen)
        return {"questions": [item(question=f"Question number {n}?")]}

    data = pdf_bytes([f"{A}\nQ?\nA." if i % 2 == 0 else "" for i in range(12)])
    job = wait(qe.start_extraction(data, "b.pdf", "u1", BANK, None, generate))
    assert job.status == "done" and job.done == job.total == len(seen) > 1
    assert len(job.questions) == job.total  # one per chunk, all kept
    assert qe.get_job(job.id, "u1") is job and qe.get_job(job.id, "someone-else") is None


def test_job_reports_failed_chunks_but_keeps_the_rest():
    def generate(prompt, pdf):
        if "[PAGE 1]" in prompt:
            raise RuntimeError("boom")
        return {"questions": [item(question="Survivor?")]}

    pages = [f"{A}\nQ?\nA."] * 7  # two chunks of five pages and two
    job = wait(qe.start_extraction(pdf_bytes(pages), "b.pdf", "u", [], None, generate))
    assert job.status == "done" and [q["question"] for q in job.questions] == ["Survivor?"]
    assert job.warnings == ["Pages 1 to 5 could not be read."]


def test_job_errors_when_nothing_could_be_read():
    job = wait(qe.start_extraction(pdf_bytes([f"{A}\nQ?\nA."]), "b.pdf", "u", [], None, lambda p, pdf: 1 / 0))
    assert job.status == "error" and "could not be read" in job.error
    job = wait(qe.start_extraction(pdf_bytes([f"{A}\nQ?\nA."]), "b.pdf", "u", [], None, lambda p, pdf: {"questions": []}))
    assert job.error == "No questions were found in that file."


def make_docx(*lines):
    doc = Document()
    for line in lines:
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_word_files_are_read_and_other_types_rejected():
    job = wait(qe.start_extraction(make_docx("Q1 hello", "A1 world"), "p.docx", "u", [], qe.State(2, "ELECTRICITY"), lambda p, pdf: {"questions": [item()]}))
    assert job.status == "done" and "Q1 hello" in qe.docx_text(make_docx("Q1 hello"))
    with pytest.raises(ValueError):
        qe.start_extraction(b"x", "p.txt", "u", [], None)
    with pytest.raises(ValueError):
        qe.start_extraction(make_docx(), "p.docx", "u", [], None)
