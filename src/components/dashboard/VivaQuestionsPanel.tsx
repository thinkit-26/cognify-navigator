import { useEffect, useMemo, useRef, useState } from "react";
import { FileCheck2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { PyqPick as PickSelect } from "@/components/PyqPick";
import { extractBooklet, type DraftQuestion } from "@/lib/viva/extractBooklet";

type Bank = Pick<Tables<"viva_questions">, "id" | "chapter_no" | "chapter" | "topic" | "concept" | "question" | "answer">;
type Draft = DraftQuestion & { key: number; include: boolean };

const input =
  "w-full rounded-2xl border-2 border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";
const label = "mb-2 block text-xs font-bold tracking-[0.2em] text-orange";
const card = "rounded-2xl border border-border bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]";
const AUTO = "auto";
const NEW = "new";

function QuestionsManager() {
  const [bank, setBank] = useState<Bank[]>([]);
  const [error, setError] = useState("");

  const [chapterSel, setChapterSel] = useState<string>(AUTO);
  const [newNo, setNewNo] = useState("");
  const [newName, setNewName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [draft, setDraft] = useState<Draft[] | null>(null);
  const [saving, setSaving] = useState(false);
  const running = progress !== null;
  const cancelled = useRef(false);
  useEffect(() => () => void (cancelled.current = true), []);

  const loadBank = async () => {
    const { data, error: e } = await supabase
      .from("viva_questions")
      .select("id, chapter_no, chapter, topic, concept, question, answer")
      .eq("active", true)
      .order("chapter_no")
      .order("topic")
      .order("id")
      .limit(5000);
    if (e) return setError("Couldn't load the question bank. Try again.");
    setError("");
    setBank(data ?? []);
  };
  useEffect(() => {
    void loadBank();
  }, []);

  const chapters = useMemo(() => {
    const m = new Map<number, string>();
    bank.forEach((q) => m.set(q.chapter_no, q.chapter));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [bank]);

  // The chapter the admin forced, if any. "auto" lets the booklet's own headings decide.
  const forced = chapterSel === AUTO ? null : chapterSel === NEW ? { no: Number(newNo), name: newName.trim() } : { no: Number(chapterSel), name: chapters.find(([n]) => n === Number(chapterSel))?.[1] ?? "" };
  const forcedOk = chapterSel === AUTO || (!!forced && Number.isInteger(forced.no) && forced.no > 0 && !!forced.name);

  const extract = async () => {
    if (!file || !forcedOk) return;
    cancelled.current = false;
    setMsg("");
    setWarnings([]);
    setDraft(null);
    setProgress({ done: 0, total: 0 });
    try {
      const { questions: qs, warnings: w } = await extractBooklet(file, forced, bank, (done, total) => !cancelled.current && setProgress({ done, total }));
      if (cancelled.current) return;
      setWarnings(w);
      setDraft(qs.map((q, i) => ({ ...q, key: i, include: !q.duplicate })));
      const dupes = qs.filter((q) => q.duplicate).length;
      setMsg(`Found ${qs.length} questions${dupes ? `, ${dupes} already in the bank (left unticked)` : ""}.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not read the paper.");
    } finally {
      setProgress(null);
    }
  };

  const edit = (key: number, patch: Partial<Draft>) => setDraft((d) => d && d.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  const renameTopic = (chapterNo: number, from: string, to: string) =>
    setDraft((d) => d && d.map((q) => (q.chapter_no === chapterNo && q.topic === from ? { ...q, topic: to } : q)));

  const tree = useMemo(() => {
    const m = new Map<number, { name: string; topics: Map<string, Draft[]> }>();
    (draft ?? []).forEach((q) => {
      const c = m.get(q.chapter_no) ?? m.set(q.chapter_no, { name: q.chapter, topics: new Map() }).get(q.chapter_no)!;
      (c.topics.get(q.topic) ?? c.topics.set(q.topic, []).get(q.topic)!).push(q);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [draft]);
  const chosen = (draft ?? []).filter((q) => q.include);
  const incomplete = chosen.filter((q) => !q.answer.trim() || !q.question.trim() || !q.topic.trim()).length;
  const topicOptions = useMemo(() => [...new Set([...bank.map((q) => q.topic), ...(draft ?? []).map((q) => q.topic)])], [bank, draft]);

  const save = async () => {
    if (!chosen.length || incomplete) return;
    setSaving(true);
    setMsg("");
    const rows = chosen.map((q) => ({
      chapter_no: q.chapter_no,
      chapter: q.chapter,
      topic: q.topic.trim(),
      concept: q.concept,
      question: q.question.trim(),
      answer: q.answer.trim(),
      source: q.source,
      diagram_required: q.diagram_required,
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error: e } = await supabase.from("viva_questions").insert(rows.slice(i, i + 200));
      if (e) {
        setSaving(false);
        return setMsg(`Could not save (the first ${i} were saved): ${e.message}`);
      }
    }
    setSaving(false);
    setMsg(`Saved ${rows.length} questions. The Viva bot picks them up within a minute.`);
    setDraft(null);
    setFile(null);
    void loadBank();
  };

  const remove = async (q: Bank) => {
    if (!window.confirm(`Delete this question?\n\n${q.question}`)) return;
    const { error: e } = await supabase.from("viva_questions").delete().eq("id", q.id);
    if (e) return setError("Couldn't delete it. Try again.");
    void loadBank();
  };

  const byChapter = useMemo(() => {
    const m = new Map<number, { name: string; topics: Map<string, Bank[]> }>();
    bank.forEach((q) => {
      const c = m.get(q.chapter_no) ?? m.set(q.chapter_no, { name: q.chapter, topics: new Map() }).get(q.chapter_no)!;
      (c.topics.get(q.topic) ?? c.topics.set(q.topic, []).get(q.topic)!).push(q);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [bank]);

  return (
    <div className="w-full max-w-5xl space-y-8">
      <section className="space-y-5">
        <h2 className="text-lg font-black text-navy dark:text-cream">Add questions from a booklet</h2>
        <p className="text-sm text-navy/70 dark:text-cream/70">
          Upload the printed booklet (PDF or Word). Chapters, topics, answers and the NCERT or CBSE tags are read from it. Questions already in the bank are found and left unticked.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PickSelect
            label="CHAPTER"
            placeholder="Detect from the file"
            value={chapterSel}
            options={[
              { value: AUTO, label: "Detect from the file (recommended)" },
              ...chapters.map(([n, name]) => ({ value: String(n), label: `File is only chapter ${n}. ${name}` })),
              { value: NEW, label: "File is only a new chapter…" },
            ]}
            onChange={setChapterSel}
          />
          <div>
            <span className={label}>BOOKLET (PDF OR WORD)</span>
            <label className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-full border-2 border-dashed border-navy/30 bg-white px-5 text-sm font-bold text-navy transition hover:border-navy dark:bg-white/5 dark:text-cream">
              {file ? <FileCheck2 className="h-4 w-4 shrink-0 text-orange" /> : <Upload className="h-4 w-4 shrink-0 text-orange" />}
              <span className={`truncate ${file ? "" : "font-semibold text-navy/50 dark:text-cream/50"}`}>{file ? file.name : "Choose a file"}</span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setDraft(null);
                }}
              />
            </label>
          </div>
        </div>
        {chapterSel === NEW && (
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <div>
              <label className={label}>CHAPTER NO.</label>
              <input className={input} type="number" min={1} value={newNo} onChange={(e) => setNewNo(e.target.value)} placeholder="7" />
            </div>
            <div>
              <label className={label}>CHAPTER NAME</label>
              <input className={input} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. CARBON AND ITS COMPOUNDS" />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={extract}
          disabled={running || !file || !forcedOk}
          className="h-12 rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-10 text-sm font-bold text-white shadow-sm disabled:opacity-50"
        >
          {running ? "Reading the booklet…" : "Extract questions"}
        </button>
        {progress && (
          <div className="max-w-md" role="status">
            <div className="h-2 overflow-hidden rounded-full bg-navy/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-orange transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 4}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold text-navy/70 dark:text-cream/70">
              {progress.total ? `Part ${Math.min(progress.done + 1, progress.total)} of ${progress.total}. A full booklet takes a minute or two.` : "Reading the file…"}
            </p>
          </div>
        )}
        {msg && <p className="text-sm font-semibold text-navy dark:text-cream">{msg}</p>}
        {warnings.map((w) => (
          <p key={w} className="text-sm font-semibold text-amber-600">
            {w} Upload again to retry, or add those questions by hand.
          </p>
        ))}
      </section>

      {draft && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-navy dark:text-cream">
              Review: {chosen.length} of {draft.length} ticked
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setDraft((d) => d && d.map((q) => ({ ...q, include: !q.duplicate })))} className="text-xs font-bold text-orange hover:underline">
                Tick all new
              </button>
              <button type="button" onClick={() => setDraft((d) => d && d.map((q) => ({ ...q, include: false })))} className="text-xs font-bold text-orange hover:underline">
                Untick all
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || !chosen.length || incomplete > 0}
                className="h-11 rounded-full bg-navy px-8 text-sm font-bold text-white disabled:opacity-50 dark:bg-cream dark:text-navy"
              >
                {saving ? "Saving…" : `Save ${chosen.length} questions`}
              </button>
            </div>
          </div>
          {incomplete > 0 && (
            <p className="text-sm font-semibold text-rose-500">
              {incomplete} ticked question{incomplete === 1 ? " has" : "s have"} no answer or topic. Fill them in, or untick them, to save.
            </p>
          )}
          <datalist id="topic-options">
            {topicOptions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {tree.map(([no, c]) => (
            <details key={no} open className={card}>
              <summary className="cursor-pointer font-black text-navy dark:text-cream">
                {no}. {c.name} <span className="ml-2 text-xs font-bold text-navy/60 dark:text-cream/60">{[...c.topics.values()].flat().length} questions</span>
              </summary>
              <div className="mt-3 space-y-4">
                {[...c.topics.entries()].map(([topic, qs]) => (
                  <div key={topic}>
                    <div className="mb-2 flex items-center gap-3">
                      <input className={`${input} max-w-md font-bold`} list="topic-options" value={topic} onChange={(e) => renameTopic(no, topic, e.target.value)} aria-label="Topic name" />
                      <span className="text-xs font-bold text-navy/60 dark:text-cream/60">{qs.length} questions</span>
                    </div>
                    <ul className="space-y-3">
                      {qs.map((q) => (
                        <li key={q.key} className={`grid gap-2 rounded-xl bg-navy/[0.04] p-3 dark:bg-white/[0.05] ${q.include ? "" : "opacity-60"}`}>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-navy/70 dark:text-cream/70">
                            <label className="flex items-center gap-1.5">
                              <input type="checkbox" checked={q.include} onChange={(e) => edit(q.key, { include: e.target.checked })} /> Save this one
                            </label>
                            {q.duplicate && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Already in the bank</span>}
                            {q.source && <span className="rounded-full bg-navy/10 px-2 py-0.5 dark:bg-white/10">{q.source}</span>}
                          </div>
                          <textarea className={input} rows={2} value={q.question} onChange={(e) => edit(q.key, { question: e.target.value })} aria-label="Question" />
                          <textarea
                            className={`${input} ${q.answer.trim() || !q.include ? "" : "border-rose-400"}`}
                            rows={4}
                            value={q.answer}
                            placeholder="Model answer (required)"
                            onChange={(e) => edit(q.key, { answer: e.target.value })}
                            aria-label="Model answer"
                          />
                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-navy/70 dark:text-cream/70">
                            <label className="flex items-center gap-1.5">
                              <input type="checkbox" checked={q.diagram_required} onChange={(e) => edit(q.key, { diagram_required: e.target.checked })} /> Needs a diagram
                            </label>
                            <label className="flex items-center gap-1.5">
                              Move to
                              <input
                                className="w-48 rounded-full border border-navy/20 bg-white px-3 py-1 font-semibold dark:bg-white/5"
                                list="topic-options"
                                defaultValue=""
                                placeholder="topic…"
                                onBlur={(e) => {
                                  if (e.target.value.trim()) edit(q.key, { topic: e.target.value.trim() });
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button type="button" onClick={() => setDraft((d) => d && d.filter((x) => x.key !== q.key))} className="ml-auto flex items-center gap-1 text-rose-500">
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-black text-navy dark:text-cream">Question bank ({bank.length})</h2>
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        {byChapter.map(([no, c]) => (
          <details key={no} className={card}>
            <summary className="cursor-pointer font-black text-navy dark:text-cream">
              {no}. {c.name} <span className="ml-2 text-xs font-bold text-navy/60 dark:text-cream/60">{[...c.topics.values()].flat().length} questions</span>
            </summary>
            <div className="mt-3 space-y-3">
              {[...c.topics.entries()].map(([topic, qs]) => (
                <details key={topic} className="rounded-xl bg-navy/[0.04] p-3 dark:bg-white/[0.05]">
                  <summary className="cursor-pointer text-sm font-bold text-navy dark:text-cream">
                    {topic} <span className="ml-2 text-xs text-navy/60 dark:text-cream/60">{qs.length}</span>
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {qs.map((q) => (
                      <li key={q.id} className="flex items-start justify-between gap-3 text-sm text-navy dark:text-cream">
                        <span>{q.question}</span>
                        <button type="button" onClick={() => remove(q)} aria-label="Delete question" className="shrink-0 text-rose-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

export function VivaQuestionsPanel() {
  return (
    <AdminGate reason="manage Viva questions">
      <QuestionsManager />
    </AdminGate>
  );
}
