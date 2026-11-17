import type { Tables } from "@/integrations/supabase/types";

// Pure maths for the Viva report dashboard. No React, no Supabase: everything here is a function of
// the rows, so it can be checked on its own.

export type Session = Tables<"viva_sessions">;
export type SlimAnswer = Pick<Tables<"viva_answers">, "session_id" | "user_id" | "topic" | "is_correct">;

export const PASS_MARK = 60;
export const WEAK_TOPIC_BELOW = 60;

const BAD: [number, number, number] = [209, 36, 47];
const MID: [number, number, number] = [154, 103, 0];
const GOOD: [number, number, number] = [26, 127, 55];

/** Red at 0, amber at 50, green at 100: the same anchors as the dashboard's colour tokens. */
export function scoreColor(pct: number): string {
  const s = Math.max(0, Math.min(100, pct));
  const [a, b, t] = s <= 50 ? [BAD, MID, s / 50] : [MID, GOOD, (s - 50) / 50];
  const c = [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Smooth, non-overshooting path through the points (monotone cubic, Fritsch-Carlson). */
export function monotonePath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      t[i] = (3 * a * m[i]) / h;
      t[i + 1] = (3 * b * m[i]) / h;
    }
  }
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i].x + dx[i] / 3;
    const c2x = pts[i + 1].x - dx[i] / 3;
    d += ` C${c1x},${pts[i].y + (t[i] * dx[i]) / 3} ${c2x},${pts[i + 1].y - (t[i + 1] * dx[i]) / 3} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

const doneSessions = (sessions: Session[]) =>
  sessions
    .filter((s) => s.status === "completed" && s.overall_score != null)
    .sort((a, b) => (a.completed_at ?? a.started_at).localeCompare(b.completed_at ?? b.started_at));

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  flagged: number; // vivas in which the student got this topic wrong at least once
}

export function topicStats(answers: SlimAnswer[], doneIds: Set<string>): TopicStat[] {
  const m = new Map<string, { correct: number; total: number; flagged: Set<string> }>();
  for (const a of answers) {
    if (!a.topic || a.is_correct == null || !doneIds.has(a.session_id)) continue;
    const e = m.get(a.topic) ?? { correct: 0, total: 0, flagged: new Set<string>() };
    e.total++;
    if (a.is_correct) e.correct++;
    else e.flagged.add(a.session_id);
    m.set(a.topic, e);
  }
  return [...m.entries()]
    .map(([topic, e]) => ({ topic, correct: e.correct, total: e.total, accuracy: (e.correct / e.total) * 100, flagged: e.flagged.size }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export interface StudentReport {
  done: Session[];
  scores: number[];
  count: number;
  avg: number;
  best: number;
  passed: number;
  trend: { id: string; label: string; score: number }[];
  topics: TopicStat[];
  weak: TopicStat[]; // most-flagged first
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function buildStudentReport(sessions: Session[], answers: SlimAnswer[]): StudentReport {
  const done = doneSessions(sessions);
  const scores = done.map((s) => Number(s.overall_score));
  const topics = topicStats(answers, new Set(done.map((s) => s.session_id)));
  return {
    done,
    scores,
    count: done.length,
    avg: scores.length ? scores.reduce((t, x) => t + x, 0) / scores.length : 0,
    best: scores.length ? Math.max(...scores) : 0,
    passed: scores.filter((x) => x >= PASS_MARK).length,
    trend: done.slice(-10).map((s) => ({ id: s.session_id, label: shortDate(s.completed_at ?? s.started_at), score: Number(s.overall_score) })),
    topics,
    weak: topics.filter((t) => t.flagged > 0).sort((a, b) => b.flagged - a.flagged || a.accuracy - b.accuracy).slice(0, 12),
  };
}

/** One or two plain-English sentences. `name` null means the reader is the student ("You"). */
export function prognosis(r: StudentReport, name: string | null): string {
  if (!r.count) return name ? `${name} has not taken a viva yet.` : "You have not taken a viva yet. Your report will appear after your first one.";
  const who = name ?? "You";
  const be = name ? "is" : "are";
  const poss = name ? "their" : "your";
  const out = [`${who} ${be} averaging ${Math.round(r.avg)}% across ${r.count} viva${r.count === 1 ? "" : "s"}.`];
  if (r.count >= 2) {
    const delta = Math.round(r.scores[r.scores.length - 1] - r.scores[0]);
    out.push(delta === 0 ? `${name ? "Their" : "Your"} latest score matches ${poss} first.` : `${name ? "Their" : "Your"} latest score is ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"} ${delta > 0 ? "above" : "below"} ${poss} first.`);
  }
  if (r.weak[0]) out.push(`${name ? "Next practice" : "Spend your next practice"} on ${r.weak[0].topic}.`);
  return out.join(" ");
}

export interface ClassRow {
  userId: string;
  count: number;
  avg: number;
  best: number;
}

export interface ClassReport {
  rows: ClassRow[]; // best average first
  attempts: number;
  students: number;
  classAvg: number | null; // mean of each student's own average, so every student weighs the same
  bands: number[]; // students per 10% band, 100% counts in the last band
  struggling: TopicStat[]; // class-wide topics under the threshold, worst first
}

export function buildClassReport(sessions: Session[], answers: SlimAnswer[]): ClassReport {
  const byUser = new Map<string, Session[]>();
  for (const s of sessions) (byUser.get(s.user_id) ?? byUser.set(s.user_id, []).get(s.user_id)!).push(s);
  const rows: ClassRow[] = [];
  for (const [userId, ss] of byUser) {
    const scores = doneSessions(ss).map((s) => Number(s.overall_score));
    if (!scores.length) continue;
    rows.push({ userId, count: scores.length, avg: scores.reduce((t, x) => t + x, 0) / scores.length, best: Math.max(...scores) });
  }
  rows.sort((a, b) => b.avg - a.avg);
  const bands = Array<number>(10).fill(0);
  for (const r of rows) bands[Math.min(9, Math.floor(r.avg / 10))]++;
  const doneIds = new Set(doneSessions(sessions).map((s) => s.session_id));
  return {
    rows,
    attempts: sessions.length,
    students: byUser.size,
    classAvg: rows.length ? rows.reduce((t, r) => t + r.avg, 0) / rows.length : null,
    bands,
    struggling: topicStats(answers, doneIds).filter((t) => t.accuracy < WEAK_TOPIC_BELOW && t.total >= 3),
  };
}
