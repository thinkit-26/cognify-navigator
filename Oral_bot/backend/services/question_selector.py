"""Build a balanced, non-repeating question set for a viva.

The bank groups questions by ``concept``: two questions with the same slug are
variants of the same idea and must never appear in the same test. The selector
also guarantees topic coverage before it spends extra slots on depth, so a
large topic cannot crowd out a small one.

Length is adaptive: target 2 questions per selected topic, with a floor of 8
and a ceiling of 20, capped by the number of unique concepts available.

Topic coverage wins over the soft maximum: if a student selects 25 topics, the
test has at least 25 questions (one per topic) rather than silently dropping
topics. If the selection has fewer unique concepts than the target, the test is
shorter rather than repeating a concept.
"""

from __future__ import annotations

import random
from typing import Iterable

QUESTIONS_PER_TOPIC = 2
MIN_QUESTIONS = 8
MAX_QUESTIONS = 20

Question = dict


def adaptive_question_limit(topic_count: int, unique_concepts: int) -> int:
    """Return how many questions to ask for a selection of this size."""
    if topic_count <= 0 or unique_concepts <= 0:
        return 0

    target = max(MIN_QUESTIONS, min(MAX_QUESTIONS, QUESTIONS_PER_TOPIC * topic_count))

    # Every selected topic must be represented, even when that pushes the test
    # past the soft maximum. The unique-concept cap still prevents repeats.
    return min(unique_concepts, max(topic_count, target))


def _concept_of(question: Question) -> str:
    # New questions should always carry a concept. Falling back to a unique key
    # keeps an untagged question usable without treating it as a duplicate.
    return question.get("concept") or f"question:{question['id']}"


def _build_topic_buckets(
    questions: Iterable[Question],
    chapters: Iterable[int],
    topics: Iterable[str],
) -> dict[tuple[int, str], dict[str, list[Question]]]:
    chapter_set = set(chapters)
    topic_set = set(topics)

    buckets: dict[tuple[int, str], dict[str, list[Question]]] = {}
    for question in questions:
        if question["chapter_no"] not in chapter_set:
            continue
        if question["topic"] not in topic_set:
            continue

        key = (question["chapter_no"], question["topic"])
        concept = _concept_of(question)
        buckets.setdefault(key, {}).setdefault(concept, []).append(question)

    return buckets


def select_questions(
    questions: Iterable[Question],
    chapters: Iterable[int],
    topics: Iterable[str],
    limit: int | None = None,
    rng: random.Random | None = None,
) -> list[Question]:
    """Select a balanced, concept-unique set of questions.

    ``limit`` is optional; when omitted the adaptive length is used. An explicit
    limit is still raised to the topic count when possible, because every
    selected topic is guaranteed a question.
    """
    rng = rng or random.Random()

    if limit is not None and int(limit) <= 0:
        return []

    buckets = _build_topic_buckets(questions, chapters, topics)
    if not buckets:
        return []

    topic_count = len(buckets)
    unique_concepts = sum(len(concepts) for concepts in buckets.values())

    if limit is None:
        target = adaptive_question_limit(topic_count, unique_concepts)
    else:
        target = max(1, min(int(limit), unique_concepts))
        # Topic coverage is a product guarantee, not a preference.
        target = max(target, min(topic_count, unique_concepts))

    if target <= 0:
        return []

    # One shuffled queue of concept groups per topic. Each group holds the
    # variants of one concept; we take at most one question from each group.
    queues: dict[tuple[int, str], list[list[Question]]] = {}
    for key, concept_map in buckets.items():
        groups = list(concept_map.values())
        rng.shuffle(groups)
        for group in groups:
            rng.shuffle(group)
        queues[key] = groups

    cursors = {key: 0 for key in queues}
    topic_keys = list(queues.keys())
    selected: list[Question] = []

    # Phase 1: one question from every topic.
    order = topic_keys[:]
    rng.shuffle(order)
    for key in order:
        if len(selected) >= target:
            break
        if cursors[key] < len(queues[key]):
            selected.append(queues[key][cursors[key]][0])
            cursors[key] += 1

    # Phase 2: round-robin depth, one new concept per topic per pass.
    while len(selected) < target:
        added = False
        order = topic_keys[:]
        rng.shuffle(order)
        for key in order:
            if len(selected) >= target:
                break
            if cursors[key] < len(queues[key]):
                selected.append(queues[key][cursors[key]][0])
                cursors[key] += 1
                added = True
        if not added:
            break

    # A random order keeps repeat attempts from feeling like the same paper.
    rng.shuffle(selected)
    return selected
