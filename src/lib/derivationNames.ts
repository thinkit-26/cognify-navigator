import { readHeadings } from "@/lib/viva/extract.functions";
import { headerStrips } from "@/lib/pdfText";

const BATCH = 6;
const WORKERS = 3;

/**
 * Reads the heading beside the D badge of each derivation (its first page), as pictures, with Gemini.
 * Calls `onName(i, name)` for each derivation as its name arrives; a derivation whose name could not be
 * read is simply skipped. Rejects if nothing could be read at all (for example the Gemini key is missing).
 */
export async function readDerivationNames(
  file: File,
  firstPages: number[],
  onName: (i: number, name: string) => void,
  onProgress: (done: number, total: number) => void,
): Promise<void> {
  const strips = await headerStrips(file, firstPages);
  const todo = strips.flatMap((s, i) => (s ? [i] : []));
  const batches = Array.from({ length: Math.ceil(todo.length / BATCH) }, (_, b) => todo.slice(b * BATCH, b * BATCH + BATCH));
  let next = 0;
  let done = 0;
  let got = 0;
  let lastError: unknown;
  onProgress(0, todo.length);

  const worker = async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      try {
        const { names } = await readHeadings({ data: { images: batch.map((i) => strips[i]!) } });
        if (names.length === batch.length) {
          // a batch that came back the wrong length cannot be matched to its pages, so it is dropped
          batch.forEach((i, k) => {
            if (names[k]) {
              onName(i, names[k]);
              got++;
            }
          });
        }
      } catch (err) {
        lastError = err;
      }
      done += batch.length;
      onProgress(done, todo.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(WORKERS, batches.length) }, worker));
  if (todo.length && !got) throw lastError instanceof Error ? lastError : new Error("The headings could not be read.");
}
