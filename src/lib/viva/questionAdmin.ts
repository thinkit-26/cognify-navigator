import { supabase } from "@/integrations/supabase/client";
import { API_BASE } from "@/lib/viva/api";

export interface DraftQuestion {
  chapter_no: number;
  chapter: string;
  topic: string;
  concept: string | null;
  question: string;
  answer: string;
  source: string;
  diagram_required: boolean;
  duplicate: boolean; // already in the bank
}

export interface ExtractProgress {
  status: "running" | "done" | "error";
  total: number;
  done: number;
  warnings: string[];
  questions?: DraftQuestion[];
  error?: string;
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in again.");
  return { Authorization: `Bearer ${token}` };
}

async function readError(res: Response, fallback: string) {
  const detail = await res.json().then((b) => (typeof b?.detail === "string" ? b.detail : ""), () => "");
  return detail || `${fallback} (${res.status}).`;
}

/** Uploads a booklet and starts reading it. A 100-page booklet takes a minute or two, so this returns a job to poll. */
export async function startExtract(file: File, chapter?: { no: number; name: string }): Promise<{ jobId: string; total: number }> {
  const form = new FormData();
  form.append("file", file);
  if (chapter) {
    form.append("chapter_no", String(chapter.no));
    form.append("chapter", chapter.name);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000); // the upload itself
  try {
    const res = await fetch(`${API_BASE}/admin/extract-questions`, { method: "POST", headers: await authHeader(), body: form, signal: controller.signal });
    if (!res.ok) throw new Error(await readError(res, "The server could not open the file"));
    const body = await res.json();
    return { jobId: body.job_id, total: body.total };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new Error("The upload took too long. Check your connection.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function pollExtract(jobId: string): Promise<ExtractProgress> {
  const res = await fetch(`${API_BASE}/admin/extract-questions/${jobId}`, { headers: await authHeader() });
  if (!res.ok) throw new Error(await readError(res, "Could not check progress"));
  return res.json();
}
