import { supabase } from "@/integrations/supabase/client";

export const derivationFileUrl = (path: string) =>
  supabase.storage.from("derivations").getPublicUrl(path).data.publicUrl;

/** The chapters that have at least one derivation uploaded, for a class and subject. */
export async function listChapters(cls: number, subject: string) {
  const { data, error } = await supabase.from("derivations").select("chapter").eq("class_level", cls).eq("subject", subject);
  if (error) throw error;
  return [...new Set(data.map((d) => d.chapter))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export async function listDerivations(cls: number, subject: string, chapter?: string) {
  let q = supabase.from("derivations").select("*").eq("class_level", cls).eq("subject", subject);
  if (chapter) q = q.eq("chapter", chapter);
  // D1, D2, ... in order; one-off uploads without a number come after, oldest first.
  const { data, error } = await q.order("position", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
