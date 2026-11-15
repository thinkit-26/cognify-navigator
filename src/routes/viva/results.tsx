import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import { getEvaluation } from "@/lib/viva/api";
import { logEvaluation } from "@/lib/viva/log";
import { useExamLock, isExamLocked } from "@/lib/viva/useExamLock";
import type { Evaluation } from "@/lib/viva/types";
import jsPDF from "jspdf";
import { requireVivaAccess } from "@/lib/viva/guard";
import { Eyebrow, VivaShell, vivaCard } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/results")({
  ssr: false, // the token lives in sessionStorage, so the check must run in the browser
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "Results, AI Oral Viva" }] }),
  component: ResultsPage,
});

function performanceLabel(score: number) {
  if (score >= 80) return { label: "Excellent performance", color: "bg-emerald-100 text-emerald-800" };
  if (score >= 60) return { label: "Good performance", color: "bg-lime-100 text-lime-800" };
  if (score >= 40) return { label: "Needs improvement", color: "bg-amber-100 text-amber-800" };
  return { label: "Needs a lot of practice", color: "bg-rose-100 text-rose-800" };
}

function ResultsPage() {
  const navigate = useNavigate();
  const { unlockExam } = useExamLock();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    if (!sessionId || !isExamLocked()) {
      navigate({ to: "/viva/gate" });
      return;
    }

    async function load() {
      try {
        const data = await getEvaluation(sessionId as string);

        if (data.status !== "ready") {
          navigate({ to: "/viva/evaluating" });
          return;
        }

        if (data.evaluation?.error) {
          setError(data.evaluation.error);
          return;
        }

        setEvaluation(data.evaluation);
        void logEvaluation(sessionId as string, data.evaluation);
        unlockExam();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      }
    }

    load();
  }, [navigate]);

  function handleDownload() {
    if (!evaluation) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("AI Oral Viva - Report", 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.text(`Overall Score: ${evaluation.overall_score}%`, 14, y);
    y += 8;
    doc.text(`Correct Answers: ${evaluation.correct_count} / ${evaluation.total_questions}`, 14, y);
    y += 8;
    doc.text(`Accuracy (on correct answers): ${evaluation.accuracy_of_correct}%`, 14, y);
    y += 12;

    doc.setFontSize(14);
    doc.text("Summary", 14, y);
    y += 8;
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(evaluation.overall_feedback, 180);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 6 + 8;

    doc.setFontSize(14);
    doc.text("Question Breakdown", 14, y);
    y += 8;

    evaluation.questions.forEach((q, i) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const qLines = doc.splitTextToSize(`${i + 1}. ${q.question}`, 180);
      doc.text(qLines, 14, y);
      y += qLines.length * 6 + 2;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      const answerLines = doc.splitTextToSize(
        `Your answer: ${q.student_answer || "No answer recorded"}`,
        180
      );
      doc.text(answerLines, 14, y);
      y += answerLines.length * 5 + 4;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Result: ${q.is_correct ? "Correct" : "Incorrect"} (Score: ${q.score}/10)`, 14, y);
      y += 6;

      const feedbackLines = doc.splitTextToSize(q.feedback, 180);
      doc.text(feedbackLines, 14, y);
      y += feedbackLines.length * 6 + 8;
    });

    doc.save("viva-report.pdf");
  }

  if (error) {
    return (
      <VivaShell>
        <div className={`${vivaCard} mx-auto max-w-xl p-10 text-center`}>
          <p className="font-bold text-rose-600">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate({ to: "/viva/history" })}>My results</Button>
            <Button variant="outline" onClick={() => navigate({ to: "/" })}>Return home</Button>
          </div>
        </div>
      </VivaShell>
    );
  }

  if (!evaluation) {
    return (
      <VivaShell>
        <p className="py-24 text-center font-semibold text-navy/60">Loading results...</p>
      </VivaShell>
    );
  }

  const performance = performanceLabel(evaluation.overall_score);
  const RING = 2 * Math.PI * 54;

  return (
    <VivaShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-md rounded-bl-md bg-navy p-8 text-white shadow-soft md:p-12"
      >
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="relative mx-auto grid h-44 w-44 place-items-center">
            <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="60" cy="60" r="54" fill="none" strokeWidth="9" stroke="rgba(255,255,255,0.15)" />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                stroke="#FBBF24"
                strokeDasharray={RING}
                initial={{ strokeDashoffset: RING }}
                animate={{ strokeDashoffset: RING * (1 - Math.min(100, evaluation.overall_score) / 100) }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="text-center">
              <div className="text-5xl font-black">{evaluation.overall_score}%</div>
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-white/60">OVERALL</div>
            </div>
          </div>
          <div>
            <Eyebrow className="!text-orange-glow">YOUR VIVA RESULT</Eyebrow>
            <div className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${performance.color}`}>{performance.label}</div>
            <p className="mt-4 text-lg text-white/80">
              {evaluation.correct_count} of {evaluation.total_questions} answers correct, {evaluation.accuracy_of_correct}% accuracy on the correct ones.
            </p>
            {evaluation.overall_feedback && <p className="mt-3 leading-relaxed text-white/65">{evaluation.overall_feedback}</p>}
          </div>
        </div>
      </motion.div>

      <h3 className="mb-5 mt-12 text-2xl font-extrabold text-navy dark:text-cream">Question by question</h3>
      <div className="space-y-5">
        {evaluation.questions.map((q, i) => (
          <motion.div
            key={q.question_id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${vivaCard} p-6`}
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div className="flex-1 font-bold text-navy dark:text-cream">
                <span className="mr-2 text-orange">Q{i + 1}.</span>
                {q.question}
              </div>
              <span
                className={`shrink-0 self-start rounded-full px-4 py-1.5 text-sm font-bold ${
                  q.is_correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}
              >
                {q.is_correct ? "Correct" : "Incorrect"} · {q.score}/10
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-secondary/70 p-4 text-sm text-navy/80 dark:text-cream/80">
              <span className="font-extrabold text-navy dark:text-cream">Your answer: </span>
              {q.student_answer || <span className="italic text-navy/40">No answer recorded</span>}
            </div>
            {q.feedback && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.feedback}</p>}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Button onClick={handleDownload}>Download report</Button>
        <Button variant="outline" onClick={() => navigate({ to: "/viva/history" })}>My results</Button>
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>Return home</Button>
      </div>
    </VivaShell>
  );
}
