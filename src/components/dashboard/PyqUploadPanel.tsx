import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PYQ_CHAPTERS } from "@/data/pyqChapters";
import { listPapers } from "@/lib/pyqPapers";

type Paper = Awaited<ReturnType<typeof listPapers>>[number];

const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() ?? "pdf";

export function PyqUploadPanel() {
  // writes are enforced by Supabase RLS, so this needs a real admin session, not the cheat-code login
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
  const [paper, setPaper] = useState<File | null>(null);
  const [solution, setSolution] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<Paper[]>([]);

  const subjects = cls ? Object.keys(PYQ_CHAPTERS[cls]) : [];
  const chapters = cls && subject ? PYQ_CHAPTERS[cls][subject] : [];

  const refresh = () => {
    if (cls && subject && chapter) listPapers(cls, subject, chapter).then(setExisting, () => setExisting([]));
    else setExisting([]);
  };
  useEffect(refresh, [cls, subject, chapter]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setIsAdmin(false);
      const { data: row } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!row);
    });
  }, []);

  const signIn = () =>
    supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });

  const upload = async (file: File, folder: string) => {
    const path = `${folder}/${crypto.randomUUID()}.${ext(file)}`;
    const { error } = await supabase.storage.from("pyqs").upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !subject || !chapter || !paper || !exam.trim() || !year) return setMsg("Fill every field and choose the paper file.");
    setBusy(true);
    setMsg("");
    try {
      const folder = `${cls}/${subject}`.replace(/[^\w/-]+/g, "_");
      const paper_path = await upload(paper, folder);
      const solution_path = solution ? await upload(solution, folder) : null;
      const { error } = await supabase.from("pyq_papers").insert({
        class_level: cls, subject, chapter, exam: exam.trim(), year: Number(year), paper_path, solution_path,
      });
      if (error) throw error;
      setMsg("Uploaded. It is now live on the PYQ's page.");
      setPaper(null);
      setSolution(null);
      refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Paper) => {
    await supabase.storage.from("pyqs").remove([p.paper_path, ...(p.solution_path ? [p.solution_path] : [])]);
    await supabase.from("pyq_papers").delete().eq("id", p.id);
    refresh();
  };

  if (isAdmin === null) return <p className="text-navy/60 dark:text-cream/60">Checking access…</p>;
  if (!isAdmin)
    return (
      <div className="max-w-md space-y-3">
        <p className="text-navy dark:text-cream">Uploading needs a Supabase admin account. Sign in with it to continue.</p>
        <button onClick={signIn} className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white dark:bg-cream dark:text-navy">
          Sign in with Google
        </button>
      </div>
    );

  const input = "h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";
  const label = "mb-2 block text-xs font-bold tracking-[0.2em] text-orange";
  return (
    <form onSubmit={submit} className="max-w-4xl space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Pick label="CLASS" placeholder="Select class" value={cls ? String(cls) : null}
          options={[9, 10, 11, 12].map((c) => ({ value: String(c), label: `Class ${c}` }))}
          onChange={(v) => { setCls(Number(v)); setSubject(null); setChapter(null); }} />
        <Pick label="SUBJECT" placeholder="Select subject" disabled={!cls} value={subject}
          options={subjects.map((x) => ({ value: x, label: x }))}
          onChange={(v) => { setSubject(v); setChapter(null); }} />
        <Pick label="CHAPTER" placeholder="Select chapter" disabled={!subject} value={chapter}
          options={chapters.map((x, i) => ({ value: x, label: `${i + 1}. ${x}` }))} onChange={setChapter} />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="sm:flex-1"><label className={label}>EXAM</label>
          <input className={input} value={exam} onChange={(e) => setExam(e.target.value)} placeholder="e.g. CBSE Board" /></div>
        <div className="sm:flex-1"><label className={label}>YEAR</label>
          <input className={input} type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" /></div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="sm:flex-1"><label className={label}>QUESTION PAPER (PDF)</label>
          <input type="file" accept="application/pdf,image/*" onChange={(e) => setPaper(e.target.files?.[0] ?? null)} className="text-sm text-navy dark:text-cream" /></div>
        <div className="sm:flex-1"><label className={label}>SOLUTION (PDF, optional)</label>
          <input type="file" accept="application/pdf,image/*" onChange={(e) => setSolution(e.target.files?.[0] ?? null)} className="text-sm text-navy dark:text-cream" /></div>
      </div>
      <button disabled={busy} className="rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
        {busy ? "Uploading…" : "Upload"}
      </button>
      {msg && <p className="text-sm font-semibold text-navy dark:text-cream">{msg}</p>}

      {existing.length > 0 && (
        <ul className="space-y-2 pt-4">
          {existing.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-2 text-sm dark:border-white/10">
              <span className="font-bold text-navy dark:text-cream">{p.exam} · {p.year}{p.solution_path ? " · with solution" : ""}</span>
              <button type="button" onClick={() => remove(p)} className="text-xs font-bold text-rose-500">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
