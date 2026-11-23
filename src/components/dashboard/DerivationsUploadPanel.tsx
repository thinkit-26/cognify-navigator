import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/withTimeout";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { FilePill } from "@/components/dashboard/FilePill";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PYQ_SUBJECTS } from "@/data/pyqSubjects";
import { derivationFileUrl, listDerivations } from "@/lib/derivations";

type Item = Awaited<ReturnType<typeof listDerivations>>[number];

const input =
  "h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";
const label = "mb-2 block text-xs font-bold tracking-[0.2em] text-orange";
const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() ?? "pdf";

function DerivationsForm() {
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<Item[]>([]);

  const subjects = cls ? PYQ_SUBJECTS[cls] : [];

  const refresh = () => {
    if (cls && subject) listDerivations(cls, subject).then(setExisting, () => setExisting([]));
    else setExisting([]);
  };
  useEffect(refresh, [cls, subject]);

  const chapters = useMemo(() => [...new Set(existing.map((d) => d.chapter))], [existing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !subject || !file || !chapter.trim() || !title.trim()) return setMsg("Fill every field and choose the file.");
    setBusy(true);
    setMsg("");
    try {
      const path = `${`${cls}/${subject}`.replace(/[^\w/-]+/g, "_")}/${crypto.randomUUID()}.${ext(file)}`;
      const { error: upErr } = await withTimeout(
        supabase.storage.from("derivations").upload(path, file, { contentType: file.type }),
        180000,
        "The upload is taking too long. Check your connection and try again.",
      );
      if (upErr) throw upErr;
      const { error } = await withTimeout(
        supabase.from("derivations").insert({ class_level: cls, subject, chapter: chapter.trim(), title: title.trim(), file_path: path }),
        30000,
        "Saving timed out. Check the list below before trying again.",
      );
      if (error) throw error;
      setMsg("Uploaded. It is now live on the Derivations page.");
      setTitle("");
      setFile(null);
      refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (d: Item) => {
    if (!window.confirm(`Delete "${d.title}"?`)) return;
    await supabase.storage.from("derivations").remove([d.file_path]);
    await supabase.from("derivations").delete().eq("id", d.id);
    refresh();
  };

  return (
    <form onSubmit={submit} className="w-full max-w-5xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Pick
          label="CLASS"
          placeholder="Select class"
          value={cls ? String(cls) : null}
          options={[9, 10, 11, 12].map((c) => ({ value: String(c), label: `Class ${c}` }))}
          onChange={(v) => {
            setCls(Number(v));
            setSubject(null);
          }}
        />
        <Pick label="SUBJECT" placeholder="Select subject" disabled={!cls} value={subject} options={subjects.map((x) => ({ value: x, label: x }))} onChange={setSubject} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>CHAPTER</label>
          <input className={input} list="derivation-chapters" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g. Electricity" />
          <datalist id="derivation-chapters">
            {chapters.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={label}>DERIVATION</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Resistors in series" />
        </div>
      </div>
      <div className="max-w-md">
        <FilePill label="FILE (PDF OR IMAGE)" file={file} onPick={setFile} />
      </div>
      <button disabled={busy} className="h-12 rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-10 text-sm font-bold text-white shadow-sm disabled:opacity-50">
        {busy ? "Uploading…" : "Upload"}
      </button>
      {msg && <p className="text-sm font-semibold text-navy dark:text-cream">{msg}</p>}

      {existing.length > 0 && (
        <ul className="space-y-2 pt-4">
          {existing.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-2 text-sm dark:border-white/10">
              <span className="min-w-0 font-bold text-navy dark:text-cream">
                {d.chapter} · {d.title}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <a href={derivationFileUrl(d.file_path)} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange hover:underline">
                  Open
                </a>
                <button type="button" onClick={() => remove(d)} className="text-xs font-bold text-rose-500">
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export function DerivationsUploadPanel() {
  return (
    <AdminGate reason="upload derivations">
      <DerivationsForm />
    </AdminGate>
  );
}
