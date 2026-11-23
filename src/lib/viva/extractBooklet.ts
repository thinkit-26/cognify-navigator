import { extractChunk } from "@/lib/viva/extract.functions";
import { makeChunks, normalise, splitText, type BankRow, type DraftQuestion, type Place } from "@/lib/viva/booklet";

export type { DraftQuestion } from "@/lib/viva/booklet";

const WORKERS = 4;

export interface ExtractResult {
  questions: DraftQuestion[];
  warnings: string[];
}

/** One line per text row, per page, using the PDF's own line breaks. */
async function pdfPages(file: File): Promise<string[][]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), verbosity: 0 }).promise;
  const pages: string[][] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    let text = "";
    for (const item of content.items) if ("str" in item) text += item.str + (item.hasEOL ? "\n" : "");
    pages.push(text.split("\n"));
  }
  return pages;
}

async function docxPages(file: File): Promise<string[][]> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  if (!value.trim()) throw new Error("The Word file has no text in it.");
  return splitText(value);
}

/**
 * Reads a booklet into draft questions: the text is read here in the browser, cut into parts, and each part
 * is sent to the server to be read by Gemini, four at a time. With `forced` set every question is filed under
 * that chapter; otherwise chapters come from the booklet's own headings.
 */
export async function extractBooklet(
  file: File,
  forced: { no: number; name: string } | null,
  bank: BankRow[],
  onProgress: (done: number, total: number) => void,
): Promise<ExtractResult> {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) throw new Error("Upload a PDF or a .docx Word file.");
  const pages = name.endsWith(".pdf") ? await pdfPages(file) : await docxPages(file);
  const chunks = makeChunks(pages);
  if (!chunks.length) throw new Error("No questions were found in that file.");

  const fallback: Place | null = forced ? { chapterNo: forced.no, chapter: forced.name, topic: "" } : null;
  const topics = new Map<number, string[]>();
  const concepts = new Map<number, string[]>();
  for (const q of bank) {
    const t = topics.get(q.chapter_no) ?? [];
    if (!t.includes(q.topic)) t.push(q.topic);
    topics.set(q.chapter_no, t);
    if (q.concept) concepts.set(q.chapter_no, [...(concepts.get(q.chapter_no) ?? []), q.concept]);
  }

  const warnings: string[] = [];
  const results: Awaited<ReturnType<typeof extractChunk>>["questions"][] = new Array(chunks.length).fill([]);
  let done = 0;
  let next = 0;
  onProgress(0, chunks.length);

  const worker = async () => {
    while (next < chunks.length) {
      const i = next++;
      const chunk = chunks[i];
      const place = chunk.place.chapterNo ? chunk.place : (fallback ?? chunk.place);
      try {
        const { questions } = await extractChunk({
          data: {
            text: chunk.text,
            place,
            knownTopics: topics.get(place.chapterNo ?? 0) ?? [],
            knownConcepts: [...new Set(concepts.get(place.chapterNo ?? 0) ?? [])],
          },
        });
        results[i] = questions;
      } catch {
        warnings.push(`Pages ${chunk.first + 1} to ${chunk.last + 1} could not be read.`);
      }
      onProgress(++done, chunks.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(WORKERS, chunks.length) }, worker));

  const questions = normalise(results.flat(), bank, fallback);
  if (!questions.length) throw new Error(warnings.length ? "The booklet could not be read. Try again." : "No questions were found in that file.");
  return { questions, warnings };
}
