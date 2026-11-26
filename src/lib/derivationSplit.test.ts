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
  assert.equal(found[0].title, "A particle of total charge Q is broken in two parts and placed apart. Find the maximum force."); // up to Working
  // no Working line: the first sentence
  assert.equal(found[1].title, "Derive the expression for the torque on a dipole in a uniform field.");
  assert.equal(found[2].title, "Short");
});

test("the title is the heading under the D number, up to the Working line", () => {
  const found = findDerivations([
    page("D1", "Electric Potential at a Point Due to a Point Charge", "Working", "Consider a positive point charge"),
    page("D2", "Potential Difference Between Two Points in the Field of a Source", "Charge", "Working", "Consider ..."),
    page("D3", "CAPCITORS IN SERIES{.underline}", "Working"),
    page("D4", "Electric Potential When $\\mathbf{N}$Identical Charged Drops", "Coalesce", "Working"),
    page("D5", "Derive the expression.", "Working", "x"),
  ]);
  assert.deepEqual(
    found.map((d) => d.title),
    [
      "Electric Potential at a Point Due to a Point Charge",
      "Potential Difference Between Two Points in the Field of a Source Charge",
      "CAPCITORS IN SERIES",
      "Electric Potential When N Identical Charged Drops Coalesce",
      "Derive the expression.",
    ],
  );
  const odd = findDerivations([
    page("D7", "Capacitance of Shells (of radius R\ue0a31\ue0a3 & R\ue0a32\ue0a3 \ue081R\ue0a31\ue0a3\\\ue097R\ue0a32\ue0a3\ue082\ue082", "Working"),
    page("D8", "Dielectric Slab \ue081$\\mathbf{t < d}$\ue082", "Working"),
    page("D9", "Susceptibility ($\\mathbf{\\chi} {\\mathbf{e}}$) and Constant", "Working"),
    page("D10", "OR obtain it when r/R \\\ue098 1. \ue083NCERT\ue084", "Working"),
    page("D11", "CAPACITORS IN SERIES\ue085.underline}", "Working"),
  ]).map((d) => d.title);
  assert.deepEqual(odd, [
    "Capacitance of Shells (of radius R1 & R2 (R1<R2))",
    "Dielectric Slab (t < d)",
    "Susceptibility (χ e) and Constant",
    "OR obtain it when r/R > 1. [NCERT]",
    "CAPACITORS IN SERIES",
  ]);
  const long = findDerivations([page("D6", ...Array.from({ length: 10 }, () => "word ".repeat(10)), "Working")])[0].title;
  assert.ok(long.length <= 301 && long.endsWith("…"));
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
