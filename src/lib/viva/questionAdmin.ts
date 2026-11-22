import { supabase } from "@/integrations/supabase/client";
import { API_BASE } from "@/lib/viva/api";

export interface DraftQuestion {
  topic: string;
  concept: string | null;
  question: string;
  answer: string;
  diagram_required: boolean;
}

const EXTRACT_TIMEOUT_MS = 180_000; // reading a long paper with the AI can take a minute or two

/** Sends a paper to the backend, which reads it with the AI and returns draft questions to review. Saves nothing. */
export async function extractQuestions(file: File, chapterNo: number, chapter: string, knownTopics: string[]): Promise<DraftQuestion[]> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in again.");

  const form = new FormData();
  form.append("file", file);
  form.append("chapter_no", String(chapterNo));
  form.append("chapter", chapter);
  knownTopics.forEach((t) => form.append("known_topics", t));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/admin/extract-questions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.json().then((b) => (typeof b?.detail === "string" ? b.detail : ""), () => "");
      throw new Error(detail || `The server could not read the paper (${res.status}).`);
    }
    return (await res.json()).questions as DraftQuestion[];
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new Error("Reading the paper took too long. Try a smaller file.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
