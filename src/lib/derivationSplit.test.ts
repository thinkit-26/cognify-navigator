import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { findDerivations, readHeader, splitPdf } from "./derivationSplit.ts";

const page = (header: string, ...body: string[]) => ["Class XII  ·  Physics  ·  Chapter 1", header, ...body];

test("every page headed D<n> starts a derivation and the pages after it belong to it", () => {
  const pages = [
    ["Cover page"],
    page("D1", "A particle of total charge Q is broken in two parts and", "placed apart. Find the maximum force.", "Working"),
    page("D2", "Derive the expression for the torque on a dipole in a uniform field."),
    ["A continuation page with no header", "more working"],
    page("D10", "Short"),
  ];
  const found = findDerivations(pages);
  assert.deepEqual(found.map((d) => [d.number, d.first, d.last]), [[1, 1, 1], [2, 2, 3], [10, 4, 4]]);
  assert.equal(found[0].title, "A particle of total charge Q is broken in two parts and placed apart.");
  assert.equal(found[1].title, "Derive the expression for the torque on a dipole in a uniform field.");
  assert.equal(found[2].title, "Short");
});

test("a header deep inside a page is not a derivation, and long titles are cut at a word", () => {
  const body = Array.from({ length: 10 }, () => "text");
  assert.deepEqual(findDerivations([[...body, "D5"]]), []);
  const long = "Consider " + "word ".repeat(40);
  const [d] = findDerivations([page("D3", long)]);
  assert.ok(d.title.length <= 111 && d.title.endsWith("…") && !d.title.endsWith(" …"));
});

test("the class, subject and chapter are read from the page header", () => {
  assert.deepEqual(readHeader([page("D1")]), { classLevel: 12, subject: "Physics", chapterNo: 1 });
  assert.equal(readHeader([["Class XII · Physics · Chapter 4"]])?.chapterNo, 4);
  assert.equal(readHeader([["no header here"]]), null);
});

test("splitPdf makes one file per range with the right number of pages", async () => {
  const doc = await PDFDocument.create();
  for (let i = 0; i < 5; i++) doc.addPage();
  const parts = await splitPdf(await doc.save(), [{ first: 0, last: 0 }, { first: 1, last: 3 }, { first: 4, last: 4 }]);
  const counts = await Promise.all(parts.map(async (b) => (await PDFDocument.load(b)).getPageCount()));
  assert.deepEqual(counts, [1, 3, 1]);
});
