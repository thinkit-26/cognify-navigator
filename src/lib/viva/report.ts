import type { Tables } from "@/integrations/supabase/types";

// The student's performance report: a typewritten, grey-paper PDF made in the browser from their
// viva results. Marks and performance only: no individual answers, nothing stored or sent.

type Session = Pick<Tables<"viva_sessions">, "session_id" | "status" | "overall_score" | "started_at" | "completed_at">;
type Answer = Pick<Tables<"viva_answers">, "session_id" | "topic" | "is_correct">;

export interface ReportStudent {
  name: string;
  id: string;
  classLevel: string | null;
}

const PAPER = "#C7C7C5";
const INK = "#1A1A1A";
const SOFT = "#474747";
const FAINT = "#9A9A98";
const GOOD = "#14602B";
const PASS_MARK = 60;
const FONT_URL = "/fonts/DepartureMono-Regular.ttf";

const W = 595;
const H = 842;
const LEFT = 72;
const RIGHT = W - 34;
const TOP = 108;
const BOTTOM = H - 52;
const LINE = 13;

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const RED = hex("#A6171F");
const AMBER = hex("#7A5200");
const GREEN = hex("#14602B");

/** Red at 0, amber at 50, green at 100. */
function scoreColor(score: number): [number, number, number] {
  const s = Math.max(0, Math.min(100, score));
  const [a, b, t] = s <= 50 ? [RED, AMBER, s / 50] : [AMBER, GREEN, (s - 50) / 50];
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as [number, number, number];
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
const longDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();

async function loadFont(): Promise<string | null> {
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok || !(res.headers.get("content-type") ?? "").match(/font|octet|ttf/i)) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  } catch {
    return null;
  }
}

export function reportStats(sessions: Session[], answers: Answer[]) {
  const done = sessions
    .filter((s) => s.status === "completed" && s.overall_score != null)
    .sort((a, b) => (a.completed_at ?? a.started_at).localeCompare(b.completed_at ?? b.started_at));
  const scores = done.map((s) => Number(s.overall_score));
  const flagged = new Map<string, Set<string>>();
  const doneIds = new Set(done.map((s) => s.session_id));
  for (const a of answers) {
    if (a.is_correct === false && a.topic && doneIds.has(a.session_id)) {
      (flagged.get(a.topic) ?? flagged.set(a.topic, new Set()).get(a.topic)!).add(a.session_id);
    }
  }
  const topics = [...flagged.entries()].map(([t, ids]) => [t, ids.size] as const).sort((a, b) => b[1] - a[1]).slice(0, 12);
  return {
    done,
    scores,
    avg: scores.length ? scores.reduce((t, x) => t + x, 0) / scores.length : 0,
    best: scores.length ? Math.max(...scores) : 0,
    passed: scores.filter((x) => x >= PASS_MARK).length,
    topics,
  };
}

