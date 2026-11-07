import { supabase } from "@/integrations/supabase/client";

export const pyqFileUrl = (path: string) =>
  supabase.storage.from("pyqs").getPublicUrl(path).data.publicUrl;

export async function listPapers(cls: number, subject: string) {
  const { data, error } = await supabase
    .from("pyq_papers")
    .select("*")
    .eq("class_level", cls)
    .eq("subject", subject)
    .order("year", { ascending: false });
  if (error) throw error;
  return data;
}
