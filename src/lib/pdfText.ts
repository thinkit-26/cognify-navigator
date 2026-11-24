// Reads a PDF's text in the browser, one array of lines per page, using the PDF's own line breaks.

export async function pdfPages(file: File): Promise<string[][]> {
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
