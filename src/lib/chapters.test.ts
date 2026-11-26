import assert from "node:assert/strict";
import { test } from "node:test";
import { CHAPTERS } from "../data/chapters.ts";
import { chapterOptions } from "./chapters.ts";

test("every class and subject on the site has chapters, with no duplicates", () => {
  const subjects: Record<number, string[]> = {
    9: ["Science", "Maths"],
    10: ["Science", "Maths"],
    11: ["Physics", "Chemistry", "Maths", "Biology", "Accountancy", "Economics"],
    12: ["Physics", "Chemistry", "Maths", "Biology", "Accountancy", "Economics"],
  };
  for (const [cls, names] of Object.entries(subjects)) {
    for (const subject of names) {
      const list = CHAPTERS[Number(cls)]?.[subject];
      assert.ok(list?.length, `Class ${cls} ${subject} has no chapters`);
      assert.equal(new Set(list).size, list.length, `Class ${cls} ${subject} repeats a chapter`);
    }
  }
  assert.equal(CHAPTERS[12].Physics.length, 14);
  assert.equal(CHAPTERS[10].Science.length, 13);
});

test("chapters come in book order, and a name already used for a chapter is kept", () => {
  const out = chapterOptions(12, "Physics", [
    { chapter: "Electric Charges & Fields", chapter_no: 1 },
    { chapter: "Electrostatic Potential and Capacitance", chapter_no: 2 },
  ]);
  assert.equal(out.length, 14);
  assert.deepEqual(out[0], { no: 1, name: "Electric Charges & Fields" }); // theirs, not "…and Fields"
  assert.deepEqual(out[2], { no: 3, name: "Current Electricity" });
  assert.deepEqual(out.map((c) => c.no), Array.from({ length: 14 }, (_, i) => i + 1));
});

test("a chapter typed by hand comes last, and a subject with no list still works", () => {
  const out = chapterOptions(12, "Physics", [
    { chapter: "Bonus topics", chapter_no: null },
    { chapter: "Atoms", chapter_no: null }, // already on the list as chapter 12, so not repeated
  ]);
  assert.equal(out.length, 15);
  assert.deepEqual(out[14], { no: null, name: "Bonus topics" });
  assert.deepEqual(chapterOptions(null, null, [{ chapter: "X", chapter_no: null }]), [{ no: null, name: "X" }]);
  assert.deepEqual(chapterOptions(8, "Art", []), []);
});
