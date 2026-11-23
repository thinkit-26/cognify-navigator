// Reading a Cognify "INSIGHTS" booklet into draft viva questions: finding chapters and topics, cutting the
// pages into parts for the AI, and cleaning what comes back. Pure functions, no network, so they can be
// tested on their own. Built for booklets where chapters start with "CHAPTER 2 – ELECTRICITY", topics with
// "A. BEFORE OHM'S LAW", and every question is a bullet (the arrow glyph) followed by its answer.

export const ARROW = "ð"; // the bullet glyph (Wingdings arrow) the booklets use for a question
export const CHUNK_PAGES = 5; // pages per AI call: small enough to be quick and never hit the output limit
export const MAX_QUESTIONS = 1000;

const CHAPTER_RE = /^CHAPTER\s*(\d+)\s*[–—-]\s*(\S.*?)\s*$/i;
// The topic name must start with letters: lines like "I.<1" in a magnification table are not headings.
const TOPIC_RE = /^(?:TOPIC\s+)?([A-Z])\s*[.\-–]\s*([A-Za-z].{2,}?)\s*$/;
const TOPIC_PREFIX_RE = /^(?:TOPIC\s+)?[A-Z]\s*[.\-–]\s+/i;
// Lines printed on every page of the booklets; they carry nothing and cost tokens.
const RUNNING_HEADER_RE = /^(DATE\s*[-–].*|COGNIFY|SCIENCE\s*[-–]\s*X\s*PART\s*\d+.*|\d{1,3})$/i;
const SOURCES = new Set(["NCERT", "CBSE"]);

export interface Place {
  chapterNo: number | null;
  chapter: string;
  topic: string;
}

interface State extends Place {
  letter: string; // letter of the current topic heading: a fresh "A." after "C." means a new chapter began
}

export interface Chunk {
  first: number; // 0-based page indexes, inclusive
  last: number;
  text: string;
  place: Place; // the chapter and topic in force at the top of the chunk
}

export interface RawQuestion {
  chapter_no?: number;
  chapter?: string;
  topic?: string;
  concept?: string;
  question?: string;
  answer?: string;
  source?: string;
  diagram_required?: boolean;
}

export interface DraftQuestion {
  chapter_no: number;
  chapter: string;
  topic: string;
  concept: string | null;
  question: string;
  answer: string;
  source: string;
  diagram_required: boolean;
  duplicate: boolean; // already in the bank
}

export interface BankRow {
  chapter_no: number;
  chapter: string;
  topic: string;
  concept: string | null;
  question: string;
}

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

