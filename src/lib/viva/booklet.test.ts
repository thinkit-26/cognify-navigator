import assert from "node:assert/strict";
import { test } from "node:test";
import { ARROW as A, countArrows, makeChunks, normalise, splitText, statesAtPageStarts, tocChapters, type BankRow } from "./booklet.ts";

const lines = (text: string) => text.split("\n");
const TOC = [
  "CHAPTER 1 – CHEMICAL REACTION & EQUATIONS\nA. PREREQUISITES\nB. BALANCING",
  "CHAPTER 2 – ELECTRICITY\nA. BEFORE OHM'S LAW\nB. OHM'S LAW",
  "CHAPTER 3 – LIGHT\nA. INTRODUCTION",
].map(lines);

const body = (heading: string) => lines(`DATE - COGNIFY\nSCIENCE – X PART 1 7\n${heading}\nINSIGHTS\n${A} Question?\nAnswer.`);

// chapter 1 has a heading, chapters 2 and 3 do not: they only restart the topic letters at "A."
const BOOK = [
  ...TOC,
  body("CHAPTER 1 – CHEMICAL REACTIONS & EQUATIONS\nTOPIC B. BALANCING - INSIGHTS"),
  body("C. REDOX REACTION"),
  lines("A diagram page with no questions"),
  body("A. BEFORE OHM'S LAW"),
  body("B. OHM'S LAW"),
  body("A.  Intro to light"),
];

test("contents pages and state tracking, including chapters with no heading of their own", () => {
  const arrows = BOOK.map(countArrows);
  assert.deepEqual(arrows, [0, 0, 0, 1, 1, 0, 1, 1, 1]);
  assert.deepEqual([...tocChapters(BOOK, arrows)], [[1, "CHEMICAL REACTION & EQUATIONS"], [2, "ELECTRICITY"], [3, "LIGHT"]]);

  const { starts, marked } = statesAtPageStarts(BOOK, arrows);
  assert.deepEqual([starts[4].chapterNo, starts[4].topic], [1, "BALANCING - INSIGHTS"]);
  assert.deepEqual([starts[6].chapterNo, starts[6].topic], [1, "REDOX REACTION"]);
  assert.deepEqual([starts[7].chapterNo, starts[7].topic], [2, "BEFORE OHM'S LAW"]); // "A." again: chapter 2 began
  assert.deepEqual([starts[8].chapterNo, starts[8].topic], [2, "OHM'S LAW"]);
  assert.ok(marked[6].includes("CHAPTER 2 – ELECTRICITY")); // the missing heading was written into the page
  assert.ok(marked[8].includes("CHAPTER 3 – LIGHT"));
  assert.ok(!marked[0].concat(marked[2]).some((l) => l.includes("CHAPTER 2"))); // contents pages are left alone
});

test("chunks skip pages without questions and drop the running headers", () => {
  const chunks = makeChunks(BOOK, 2);
  assert.deepEqual(chunks.map((c) => [c.first, c.last]), [[3, 4], [6, 7], [8, 8]]);
  assert.ok(!chunks[0].text.includes("COGNIFY") && !chunks[0].text.includes("DATE -"));
  assert.ok(chunks[0].text.includes("[NEXT PAGE")); // the page after a chunk can finish an answer
});

test("a booklet without the arrow glyph reads every page with text; a scan is refused", () => {
  const pages = [lines("Q1 What is x?\nA1 y".repeat(10)), [""], lines("Q2 What is z?\nA2 w".repeat(10))];
  assert.deepEqual(makeChunks(pages).map((c) => [c.first, c.last]), [[0, 2]]);
  assert.throws(() => makeChunks([[""], [""]]), /Scanned/);
});

test("Word text is cut into pseudo-pages", () => {
  assert.equal(splitText("a\n".repeat(10), 7).length, 3);
});

const BANK: BankRow[] = [{ chapter_no: 2, chapter: "ELECTRICITY", topic: "OHM'S LAW", concept: "ch2.ohm", question: "What is Ohm's law?" }];
const item = (over: object = {}) => ({ chapter_no: 2, chapter: "Electricity", topic: "B. OHM'S LAW", concept: "Ohm Law!", question: "Why?", answer: "Ans: Because.", source: "cbse", diagram_required: false, ...over });

test("normalise cleans names, flags bank duplicates and drops repeats", () => {
  const out = normalise(
    [
      item({ question: "  Why   is it so? [NCERT]  " }),
      item({ question: "why is it so?" }), // repeat of the first
      item({ question: "What is Ohm's law?" }), // already in the bank
      item({ topic: "TOPIC C - RESISTANCE", question: "Third?", concept: "", source: "other" }),
      item({ chapter_no: 0, question: "No chapter" }),
      item({ question: "  " }),
    ],
    BANK,
  );
  assert.deepEqual(out.map((q) => q.question), ["Why is it so?", "What is Ohm's law?", "Third?"]);
  const first = out[0];
  assert.equal(first.chapter, "ELECTRICITY"); // the bank's spelling wins over the booklet's
  assert.deepEqual([first.topic, first.concept, first.answer], ["OHM'S LAW", "ch2.ohm-law", "Because."]);
  assert.deepEqual([first.source, first.diagram_required, first.duplicate], ["CBSE", false, false]);
  assert.equal(out[1].duplicate, true);
  assert.deepEqual([out[2].topic, out[2].concept, out[2].source], ["RESISTANCE", null, ""]);
});

test("normalise falls back to the chapter the admin chose when the model gives none", () => {
  const out = normalise([item({ chapter_no: 0, chapter: "" })], [], { chapterNo: 7, chapter: "CARBON", topic: "" });
  assert.deepEqual([out[0].chapter_no, out[0].chapter], [7, "CARBON"]);
});
