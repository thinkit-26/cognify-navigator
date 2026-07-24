// Lightweight localStorage store for admin → student notes & custom metrics,
// attendance marking, and scheduled classes. Survives reloads in cheat-mode.
import { useEffect, useState } from "react";

const NOTES_KEY = "cognify_student_notes_v1";
const METRICS_KEY = "cognify_student_metrics_v1";
const ATT_KEY = "cognify_attendance_v1";
const CLASSES_KEY = "cognify_classes_v1";
const NOTICES_KEY = "cognify_notices_v1";
const PAPERS_KEY = "cognify_mcq_papers_v1";
const ATTEMPTS_KEY = "cognify_mcq_attempts_v1";

export type Note = { id: string; studentId: string; text: string; author: string; date: string };
export type Metric = { id: string; studentId: string; label: string; value: string; date: string };
export type AttendanceMark = { studentId: string; date: string; status: "present" | "online" | "absent" };
export type ScheduledClass = { id: string; date: string; time: string; title: string; classLevel: string };
export type Notice = { id: string; title: string; body: string; date: string };

export type MCQQuestion = {
  id: string;
  text: string;
  options: string[];      // length 4
  correct: number;        // index 0..3
};
export type MCQPaper = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  durationMin: number;
  questions: MCQQuestion[];
  broadcast: boolean;
  createdAt: string;
  author: string;
};
export type MCQAttempt = {
  id: string;
  paperId: string;
  studentId: string;
  answers: Record<string, number>; // questionId -> selected index
  score: number;
  total: number;
  submittedAt: string;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new StorageEvent("storage", { key })); } catch {}
}

function useStore<T>(key: string, fallback: T) {
  const [val, setVal] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === key) setVal(read(key, fallback)); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);
  const set = (next: T | ((prev: T) => T)) => {
    setVal((prev) => {
      const out = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, out);
      return out;
    });
  };
  return [val, set] as const;
}

export const useNotes    = () => useStore<Note[]>(NOTES_KEY, []);
export const useMetrics  = () => useStore<Metric[]>(METRICS_KEY, []);
export const useAttendance = () => useStore<AttendanceMark[]>(ATT_KEY, []);
export const useClasses  = () => useStore<ScheduledClass[]>(CLASSES_KEY, []);
export const useNotices  = () => useStore<Notice[]>(NOTICES_KEY, []);
export const usePapers   = () => useStore<MCQPaper[]>(PAPERS_KEY, []);
export const useAttempts = () => useStore<MCQAttempt[]>(ATTEMPTS_KEY, []);

export const uid = () => Math.random().toString(36).slice(2, 9);
