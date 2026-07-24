import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Send, FileText, Check, Megaphone } from "lucide-react";
import { usePapers, uid, type MCQPaper, type MCQQuestion } from "@/lib/student-notes";

const SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology", "Economics", "English"];
const CLASSES = ["Class 9", "Class 10", "Class 11", "Class 12"];

function emptyQ(): MCQQuestion {
  return { id: uid(), text: "", options: ["", "", "", ""], correct: 0 };
}

export function PaperBuilderModal({
  open,
  onClose,
  author = "Teacher",
}: {
  open: boolean;
  onClose: () => void;
  author?: string;
}) {
  const [, setPapers] = usePapers();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [classLevel, setClassLevel] = useState("Class 11");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<MCQQuestion[]>([emptyQ()]);
  const [done, setDone] = useState<null | string>(null);

  const reset = () => {
    setTitle("");
    setSubject(SUBJECTS[0]);
    setClassLevel("Class 11");
    setDuration(30);
    setQuestions([emptyQ()]);
    setDone(null);
  };

  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const updateQ = (i: number, patch: Partial<MCQQuestion>) =>
    setQuestions((qs) => qs.map((q, j) => (i === j ? { ...q, ...patch } : q)));
  const updateOpt = (i: number, oi: number, val: string) =>
    setQuestions((qs) =>
      qs.map((q, j) => (i === j ? { ...q, options: q.options.map((o, k) => (k === oi ? val : o)) } : q)),
    );
  const removeQ = (i: number) =>
    setQuestions((qs) => (qs.length === 1 ? qs : qs.filter((_, j) => j !== i)));

  const canSave =
    title.trim().length > 0 &&
    questions.every((q) => q.text.trim() && q.options.every((o) => o.trim()));

  const broadcast = () => {
    if (!canSave) return;
    const paper: MCQPaper = {
      id: uid(),
      title: title.trim(),
      subject,
      classLevel,
      durationMin: duration,
      questions,
      broadcast: true,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      author,
    };
    setPapers((prev) => [paper, ...prev]);
    setDone(paper.title);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-orange/30 bg-cream-soft shadow-2xl dark:border-orange/30 dark:bg-[#0F172A]"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-navy/10 bg-gradient-to-r from-orange/15 to-gold/10 px-6 py-4 dark:border-white/10 dark:from-orange/20 dark:to-orange/5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-white shadow-glow">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-navy dark:text-cream">MCQ Paper Builder</h3>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-navy/60 dark:text-cream/60">
                    Build · Preview · Broadcast
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="grid h-9 w-9 place-items-center rounded-full text-navy/60 hover:bg-navy/10 dark:text-cream/70 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* body */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-5">
              {done ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 240 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-orange text-white shadow-glow"
                  >
                    <Megaphone className="h-7 w-7" />
                  </motion.div>
                  <h4 className="mt-4 text-2xl font-extrabold tracking-tight text-navy dark:text-cream">
                    Broadcast sent!
                  </h4>
                  <p className="mt-1 max-w-sm text-sm font-semibold text-navy/70 dark:text-cream/70">
                    "{done}" is now visible to {classLevel} students under <b>MCQ Tests</b>.
                  </p>
                  <button
                    onClick={close}
                    className="mt-6 rounded-full bg-orange px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-glow hover:bg-orange-soft"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* meta */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Paper title">
                      <input
                        value={title}
                        maxLength={120}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Mechanics, Rotational Motion"
                        className="pb-input"
                      />
                    </Field>
                    <Field label="Duration (min)">
                      <input
                        type="number"
                        min={5}
                        max={240}
                        value={duration}
                        onChange={(e) => setDuration(Math.max(5, Math.min(240, Number(e.target.value) || 30)))}
                        className="pb-input"
                      />
                    </Field>
                    <Field label="Subject">
                      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="pb-input">
                        {SUBJECTS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Class">
                      <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="pb-input">
                        {CLASSES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* questions */}
                  <div className="mt-6 space-y-4">
                    {questions.map((q, i) => (
                      <div
                        key={q.id}
                        className="rounded-2xl border-2 border-navy/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-orange">
                              Question {i + 1}
                            </div>
                            <input
                              value={q.text}
                              maxLength={500}
                              onChange={(e) => updateQ(i, { text: e.target.value })}
                              placeholder="Type the question…"
                              className="pb-input mt-2"
                            />
                          </div>
                          {questions.length > 1 && (
                            <button
                              onClick={() => removeQ(i)}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          {q.options.map((opt, oi) => {
                            const isCorrect = q.correct === oi;
                            return (
                              <div
                                key={oi}
                                className={`flex items-center gap-2 rounded-xl border-2 p-2 transition ${
                                  isCorrect
                                    ? "border-orange bg-orange/10 dark:bg-orange/20"
                                    : "border-navy/10 bg-white/70 dark:border-white/10 dark:bg-white/5"
                                }`}
                              >
                                <button
                                  onClick={() => updateQ(i, { correct: oi })}
                                  title="Mark as correct"
                                  className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                                    isCorrect
                                      ? "bg-orange text-white"
                                      : "bg-navy/10 text-navy hover:bg-navy/20 dark:bg-white/10 dark:text-cream dark:hover:bg-white/20"
                                  }`}
                                >
                                  {isCorrect ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + oi)}
                                </button>
                                <input
                                  value={opt}
                                  maxLength={300}
                                  onChange={(e) => updateOpt(i, oi, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                  className="w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:text-navy/40 dark:text-cream dark:placeholder:text-cream/40"
                                />
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-navy/50 dark:text-cream/50">
                          Tap a letter on the left to mark the correct answer.
                        </p>
                      </div>
                    ))}

                    <button
                      onClick={() => setQuestions((qs) => [...qs, emptyQ()])}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-orange/40 bg-orange/5 py-3 text-sm font-extrabold text-orange hover:bg-orange/10"
                    >
                      <Plus className="h-4 w-4" /> Add question
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* footer */}
            {!done && (
              <div className="flex items-center justify-between gap-3 border-t border-navy/10 bg-white/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs font-bold text-navy/60 dark:text-cream/60">
                  {questions.length} question{questions.length !== 1 ? "s" : ""}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={close}
                    className="rounded-xl border-2 border-navy/15 px-4 py-2.5 text-sm font-bold text-navy hover:bg-navy/5 dark:border-white/15 dark:text-cream dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={broadcast}
                    disabled={!canSave}
                    className="flex items-center gap-2 rounded-xl bg-orange px-5 py-2.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow hover:bg-orange-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Broadcast
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .pb-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 2px solid rgba(15,23,42,0.12);
          background: rgba(255,255,255,0.85);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #112D57;
          outline: none;
        }
        .pb-input:focus { border-color: var(--orange); }
        .dark .pb-input {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: var(--cream);
        }
        .dark .pb-input::placeholder { color: rgba(230,217,190,0.4); }
      `}</style>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-navy/60 dark:text-cream/60">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
