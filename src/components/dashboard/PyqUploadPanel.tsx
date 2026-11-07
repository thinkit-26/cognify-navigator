import { useEffect, useState } from "react";
import { FileCheck2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PYQ_CHAPTERS } from "@/data/pyqChapters";
import { listPapers } from "@/lib/pyqPapers";

type Paper = Awaited<ReturnType<typeof listPapers>>[number];

function FilePill({ label, file, onPick }: { label: string; file: File | null; onPick: (f: File | null) => void }) {
  return (
    <div className="min-w-0">
      <span className="mb-2 block text-xs font-bold tracking-[0.2em] text-orange">{label}</span>
      <label className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-full border-2 border-dashed border-navy/30 bg-white px-5 text-sm font-bold text-navy transition hover:border-navy dark:bg-white/5 dark:text-cream">
        {file ? <FileCheck2 className="h-4 w-4 shrink-0 text-orange" /> : <Upload className="h-4 w-4 shrink-0 text-orange" />}
        <span className={`truncate ${file ? "" : "font-semibold text-navy/50 dark:text-cream/50"}`}>{file ? file.name : "Choose a file"}</span>
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() ?? "pdf";

export function PyqUploadPanel() {
  // writes are enforced by Supabase RLS, so this needs a real admin session, not the cheat-code login
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
  const [paper, setPaper] = useState<File | null>(null);
  const [solution, setSolution] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<Paper[]>([]);

  const subjects = cls ? Object.keys(PYQ_CHAPTERS[cls]) : [];

  const refresh = () => {
    if (cls && subject) listPapers(cls, subject).then(setExisting, () => setExisting([]));
    else setExisting([]);
  };
  useEffect(refresh, [cls, subject]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setIsAdmin(false);
    const { data: row } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!row);
    if (!row) setAuthMsg("This account is not an admin.");
  };
  useEffect(() => {
    checkAdmin();
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setAuthMsg(error.message);
    checkAdmin();
  };

  const upload = async (file: File, folder: string) => {
    const path = `${folder}/${crypto.randomUUID()}.${ext(file)}`;
    const { error } = await supabase.storage.from("pyqs").upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !subject || !paper || !exam.trim() || !year.trim()) return setMsg("Fill every field and choose the paper file.");
    if (!/^\d{4}(-\d{2})?$/.test(year.trim())) return setMsg("Year looks like 2025 or 2025-26.");
    setBusy(true);
    setMsg("");
    try {
      const folder = `${cls}/${subject}`.replace(/[^\w/-]+/g, "_");
      const paper_path = await upload(paper, folder);
      const solution_path = solution ? await upload(solution, folder) : null;
      const { error } = await supabase.from("pyq_papers").insert({
        class_level: cls, subject, exam: exam.trim(), year: year.trim(), paper_path, solution_path,
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
  if (!isAdmin) {
    const field = "h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";
    return (
      <form onSubmit={signIn} className="max-w-sm space-y-3">
        <p className="text-navy dark:text-cream">Sign in with your Supabase admin account to upload papers.</p>
        <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white dark:bg-cream dark:text-navy">Sign in</button>
        {authMsg && <p className="text-sm font-semibold text-rose-500">{authMsg}</p>}
      </form>
    );
  }

  const input = "h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";
  const label = "mb-2 block text-xs font-bold tracking-[0.2em] text-orange";
  return (
    <form onSubmit={submit} className="w-full max-w-5xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Pick label="CLASS" placeholder="Select class" value={cls ? String(cls) : null}
          options={[9, 10, 11, 12].map((c) => ({ value: String(c), label: `Class ${c}` }))}
          onChange={(v) => { setCls(Number(v)); setSubject(null); }} />
        <Pick label="SUBJECT" placeholder="Select subject" disabled={!cls} value={subject}
          options={subjects.map((x) => ({ value: x, label: x }))}
          onChange={setSubject} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={label}>EXAM</label>
          <input className={input} value={exam} onChange={(e) => setExam(e.target.value)} placeholder="e.g. CBSE Board" /></div>
        <div><label className={label}>YEAR</label>
          <input className={input} value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2025-26" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FilePill label="QUESTION PAPER (PDF)" file={paper} onPick={setPaper} />
        <FilePill label="SOLUTION (PDF, OPTIONAL)" file={solution} onPick={setSolution} />
      </div>
      <button disabled={busy} className="h-12 rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-10 text-sm font-bold text-white shadow-sm disabled:opacity-50">
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
