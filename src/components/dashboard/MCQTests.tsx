import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Clock, Send, Sparkles, ArrowRight, ArrowLeft, X, Trophy, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { usePapers, useAttempts, uid, type MCQPaper, type MCQAttempt } from "@/lib/student-notes";

export function MCQTestsPanel({ studentId }: { studentId: string }) {
  const [papers] = usePapers();
  const [attempts] = useAttempts();
  const [activePaper, setActivePaper] = useState<MCQPaper | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<MCQAttempt | null>(null);

  const broadcast = papers.filter((p) => p.broadcast);
  const myAttempts = attempts.filter((a) => a.studentId === studentId);
  const attemptByPaper = useMemo(() => {
    const map = new Map<string, MCQAttempt>();
    for (const a of myAttempts) {
      const ex = map.get(a.paperId);
      if (!ex || new Date(a.submittedAt) > new Date(ex.submittedAt)) map.set(a.paperId, a);
    }
    return map;
  }, [myAttempts]);

  return (
    <>
      <GlassCard
        title="MCQ Tests"
        subtitle={broadcast.length === 0 ? "Nothing live yet, your teacher will broadcast soon" : "Live papers from your teachers"}
        icon={<ClipboardCheck className="h-4 w-4 text-orange" />}
      >
        {broadcast.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange/15 text-orange">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-navy/70 dark:text-cream/70">
              No papers broadcast yet. Check back after class.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {broadcast.map((p) => {
              const att = attemptByPaper.get(p.id);
              const pct = att ? Math.round((att.score / att.total) * 100) : null;
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-navy/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange">
                        {p.subject}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-navy/60 dark:text-cream/60">
                        {p.classLevel} · {p.questions.length} Qs · {p.durationMin} min
                      </span>
                    </div>
                    <div className="mt-1 truncate text-base font-extrabold text-navy dark:text-cream">{p.title}</div>
                    <div className="text-[11px] font-bold text-navy/50 dark:text-cream/50">
                      Set by {p.author} · {p.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pct !== null && (
                      <button
                        onClick={() => setReviewAttempt(att!)}
                        className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                          pct >= 80 ? "bg-orange/15 text-orange" : "bg-navy/10 text-navy dark:bg-white/10 dark:text-cream"
                        }`}
                      >
                        {pct}% · Review
                      </button>
                    )}
                    <button
                      onClick={() => setActivePaper(p)}
                      className="flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-glow hover:bg-orange-soft"
                    >
                      {pct !== null ? <RotateCcw className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      {pct !== null ? "Retake" : "Attempt"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>

      {activePaper && (
        <MCQPlayer
          paper={activePaper}
          studentId={studentId}
          onClose={() => setActivePaper(null)}
        />
      )}

      {reviewAttempt && (
        <ReviewModal
          attempt={reviewAttempt}
          paper={broadcast.find((p) => p.id === reviewAttempt.paperId)!}
          onClose={() => setReviewAttempt(null)}
        />
      )}
    </>
  );
}

function MCQPlayer({
  paper,
  studentId,
  onClose,
}: {
  paper: MCQPaper;
  studentId: string;
  onClose: () => void;
}) {
  const [, setAttempts] = useAttempts();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [submitted, setSubmitted] = useState<MCQAttempt | null>(null);

  const q = paper.questions[idx];
  const total = paper.questions.length;
  const selected = answers[q.id];
  const isLast = idx === total - 1;

  const submit = () => {
    let score = 0;
    for (const qq of paper.questions) {
      if (answers[qq.id] === qq.correct) score++;
    }
    const attempt: MCQAttempt = {
      id: uid(),
      paperId: paper.id,
      studentId,
      answers,
      score,
      total,
      submittedAt: new Date().toISOString(),
    };
    setAttempts((prev) => [attempt, ...prev]);
    setSubmitted(attempt);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-orange/30 bg-cream-soft shadow-2xl dark:border-orange/30 dark:bg-[#0F172A]"
        >
          {submitted ? (
            <ResultScreen attempt={submitted} paper={paper} onClose={onClose} />
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-navy/10 bg-gradient-to-r from-orange/15 to-gold/10 px-6 py-4 dark:border-white/10 dark:from-orange/20 dark:to-orange/5">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-orange">
                    <Clock className="h-3 w-3" /> {paper.subject} · {paper.durationMin} min
                  </div>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight text-navy dark:text-cream">{paper.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-full text-navy/60 hover:bg-navy/10 dark:text-cream/70 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* progress */}
              <div className="px-6 pt-4">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy/60 dark:text-cream/60">
                  <span>Question {idx + 1} of {total}</span>
                  <span>{Object.keys(answers).length} answered</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange to-gold transition-all"
                    style={{ width: `${((idx + 1) / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* question */}
              <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                <motion.div key={q.id} initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <h4 className="text-base font-extrabold leading-snug text-navy dark:text-cream md:text-lg">
                    {q.text}
                  </h4>
                  <div className="mt-4 space-y-2.5">
                    {q.options.map((opt, oi) => {
                      const active = selected === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                          className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition ${
                            active
                              ? "border-orange bg-orange/10 dark:bg-orange/20"
                              : "border-navy/10 bg-white/70 hover:border-orange/40 hover:bg-orange/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-orange/40 dark:hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                              active
                                ? "bg-orange text-white"
                                : "bg-navy/10 text-navy dark:bg-white/10 dark:text-cream"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="pt-1 text-sm font-semibold text-navy dark:text-cream">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between border-t border-navy/10 bg-white/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0}
                  className="flex items-center gap-2 rounded-xl border-2 border-navy/15 px-4 py-2 text-sm font-bold text-navy hover:bg-navy/5 disabled:opacity-40 dark:border-white/15 dark:text-cream dark:hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </button>
                {isLast ? (
                  <button
                    onClick={submit}
                    disabled={Object.keys(answers).length === 0}
                    className="flex items-center gap-2 rounded-xl bg-orange px-5 py-2.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow hover:bg-orange-soft disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Submit
                  </button>
                ) : (
                  <button
                    onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                    className="flex items-center gap-2 rounded-xl bg-orange px-5 py-2.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow hover:bg-orange-soft"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ResultScreen({ attempt, paper, onClose }: { attempt: MCQAttempt; paper: MCQPaper; onClose: () => void }) {
  const pct = Math.round((attempt.score / attempt.total) * 100);
  return (
    <div className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220 }}
          className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-orange to-gold text-white shadow-glow"
        >
          <Trophy className="h-9 w-9" />
        </motion.div>
        <div className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.3em] text-orange">Result</div>
        <div className="mt-1 text-5xl font-extrabold text-navy dark:text-cream">{pct}%</div>
        <div className="mt-1 text-sm font-bold text-navy/70 dark:text-cream/70">
          {attempt.score} of {attempt.total} correct
        </div>
      </div>

      <div className="mt-6 max-h-[40vh] overflow-y-auto">
        <ul className="space-y-2">
          {paper.questions.map((q, i) => {
            const sel = attempt.answers[q.id];
            const ok = sel === q.correct;
            return (
              <li key={q.id} className="rounded-xl border border-navy/10 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${ok ? "bg-orange text-white" : "bg-destructive text-white"}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-navy dark:text-cream">{q.text}</div>
                    <div className="mt-0.5 text-[11px] text-navy/70 dark:text-cream/70">
                      Your answer: <b className={ok ? "text-orange" : "text-destructive"}>{sel !== undefined ? q.options[sel] : "-"}</b>
                      {!ok && <> · Correct: <b className="text-orange">{q.options[q.correct]}</b></>}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full rounded-xl bg-orange py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow hover:bg-orange-soft"
      >
        Close
      </button>
    </div>
  );
}

function ReviewModal({ attempt, paper, onClose }: { attempt: MCQAttempt; paper: MCQPaper; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-orange/30 bg-cream-soft shadow-2xl dark:border-orange/30 dark:bg-[#0F172A]"
        >
          <ResultScreen attempt={attempt} paper={paper} onClose={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
