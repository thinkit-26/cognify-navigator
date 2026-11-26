import { supabase } from "@/integrations/supabase/client";
import { byChapterOrder, type ChapterOption } from "@/lib/chapters";

export const derivationFileUrl = (path: string) =>
  supabase.storage.from("derivations").getPublicUrl(path).data.publicUrl;

/** The chapters that have at least one derivation uploaded, for a class and subject, in book order. */
export async function listChapters(cls: number, subject: string): Promise<ChapterOption[]> {
  const { data, error } = await supabase.from("derivations").select("chapter, chapter_no").eq("class_level", cls).eq("subject", subject);
  if (error) throw error;
  const seen = new Map<string, ChapterOption>();
  for (const d of data) if (!seen.has(d.chapter)) seen.set(d.chapter, { no: d.chapter_no, name: d.chapter });
  return [...seen.values()].sort(byChapterOrder);
}

export async function listDerivations(cls: number, subject: string, chapter?: string) {
  let q = supabase.from("derivations").select("*").eq("class_level", cls).eq("subject", subject);
  if (chapter) q = q.eq("chapter", chapter);
  // D1, D2, ... in order; one-off uploads without a number come after, oldest first.
  const { data, error } = await q.order("position", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