export const normQuestion = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function tidyPage(lines: string[]): string {
  const kept = lines.map((l) => l.trimEnd()).filter((l) => !RUNNING_HEADER_RE.test(l.trim()));
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function countArrows(lines: string[]): number {
  return lines.filter((l) => l.trim() === ARROW || l.trim().startsWith(ARROW + " ")).length;
}

/** Word files have no pages: cut the text into pseudo-pages on line ends. */
export function splitText(text: string, size = 6000): string[][] {
  const pages: string[][] = [];
  let current: string[] = [];
  let length = 0;
  for (const line of text.split("\n")) {
    if (current.length && length + line.length > size) {
      pages.push(current);
      current = [];
      length = 0;
    }
    current.push(line);
    length += line.length + 1;
  }
  if (current.some((l) => l.trim())) pages.push(current);
  return pages;
}

/** Chapter number to name from the contents pages (the ones with no questions on them), in book order. */
export function tocChapters(pages: string[][], arrows: number[]): Map<number, string> {
  const found = new Map<number, string>();
  pages.forEach((lines, i) => {
    if (arrows[i]) return;
    for (const line of lines) {
      const m = CHAPTER_RE.exec(line.trim());
      if (m && !found.has(Number(m[1]))) found.set(Number(m[1]), clean(m[2]));
    }
  });
  return new Map([...found].sort((a, b) => a[0] - b[0]));
}

/**
 * The chapter and topic in force at the top of each page, and the pages with chapter headings made explicit.
 *
 * Only pages that hold questions update the state: the contents pages at the front also contain "CHAPTER n"
 * and "A. ..." lines and would otherwise leave the tracker in the wrong place. Some chapters have no heading
 * of their own in the body, only a topic list that starts again at "A.". A restart moves on to the next
 * chapter in the contents, and the heading is written into the page text so the reader sees it.
 */
export function statesAtPageStarts(pages: string[][], arrows: number[]): { starts: Place[]; marked: string[][] } {
  const toc = tocChapters(pages, arrows);
  let current: State = { chapterNo: null, chapter: "", topic: "", letter: "" };
  const starts: Place[] = [];
  const marked: string[][] = [];

  pages.forEach((lines, i) => {
    starts.push({ chapterNo: current.chapterNo, chapter: current.chapter, topic: current.topic });
    if (!arrows[i]) {
      marked.push(lines);
      return;
    }
    const out: string[] = [];
    for (const line of lines) {
      const text = line.trim();
      const chapter = CHAPTER_RE.exec(text);
      if (chapter) {
        current = { chapterNo: Number(chapter[1]), chapter: clean(chapter[2]), topic: "", letter: "" };
      } else {
        const topic = TOPIC_RE.exec(text);
        if (topic) {
          const letter = topic[1].toUpperCase();
          if (letter === "A" && current.letter !== "" && current.letter !== "A") {
            const next = [...toc.keys()].find((n) => n > (current.chapterNo ?? 0));
            if (next !== undefined) {
              current = { chapterNo: next, chapter: toc.get(next)!, topic: "", letter: "" };
              out.push(`CHAPTER ${next} – ${current.chapter}`);
            }
          }
          current.topic = clean(topic[2]);
          current.letter = letter;
        }
      }
      out.push(line);
    }
    marked.push(out);
  });
  return { starts, marked };
}

/** Cuts a booklet into parts of CHUNK_PAGES pages, keeping only the stretches that have questions. */
export function makeChunks(pages: string[][], pagesPerChunk = CHUNK_PAGES): Chunk[] {
  if (pages.reduce((t, p) => t + p.join("").trim().length, 0) < 100) {
    throw new Error("There is no text in that file. Scanned booklets cannot be read yet.");
  }
  let arrows = pages.map(countArrows);
  if (!arrows.some(Boolean)) arrows = pages.map((p) => (p.join("").trim() ? 1 : 0)); // no arrow glyph: read every page with text

  const { starts, marked } = statesAtPageStarts(pages, arrows);
  const chunks: Chunk[] = [];
  for (let i = 0; i < pages.length; ) {
    if (!arrows[i]) {
      i++;
      continue;
    }
    const last = Math.min(i + pagesPerChunk, pages.length) - 1;
    let text = Array.from({ length: last - i + 1 }, (_, k) => `[PAGE ${i + k + 1}]\n${tidyPage(marked[i + k])}`).join("\n");
    if (last + 1 < pages.length) {
      // an answer can run onto the next page
      text += `\n[NEXT PAGE, only to finish an answer that runs over]\n${tidyPage(marked[last + 1]).slice(0, 1200)}`;
    }
    chunks.push({ first: i, last, text, place: starts[i] });
    i = last + 1;
  }
  return chunks;
}

export function buildPrompt(text: string, place: Place, knownTopics: string[], knownConcepts: string[]): string {
  const where = place.chapterNo ? `chapter ${place.chapterNo} ${place.chapter}${place.topic ? `, topic ${place.topic}` : ""}` : "unknown";
  return (
    "You are preparing an oral viva question bank from a printed study booklet.\n" +
    "Each question in the booklet is a bullet (shown as the glyph 'ð') followed by its model answer. " +
    "A question may carry a [NCERT] or [CBSE] tag. The glyph 'è' marks notes and points to remember: not questions.\n" +
    "Return every question on the pages below, in order, with its answer copied exactly as printed (do not shorten, " +
    "paraphrase or correct it). Drop the tag from the question and put it in source. Drop a leading 'Ans:' from the answer. " +
    "If a table is the answer, write it out as plain text, row by row. If a bullet has an 'OR' alternative question, " +
    "return each alternative as its own question with the same answer and the same concept.\n" +
    "Skip anything that is not a question with an answer. If a page starts with answer text but no question, it " +
    "continues the previous page: ignore it. Text after [NEXT PAGE] is only there to finish an answer.\n" +
    `These pages begin in: ${where}. The chapter heading looks like 'CHAPTER 2 - ELECTRICITY' and a topic heading like ` +
    "'A. BEFORE OHM'S LAW' or 'TOPIC B. NAME'. Use the heading printed on the pages when there is one, otherwise the place above. " +
    "Give the topic without its letter prefix, exactly as printed.\n" +
    `Topics already in the bank for this chapter (reuse the name exactly when it is the same topic): ${knownTopics.join("; ") || "none"}.\n` +
    `Concept slugs already used for this chapter: ${knownConcepts.slice(0, 80).join("; ") || "none"}.\n` +
    "concept is a short lowercase slug starting with ch<chapter number>. that names the single idea the question tests; " +
    "questions testing the same idea in different words must share a slug, and reuse an existing slug when it fits.\n" +
    "Set diagram_required true only if answering needs a drawing or figure (for example 'draw a ray diagram').\n\n" +
    text
  );
}

/** Tidy what the model returned: canonical chapter names, clean topics, no repeats, bank duplicates flagged. */
export function normalise(items: RawQuestion[], bank: BankRow[], fallback: Place | null = null): DraftQuestion[] {
  const bankNames = new Map(bank.map((q) => [q.chapter_no, q.chapter]));
  const bankQuestions = new Set(bank.map((q) => normQuestion(q.question)));
  const seen = new Set<string>();
  const out: DraftQuestion[] = [];

  for (const item of items) {
    const question = clean(String(item.question ?? "")).replace(/\s*\[(NCERT|CBSE)\]\s*$/i, "").trim();
    const key = normQuestion(question);
    if (!key || seen.has(key)) continue;

    let chapterNo = Math.trunc(Number(item.chapter_no)) || 0;
    if (chapterNo <= 0 && fallback?.chapterNo) chapterNo = fallback.chapterNo;
    if (chapterNo <= 0) continue;
    const chapter = bankNames.get(chapterNo) || clean(String(item.chapter ?? "")) || fallback?.chapter || "";
    if (!chapter) continue;

    seen.add(key);
    const slug = String(item.concept ?? "").trim().toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "");
    const source = String(item.source ?? "").trim().toUpperCase();
    out.push({
      chapter_no: chapterNo,
      chapter,
      topic: clean(String(item.topic ?? "")).replace(TOPIC_PREFIX_RE, "") || "GENERAL",
      concept: slug.startsWith(`ch${chapterNo}.`) ? slug : slug ? `ch${chapterNo}.${slug}` : null,
      question: question.slice(0, 2000),
      answer: String(item.answer ?? "").replace(/^\s*ans\s*:\s*/i, "").trim().slice(0, 5000),
      source: SOURCES.has(source) ? source : "",
      diagram_required: Boolean(item.diagram_required),
      duplicate: bankQuestions.has(key),
    });
  }
  return out.slice(0, MAX_QUESTIONS);
}
