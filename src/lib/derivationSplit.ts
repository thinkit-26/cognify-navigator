import { PDFDocument } from "pdf-lib";

// Splitting a chapter file of derivations into one file per derivation. Each derivation starts on a page
// whose top has a header line "D1", "D2", ... and runs until the next such page.

export interface Found {
  number: number; // the D number
  title: string;
  first: number; // 0-based page indexes, inclusive
  last: number;
}

export interface FileHeader {
  classLevel: number | null;
  subject: string;
  chapterNo: number | null;
}

const D_HEADER = /^D\s*(\d{1,3})$/;
const ROMAN: Record<string, number> = { IX: 9, X: 10, XI: 11, XII: 12 };
const clean = (text: string) => text.replace(/[ \s]+/g, " ").trim();

const MAX_TITLE = 300;

// Symbols the Word-to-PDF conversion put in a private-use font, so pdf.js cannot read them as text.
const SYMBOLS: Record<string, string> = {
  "\ue081": "(", "\ue082": ")", "\ue083": "[", "\ue084": "]", "\ue085": "{",
  "\ue088": "-", "\ue097": "<", "\ue098": ">", "\ue0a3": "~",
};

/** Makes a heading readable: the private-use symbols, and the markdown and LaTeX bits the conversion left in the text. */
const tidy = (text: string) => {
  let t = text.replace(/[\ue000-\uf8ff]/g, (c) => SYMBOLS[c] ?? "");
  t = t.replace(/\{\.[\w-]+\}/g, ""); // {.underline}
  for (let i = 0; i < 3; i++) t = t.replace(/\\mathbf\{([^{}]*)\}/g, "$1 "); // \mathbf{N}
  t = t.replace(/\\chi\b/g, "χ").replace(/\\(?:var)?epsilon\b/g, "ε").replace(/\\varepsilon\b/g, "ε");
  t = t.replace(/\\([<>])/g, "$1").replace(/~(\S+?)~/g, "$1").replace(/[${}]/g, ""); // \<, R~1~ and stray markers
  return clean(t).replace(/\s+([)\]])/g, "$1").replace(/([(\[])\s+/g, "$1");
};

/**
 * The title is the heading printed under the D number, which runs up to the "Working" line. Files without
 * that line fall back to the first sentence of what follows.
 */
function titleOf(lines: string[]): string {
  const working = lines.slice(0, 12).findIndex((l) => /^working$/i.test(clean(l)));
  const heading = working > 0 ? tidy(lines.slice(0, working).join(" ")) : "";
  if (heading) return heading.length <= MAX_TITLE ? heading : heading.slice(0, MAX_TITLE).replace(/\s+\S*$/, "") + "…";

  const text = clean(lines.filter((l) => l.trim()).slice(0, 4).join(" "));
  const sentence = /^(.{20,}?[.?:])(\s|$)/.exec(text)?.[1] ?? text;
  if (sentence.length <= 110) return sentence;
  return sentence.slice(0, 110).replace(/\s+\S*$/, "") + "…";
}

export function findDerivations(pages: string[][]): Found[] {
  const found: Found[] = [];
  pages.forEach((lines, i) => {
    const top = lines.slice(0, 8);
    const at = top.findIndex((l) => D_HEADER.test(clean(l)));
    if (at < 0) return; // a page without a header continues the derivation before it
    const number = Number(D_HEADER.exec(clean(top[at]))![1]);
    found.push({ number, title: titleOf(lines.slice(at + 1)), first: i, last: i });
  });
  found.forEach((d, k) => {
    d.last = (found[k + 1]?.first ?? pages.length) - 1;
  });
  return found;
}

/** Reads "Class XII · Physics · Chapter 1" from the top of the file, so a wrong class or subject can be caught. */
export function readHeader(pages: string[][]): FileHeader | null {
  for (const line of (pages[0] ?? []).slice(0, 4)) {
    const m = /Class\s+([IVX]+|\d+)\s*[·•|]\s*(.+?)\s*[·•|]\s*Chapter\s+(\d+)/i.exec(clean(line));
    if (m) {
      const level = ROMAN[m[1].toUpperCase()] ?? Number(m[1]);
      return { classLevel: level >= 9 && level <= 12 ? level : null, subject: clean(m[2]), chapterNo: Number(m[3]) };
    }
  }
  return null;
}

/** One small PDF per range of pages. */
export async function splitPdf(bytes: Uint8Array, ranges: { first: number; last: number }[]): Promise<Uint8Array[]> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out: Uint8Array[] = [];
  for (const { first, last } of ranges) {
    const doc = await PDFDocument.create();
    const indexes = Array.from({ length: last - first + 1 }, (_, k) => first + k);
    for (const page of await doc.copyPages(source, indexes)) doc.addPage(page);
    out.push(await doc.save());
  }
  return out;
}
