import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/withTimeout";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { FilePill } from "@/components/dashboard/FilePill";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PYQ_SUBJECTS } from "@/data/pyqSubjects";
import { derivationFileUrl, listDerivations } from "@/lib/derivations";
import { findDerivations, readHeader, splitPdf, type FileHeader } from "@/lib/derivationSplit";
import { pdfPages } from "@/lib/pdfText";
import { readDerivationNames } from "@/lib/derivationNames";

type Item = Awaited<ReturnType<typeof listDerivations>>[number];
interface Row {
  index: number; // 0-based order in the file; the D number is the "number from" value plus this
  title: string;
  edited: boolean; // the admin changed the title, so the name read from the page must not replace it
  first: number;
  last: number;
  include: boolean | null; // null: left to the default, which is to skip a derivation already uploaded
}

const input =
  "h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";
const label = "mb-2 block text-xs font-bold tracking-[0.2em] text-orange";
const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() ?? "pdf";
const orangeBtn = "h-12 rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-10 text-sm font-bold text-white shadow-sm disabled:opacity-50";

function DerivationsForm() {
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState("");
  const [existing, setExisting] = useState<Item[]>([]);

  // whole-chapter upload
  const [chapterFile, setChapterFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [header, setHeader] = useState<FileHeader | null>(null);
  const [reading, setReading] = useState(false);
  const [start, setStart] = useState("1");
  const [names, setNames] = useState<{ done: number; total: number } | null>(null);
  const [nameWarn, setNameWarn] = useState("");
  const latestFile = useRef<File | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [chapterMsg, setChapterMsg] = useState("");

  // one derivation
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const subjects = cls ? PYQ_SUBJECTS[cls] : [];

  const refresh = () => {
    if (cls && subject) listDerivations(cls, subject).then(setExisting, () => setExisting([]));
    else setExisting([]);
  };
  useEffect(refresh, [cls, subject]);

  const chapters = useMemo(() => [...new Set(existing.map((d) => d.chapter))], [existing]);
  const have = useMemo(() => new Set(existing.filter((d) => d.chapter === chapter.trim() && d.position != null).map((d) => d.position)), [existing, chapter]);

  // The numbers restart from 1 in every chapter, whatever the numbers printed in the file. "Number from" is
  // there for a chapter that comes in more than one file.
  const startNo = Math.max(1, Math.trunc(Number(start)) || 1);
  const numberOf = (r: Row) => startNo + r.index;
  const isUploaded = (r: Row) => have.has(numberOf(r));
  const isChosen = (r: Row) => r.include ?? !isUploaded(r);

  const pickChapterFile = async (f: File | null) => {
    latestFile.current = f;
    setChapterFile(f);
    setRows(null);
    setHeader(null);
    setChapterMsg("");
    setNames(null);
    setNameWarn("");
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) return setChapterMsg("Choose a PDF.");
    setReading(true);
    try {
      const pages = await pdfPages(f);
      const found = findDerivations(pages);
      if (!found.length) return setChapterMsg('No derivations were found. Each one should start on a page with a header line like "D1".');
      setHeader(readHeader(pages));
      setRows(found.map((d, index) => ({ index, title: d.title, edited: false, first: d.first, last: d.last, include: null })));

      // The heading next to each D badge is drawn as shapes, not text, so it is read from a picture of the strip.
      const stale = () => latestFile.current !== f;
      setNames({ done: 0, total: found.length }); // uploading waits until the names are in
      readDerivationNames(
        f,
        found.map((d) => d.first),
        (i, name) => !stale() && setRows((rs) => rs && rs.map((r) => (r.index === i && !r.edited ? { ...r, title: name } : r))),
        (done, total) => !stale() && setNames(done < total ? { done, total } : null),
      )
        .catch(() => !stale() && setNameWarn("The headings next to D1, D2… could not be read from the pictures, so the text under each heading is used. Check the titles."))
        .finally(() => !stale() && setNames(null));
    } catch {
      setChapterMsg("That PDF could not be read.");
    } finally {
      setReading(false);
    }
  };

  const mismatch = [
    header?.classLevel && cls && header.classLevel !== cls ? `The file says Class ${header.classLevel}, but you chose Class ${cls}.` : "",
    header?.subject && subject && header.subject.toLowerCase() !== subject.toLowerCase() ? `The file says ${header.subject}, but you chose ${subject}.` : "",
  ].filter(Boolean);

  const chosen = (rows ?? []).filter(isChosen);
  const ready = !!cls && !!subject && !!chapter.trim();

  const uploadChapter = async () => {
    if (!ready || !chapterFile || !chosen.length) return;
    setProgress({ done: 0, total: chosen.length });
    setChapterMsg("");
    let done = 0;
    try {
      const parts = await splitPdf(new Uint8Array(await chapterFile.arrayBuffer()), chosen);
      for (let i = 0; i < chosen.length; i++) {
        const path = `${`${cls}/${subject}`.replace(/[^\w/-]+/g, "_")}/${crypto.randomUUID()}.pdf`;
        const { error: upErr } = await withTimeout(
          supabase.storage.from("derivations").upload(path, parts[i], { contentType: "application/pdf" }),
          120000,
          "An upload took too long. Check your connection.",
        );
        if (upErr) throw upErr;
        const { error } = await supabase.from("derivations").insert({
          class_level: cls!,
          subject: subject!,
          chapter: chapter.trim(),
          title: `D${numberOf(chosen[i])} · ${chosen[i].title.trim()}`,
          file_path: path,
          position: numberOf(chosen[i]),
        });
        if (error) {
          await supabase.storage.from("derivations").remove([path]);
          throw error;
        }
        setProgress({ done: ++done, total: chosen.length });
      }
      setChapterMsg(`Uploaded ${done} derivations. They are live on the Derivations page.`);
      setRows(null);
      setChapterFile(null);
    } catch (err) {
      setChapterMsg(`${err instanceof Error ? err.message : "Upload failed."} ${done} of ${chosen.length} were uploaded; the rest were not. Check the list below.`);
    } finally {
      setProgress(null);
      refresh();
    }
  };

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
    <div className="w-full max-w-5xl space-y-8">
      <div className="space-y-5">
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
        <div className="max-w-xl">
          <label className={label}>CHAPTER</label>
          <input className={input} list="derivation-chapters" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g. Electric Charges and Fields" />
          <datalist id="derivation-chapters">
            {chapters.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-navy dark:text-cream">Upload a whole chapter</h2>
        <p className="text-sm text-navy/70 dark:text-cream/70">
          Upload one PDF with all the derivations of the chapter. Each derivation should start on a page headed D1, D2, D3… and is split into its own file.
        </p>
        <div className="max-w-md">
          <FilePill label="CHAPTER PDF" file={chapterFile} onPick={pickChapterFile} />
        </div>
        {reading && <p className="text-sm font-semibold text-navy dark:text-cream">Reading the PDF…</p>}
        {mismatch.map((m) => (
          <p key={m} className="text-sm font-semibold text-amber-600">
            {m} Check the class and subject above.
          </p>
        ))}
        {nameWarn && <p className="text-sm font-semibold text-amber-600">{nameWarn}</p>}
        {rows && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-32">
                  <label className={label}>NUMBER FROM</label>
                  <input className={input} type="number" min={1} value={start} onChange={(e) => setStart(e.target.value)} aria-label="Number the first derivation as" />
                </div>
                <p className="max-w-md pb-3 text-sm font-bold text-navy dark:text-cream">
                  {rows.length} derivations: D{startNo} to D{startNo + rows.length - 1}. Fix any title, untick any you don't want.
                </p>
              </div>
              <button type="button" onClick={uploadChapter} disabled={!ready || !!progress || !!names || !chosen.length} className={orangeBtn}>
                {progress ? `Uploading ${progress.done} of ${progress.total}…` : names ? `Reading the headings ${names.done} of ${names.total}…` : `Upload ${chosen.length} derivations`}
              </button>
            </div>
            {!ready && <p className="text-sm font-semibold text-rose-500">Choose the class, the subject and type the chapter above first.</p>}
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.index} className={`flex flex-wrap items-center gap-3 rounded-2xl border border-border px-4 py-2 dark:border-white/10 ${isChosen(r) ? "" : "opacity-60"}`}>
                  <label className="flex items-center gap-2 text-sm font-black text-navy dark:text-cream">
                    <input type="checkbox" checked={isChosen(r)} onChange={(e) => setRows((rs) => rs && rs.map((x) => (x.index === r.index ? { ...x, include: e.target.checked } : x)))} />D{numberOf(r)}
                  </label>
                  <input
                    className="min-w-0 flex-1 rounded-full border-2 border-navy/20 bg-white px-4 py-1.5 text-sm text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream"
                    value={r.title}
                    onChange={(e) => setRows((rs) => rs && rs.map((x) => (x.index === r.index ? { ...x, title: e.target.value, edited: true } : x)))}
                    aria-label={`Title of D${numberOf(r)}`}
                  />
                  <span className="text-xs font-bold text-navy/60 dark:text-cream/60">{r.first === r.last ? `page ${r.first + 1}` : `pages ${r.first + 1} to ${r.last + 1}`}</span>
                  {isUploaded(r) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Already uploaded</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {chapterMsg && <p className="text-sm font-semibold text-navy dark:text-cream">{chapterMsg}</p>}
      </section>

      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-lg font-black text-navy dark:text-cream">Or add a single derivation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>DERIVATION</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Resistors in series" />
          </div>
          <FilePill label="FILE (PDF OR IMAGE)" file={file} onPick={setFile} />
        </div>
        <button disabled={busy} className={orangeBtn}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        {msg && <p className="text-sm font-semibold text-navy dark:text-cream">{msg}</p>}
      </form>

      {existing.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-black text-navy dark:text-cream">
            Uploaded ({existing.length})
          </h2>
          <ul className="space-y-2">
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
        </section>
      )}
    </div>
  );
}

export function DerivationsUploadPanel() {
  return (
    <AdminGate reason="upload derivations">
      <DerivationsForm />
    </AdminGate>
  );
}
