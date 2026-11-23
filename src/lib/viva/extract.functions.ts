import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildPrompt, type RawQuestion } from "@/lib/viva/booklet";

/**
 * Reads one part of a booklet with Gemini. The admin page cuts the booklet into parts and calls this once
 * per part; the Gemini key stays here on the server (GEMINI_API_KEY, a Cloudflare secret), never in the browser.
 * Only a signed-in admin may call it.
 */

const MODEL = "gemini-3.5-flash"; // the same model the Viva backend grades with
const RETRY_STATUSES = new Set([429, 503]);

const ITEM = {
  type: "OBJECT",
  properties: {
    chapter_no: { type: "INTEGER" },
    chapter: { type: "STRING" },
    topic: { type: "STRING" },
    concept: { type: "STRING" },
    question: { type: "STRING" },
    answer: { type: "STRING" },
    source: { type: "STRING" },
    diagram_required: { type: "BOOLEAN" },
  },
  required: ["chapter_no", "chapter", "topic", "concept", "question", "answer", "source", "diagram_required"],
};
const SCHEMA = { type: "OBJECT", properties: { questions: { type: "ARRAY", items: ITEM } }, required: ["questions"] };

const Input = z.object({
  text: z.string().min(1).max(60_000),
  place: z.object({ chapterNo: z.number().int().nullable(), chapter: z.string().max(200), topic: z.string().max(300) }),
  knownTopics: z.array(z.string().max(300)).max(80),
  knownConcepts: z.array(z.string().max(200)).max(300),
});

export const extractChunk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }): Promise<{ questions: RawQuestion[] }> => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!admin) throw new Error("Only an admin can read booklets.");

    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set on the server.");
    // GEMINI_API_BASE exists so tests can point this at a stand-in; production leaves it unset.
    const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";

    const body = JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(data.text, data.place, data.knownTopics, data.knownConcepts) }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA },
    });

    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${base}/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body,
      });
      if (res.ok) {
        const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        return { questions: (JSON.parse(text) as { questions?: RawQuestion[] }).questions ?? [] };
      }
      if (!RETRY_STATUSES.has(res.status) || attempt === 2) throw new Error(`Gemini answered ${res.status}.`);
      await new Promise((r) => setTimeout(r, 3000 * 2 ** attempt));
    }
  });
