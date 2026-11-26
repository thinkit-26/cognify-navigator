import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildPrompt, type RawQuestion } from "@/lib/viva/booklet";

/**
 * Gemini calls for the admin tools: reading a part of a Viva booklet, and reading the headings of derivations
 * from pictures. The Gemini key stays here on the server (GEMINI_API_KEY, a Cloudflare secret), never in the
 * browser. Only a signed-in admin may call these.
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

type Context = { supabase: { from: (t: "user_roles") => any }; userId: string };

async function requireAdmin(context: Context) {
  const { data: admin } = await context.supabase.from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  if (!admin) throw new Error("Only an admin can use this.");
}

/** One Gemini call that must answer in the given JSON shape; retried when Gemini is busy. */
async function askGemini<T>(parts: unknown[], schema: unknown): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set on the server.");
  // GEMINI_API_BASE exists so tests can point this at a stand-in; production leaves it unset.
  const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
  const body = JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json", responseSchema: schema } });

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${base}/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body,
    });
    if (res.ok) {
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      return JSON.parse(json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "") as T;
    }
    if (!RETRY_STATUSES.has(res.status) || attempt === 2) throw new Error(`Gemini answered ${res.status}.`);
    await new Promise((r) => setTimeout(r, 3000 * 2 ** attempt));
  }
}

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
    await requireAdmin(context);
    const { questions } = await askGemini<{ questions?: RawQuestion[] }>(
      [{ text: buildPrompt(data.text, data.place, data.knownTopics, data.knownConcepts) }],
      SCHEMA,
    );
    return { questions: questions ?? [] };
  });

const HeadingsInput = z.object({ images: z.array(z.string().min(1).max(400_000)).min(1).max(8) });
const NAMES_SCHEMA = { type: "OBJECT", properties: { names: { type: "ARRAY", items: { type: "STRING" } } }, required: ["names"] };

/**
 * The heading beside the D badge on each derivation page is drawn as shapes, not text, so it cannot be copied
 * out of the PDF. The admin page sends a thin picture of each page's top strip and this reads the heading in it.
 */
export const readHeadings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => HeadingsInput.parse(data))
  .handler(async ({ data, context }): Promise<{ names: string[] }> => {
    await requireAdmin(context);
    const n = data.images.length;
    const parts: unknown[] = [
      {
        text:
          `Each of the ${n} images below is a thin strip from the top of one page of a physics derivations booklet. ` +
          "It shows a rounded badge with a D number (like D65) and, to the right of the badge, a short heading in small bold blue text. " +
          "For each image, in order, return that heading exactly as written, without the D number. " +
          "Ignore any other text in the strip. If an image has no such heading, return an empty string for it. " +
          `Answer with exactly ${n} entries.`,
      },
    ];
    data.images.forEach((image, i) => parts.push({ text: `Image ${i + 1}:` }, { inline_data: { mime_type: "image/jpeg", data: image } }));
    const { names } = await askGemini<{ names?: string[] }>(parts, NAMES_SCHEMA);
    return { names: (names ?? []).map((x) => String(x ?? "").trim()) };
  });
