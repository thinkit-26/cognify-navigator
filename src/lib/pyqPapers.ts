import { supabase } from "@/integrations/supabase/client";

export const pyqFileUrl = (path: string) =>
  supabase.storage.from("pyqs").getPublicUrl(path).data.publicUrl;

export async function listPapers(cls: number, subject: string, year?: string) {
  let q = supabase.from("pyq_papers").select("*").eq("class_level", cls).eq("subject", subject);
  if (year) q = q.eq("year", year);
  const { data, error } = await q.order("year", { ascending: false });
  if (error) throw error;
  return data;
}
