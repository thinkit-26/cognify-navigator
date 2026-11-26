import { CHAPTERS } from "@/data/chapters";

export interface ChapterOption {
  no: number | null; // null: a chapter typed by hand, with no place in the book
  name: string;
}

interface Filed {
  chapter: string;
  chapter_no: number | null;
}

/**
 * The chapters of a subject in book order: the ones on the site's list, each under the name already used by
 * derivations that were uploaded (those names win, so nothing already named is renamed), then any chapter
 * typed by hand, in alphabetical order.
 */
export function chapterOptions(cls: number | null, subject: string | null, filed: Filed[]): ChapterOption[] {
  const base = (cls && subject ? CHAPTERS[cls]?.[subject] : undefined) ?? [];
  const named = new Map<number, string>(base.map((name, i) => [i + 1, name]));
  const custom = new Set<string>();
  for (const f of filed) {
    if (f.chapter_no == null) custom.add(f.chapter);
    else named.set(f.chapter_no, f.chapter);
  }
  const numbered = [...named].sort((a, b) => a[0] - b[0]).map(([no, name]) => ({ no, name }));
  const taken = new Set(numbered.map((c) => c.name));
  const typed = [...custom].filter((n) => !taken.has(n)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return [...numbered, ...typed.map((name) => ({ no: null, name }))];
}

/** Chapters in book order; the ones with no number come last, alphabetically. */
export const byChapterOrder = (a: ChapterOption, b: ChapterOption) =>
  (a.no ?? Infinity) - (b.no ?? Infinity) || a.name.localeCompare(b.name, undefined, { numeric: true });
