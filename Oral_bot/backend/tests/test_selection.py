import json
import random
from pathlib import Path

from services.question_selector import adaptive_question_limit, select_questions
from services.session_manager import SessionManager

BACKEND_DIR = Path(__file__).resolve().parent.parent
BANK = json.loads(
    (BACKEND_DIR / "data" / "filtered_question_bank.json").read_text(encoding="utf-8")
)


def topics_for(chapter_no):
    return sorted({q["topic"] for q in BANK if q["chapter_no"] == chapter_no})


def all_chapters():
    return sorted({q["chapter_no"] for q in BANK})


def all_topics():
    return sorted({q["topic"] for q in BANK})


def select(chapters, topics, limit=None, seed=7):
    return select_questions(
        BANK,
        chapters,
        topics,
        limit=limit,
        rng=random.Random(seed),
    )


def assert_no_repeated_concepts(selected):
    concepts = [q["concept"] for q in selected]
    ids = [q["id"] for q in selected]
    assert len(concepts) == len(set(concepts))
    assert len(ids) == len(set(ids))


def test_bank_is_fully_tagged_and_concepts_stay_within_one_topic():
    assert len(BANK) == 81
    assert all(q.get("concept") for q in BANK)

    concept_topic = {}
    for q in BANK:
        key = (q["chapter_no"], q["topic"])
        assert concept_topic.setdefault(q["concept"], key) == key


def test_adaptive_limit_examples():
    assert adaptive_question_limit(0, 0) == 0
    assert adaptive_question_limit(1, 6) == 6
    assert adaptive_question_limit(1, 11) == 8
    assert adaptive_question_limit(5, 13) == 10
    assert adaptive_question_limit(6, 28) == 12
    assert adaptive_question_limit(15, 59) == 20
    assert adaptive_question_limit(25, 100) == 25


def test_chapter_1_all_topics_is_balanced():
    selected = select([1], topics_for(1))

    assert len(selected) == 10
    assert {q["topic"] for q in selected} == set(topics_for(1))
    assert {q["chapter_no"] for q in selected} == {1}
    assert_no_repeated_concepts(selected)


def test_chapter_2_all_topics_is_balanced():
    selected = select([2], topics_for(2))

    assert len(selected) == 10
    assert {q["topic"] for q in selected} == set(topics_for(2))
    assert {q["chapter_no"] for q in selected} == {2}
    assert_no_repeated_concepts(selected)


def test_all_chapters_cover_every_topic():
    selected = select(all_chapters(), all_topics())

    assert len(selected) == 20
    assert {q["topic"] for q in selected} == set(all_topics())
    assert_no_repeated_concepts(selected)


def test_single_small_topic_is_capped_by_its_concepts():
    topics = topics_for(4)
    selected = select([4], topics)

    assert len(selected) == 6
    assert {q["topic"] for q in selected} == set(topics)
    assert_no_repeated_concepts(selected)


def test_single_large_topic_uses_the_minimum_eight():
    topic = "RESISTANCE & RESISTIVITY"
    selected = select([2], [topic])

    assert len(selected) == 8
    assert {q["topic"] for q in selected} == {topic}
    assert_no_repeated_concepts(selected)


def test_explicit_limit_cannot_drop_a_selected_topic():
    selected = select([1], topics_for(1), limit=1)

    assert len(selected) == len(topics_for(1))
    assert {q["topic"] for q in selected} == set(topics_for(1))
    assert_no_repeated_concepts(selected)


def test_unknown_selection_returns_nothing():
    assert select([99], ["not a topic"]) == []


def test_seeded_selection_is_reproducible():
    first = select([1], topics_for(1), seed=42)
    second = select([1], topics_for(1), seed=42)

    assert [q["id"] for q in first] == [q["id"] for q in second]


def test_every_chapter_selection_is_concept_unique():
    for chapter_no in all_chapters():
        selected = select([chapter_no], topics_for(chapter_no))

        assert selected
        assert_no_repeated_concepts(selected)


def test_session_manager_builds_a_balanced_session():
    session = SessionManager().create_session(BANK, [1], topics_for(1))

    assert len(session.questions) == 10
    assert_no_repeated_concepts(session.questions)

    current = session.get_current_question()
    assert current["id"] == session.questions[0]["id"]
    assert "answer" not in current


def test_session_manager_keeps_topic_coverage_with_a_small_override():
    session = SessionManager().create_session(
        BANK,
        [1],
        topics_for(1),
        question_count=1,
    )

    assert len(session.questions) == len(topics_for(1))
    assert {q["topic"] for q in session.questions} == set(topics_for(1))


def test_session_manager_returns_empty_for_unknown_selection():
    session = SessionManager().create_session(BANK, [99], ["not a topic"])

    assert session.questions == []
