import { loadPdfjs } from "@/lib/pdfjs";

// Reads a PDF's text in the browser, one array of lines per page, using the PDF's own line breaks.

export async function pdfPages(file: File): Promise<string[][]> {
  const pdfjs = await loadPdfjs();
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

const BAND_ABOVE = 22; // points above the D label's baseline: the badge is taller than its text
const BAND_HEIGHT = 32;
const BAND_SCALE = 3; // sharp enough to read small blue text

/**
 * A thin picture (JPEG, base64) of the top strip of each given page: the row with the D badge and the heading
 * beside it. Null for a page where no D label is found.
 */
export async function headerStrips(file: File, pageIndexes: number[]): Promise<(string | null)[]> {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), verbosity: 0 });
  const pdf = await task.promise;
  const out: (string | null)[] = [];
  try {
    for (const index of pageIndexes) {
      const page = await pdf.getPage(index + 1);
      const view = page.getViewport({ scale: 1 });
      const label = (await page.getTextContent()).items.find((it) => "str" in it && /^D\s*\d{1,3}$/.test(it.str.trim()));
      if (!label || !("transform" in label)) {
        out.push(null);
        continue;
      }
      const top = Math.max(0, view.height - label.transform[5] - BAND_ABOVE);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(view.width * BAND_SCALE);
      canvas.height = Math.round(BAND_HEIGHT * BAND_SCALE);
      await page.render({
        canvasContext: canvas.getContext("2d")!,
        canvas,
        viewport: page.getViewport({ scale: BAND_SCALE, offsetY: -top * BAND_SCALE }),
      }).promise;
      out.push(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    }
  } finally {
    void task.destroy();
  }
  return out;
}