export async function downloadVivaReport(student: ReportStudent, sessions: Session[], answers: Answer[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const fontData = await loadFont();
  let font = "courier"; // fallback until the Departure Mono file is added at /public/fonts
  if (fontData) {
    doc.addFileToVFS("DepartureMono-Regular.ttf", fontData);
    doc.addFont("DepartureMono-Regular.ttf", "DepartureMono", "normal");
    font = "DepartureMono";
  }
  const setText = (size: number, color = INK) => {
    doc.setFont(font, "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
  };

  const paintPage = () => {
    doc.setFillColor(PAPER);
    doc.rect(0, 0, W, H, "F");
    doc.setDrawColor(INK);
    doc.setLineWidth(0.7);
    doc.line(44, 0, 44, H);
    doc.setFillColor("#2A2A2A");
    for (let y = 33; y < H; y += 66) doc.circle(22, y, 7.2, "F");
    setText(7, SOFT);
    doc.text("COGNIFY VIVA", LEFT, H - 26);
  };
  paintPage();

  let y = TOP;
  const room = (needed: number) => {
    if (y + needed <= BOTTOM) return;
    doc.addPage();
    paintPage();
    y = TOP;
  };
  const line = (text: string, size = 9, color = INK, gap = LINE) => {
    for (const row of doc.splitTextToSize(text, RIGHT - LEFT) as string[]) {
      room(gap);
      setText(size, color);
      doc.text(row, LEFT, y);
      y += gap;
    }
  };
  const rule = () => {
    line("---");
  };

  const { done, scores, avg, best, passed, topics } = reportStats(sessions, answers);

  // Header block: the title sits at y = 68 with the page counter, the details start at the first content line.
  setText(15);
  doc.text("# STUDENT PERFORMANCE REPORT", LEFT, 68);
  line(`SUBJECT: PERFORMANCE SUMMARY FOR ${student.name.toUpperCase()}`);
  line(`STUDENT ID: ${student.id}`);
  line(`CLASS: ${(student.classLevel ?? "NOT SET").toUpperCase()}`);
  line(`REPORT DATE: ${longDate(new Date())}`);
  rule();
  y += LINE / 2;

  line("## OVERVIEW", 11, INK, 16);
  if (!done.length) {
    line("You have not taken a viva yet, so there is no performance to report.");
  } else {
    line(`You are averaging ${Math.round(avg)}% across ${done.length} viva${done.length === 1 ? "" : "s"}.`);
    if (done.length >= 2) {
      const delta = Math.round(scores[scores.length - 1] - scores[0]);
      line(
        delta === 0
          ? "Your latest score matches your first."
          : `Your latest score is ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"} ${delta > 0 ? "above" : "below"} your first.`,
      );
    }
    if (topics.length) line(`Spend your next practice on ${topics[0][0]}.`);
  }

  if (done.length) {
    // MARKS: a boxed table.
    y += LINE;
    room(16 + 5 * 18 + 8);
    line("### MARKS", 9.5, INK, 16);
    const cols = [150, 100, RIGHT - LEFT - 250];
    const rows: [string, string, string, [number, number, number]?][] = [
      ["METRIC", "RESULT", "NOTES"],
      ["Vivas taken", String(done.length), "Completed attempts"],
      ["Average score", `${Math.round(avg)}%`, "Mean of all attempts", scoreColor(avg)],
      ["Best score", `${Math.round(best)}%`, "Highest single attempt", scoreColor(best)],
      ["Passed", `${passed} / ${done.length}`, `Attempts at ${PASS_MARK}% or above`, scoreColor((passed / done.length) * 100)],
    ];
    const rowH = 18;
    doc.setDrawColor(INK);
    doc.setLineWidth(0.7);
    doc.rect(LEFT, y, RIGHT - LEFT, rowH * rows.length);
    rows.forEach((r, i) => {
      const ry = y + i * rowH;
      if (i > 0) doc.line(LEFT, ry, RIGHT, ry);
      let cx = LEFT;
      cols.forEach((cw, c) => {
        if (c > 0) doc.line(cx, y, cx, y + rowH * rows.length);
        if (c === 1 && r[3]) doc.setTextColor(r[3][0], r[3][1], r[3][2]);
        else doc.setTextColor(i === 0 ? SOFT : INK);
        doc.setFont(font, "normal");
        doc.setFontSize(9);
        if (c === 1) doc.text(r[1], cx + cw - 6, ry + 12.5, { align: "right" });
        else doc.text(String(r[c]), cx + 6, ry + 12.5);
        cx += cw;
      });
    });
    y += rowH * rows.length + LINE * 1.5;

    // SCORE TREND: the last 10 vivas, oldest to newest.
    room(16 + 150 + LINE);
    line("### SCORE TREND", 9.5, INK, 16);
    const last = done.slice(-10);
    const top = y + 10;
    const bottom = y + 150 - 24;
    const px0 = LEFT + 30;
    const px1 = RIGHT - 20;
    const yOf = (v: number) => bottom - (v / 100) * (bottom - top);
    setText(7, SOFT);
    doc.setLineWidth(0.4);
    for (const g of [0, 25, 50, 75, 100]) {
      doc.setDrawColor(FAINT);
      doc.line(px0, yOf(g), px1, yOf(g));
      doc.setTextColor(SOFT);
      doc.text(String(g), px0 - 6, yOf(g) + 2.5, { align: "right" });
    }
    doc.setDrawColor(GOOD);
    doc.setLineWidth(0.7);
    doc.setLineDashPattern([3, 2], 0);
    doc.line(px0, yOf(PASS_MARK), px1, yOf(PASS_MARK));
    doc.setLineDashPattern([], 0);
    setText(7, GOOD);
    doc.text(`PASS ${PASS_MARK}`, px1, yOf(PASS_MARK) - 3, { align: "right" });
    const xs = last.map((_, i) => (last.length === 1 ? (px0 + px1) / 2 : px0 + 14 + (i * (px1 - px0 - 28)) / (last.length - 1)));
    doc.setDrawColor(INK);
    doc.setLineWidth(1.2);
    for (let i = 1; i < last.length; i++) doc.line(xs[i - 1], yOf(Number(last[i - 1].overall_score)), xs[i], yOf(Number(last[i].overall_score)));
    last.forEach((s, i) => {
      const v = Number(s.overall_score);
      const c = scoreColor(v);
      doc.setFillColor(c[0], c[1], c[2]);
      doc.rect(xs[i] - 3.5, yOf(v) - 3.5, 7, 7, "F");
      doc.setFont(font, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(c[0], c[1], c[2]);
      doc.text(`${Math.round(v)}`, xs[i], yOf(v) - 7, { align: "center" });
      doc.setFontSize(6.5);
      doc.setTextColor(SOFT);
      doc.text(shortDate(s.completed_at ?? s.started_at), xs[i], bottom + 12, { align: "center" });
    });
    y += 150 + LINE;

    // TOPICS TO REVISIT
    room(16 + LINE * 2);
    line("### TOPICS TO REVISIT", 9.5, INK, 16);
    if (!topics.length) line("No weak topics have been flagged.");
    for (const [topic, count] of topics) line(`- ${topic.toUpperCase()} (${count})`, 9, `#A6171F`);
  }

  y += LINE / 2;
  rule();
  line("END OF REPORT");

  // Page counter, written last so the total is known.
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setText(9, SOFT);
    doc.text(`${p}/${total}`, RIGHT, 68, { align: "right" });
  }

  doc.setProperties({
    title: `Performance report - ${student.name}`,
    subject: `${student.id}, ${student.classLevel ?? "Class not set"}`,
    author: "Cognify VIVA",
    creator: "Cognify VIVA",
  });
  const safe = student.name.trim().replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "Student";
  doc.save(`VIVA_report_${safe}_${student.id}.pdf`);
}
