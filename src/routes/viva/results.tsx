import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import { getEvaluation } from "@/lib/viva/api";
import jsPDF from "jspdf";

export const Route = createFileRoute("/viva/results")({
  head: () => ({ meta: [{ title: "Results, AI Oral Viva" }] }),
  component: ResultsPage,
});

interface QuestionResult {
  question_id: number;
  question: string;
  student_answer: string;
  score: number;
  is_correct: boolean;
  feedback: string;
}

interface Evaluation {
  overall_score: number;
  overall_feedback: string;
  total_questions: number;
  correct_count: number;
  accuracy_of_correct: number;
  questions: QuestionResult[];
}

function ResultsPage() {
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    if (!sessionId) {
      navigate({ to: "/" });
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      }
    }

    load();
  }, [navigate]);

  function performanceLabel(score: number) {
    if (score >= 80) return { label: "Excellent Performance", color: "bg-green-100 text-green-700" };
    if (score >= 60) return { label: "Good Performance", color: "bg-green-100 text-green-700" };
    if (score >= 40) return { label: "Needs Improvement", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Poor Performance", color: "bg-red-100 text-red-700" };
  }

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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Button onClick={() => navigate({ to: "/" })}>Return Home</Button>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading results...
      </div>
    );
  }

  const performance = performanceLabel(evaluation.overall_score);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 pt-32 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg text-center mb-8"
        >
          <h2 className="text-xl text-gray-500 font-medium mb-2">Overall Score</h2>
          <div className="text-6xl font-bold text-orange-500 mb-4">
            {evaluation.overall_score}%
          </div>
          <div className={`inline-block px-4 py-2 rounded-full font-semibold ${performance.color}`}>
            {performance.label}
          </div>
          <p className="text-gray-500 mt-4">
            {evaluation.correct_count} / {evaluation.total_questions} correct &middot;{" "}
            {evaluation.accuracy_of_correct}% accuracy on correct answers
          </p>
        </motion.div>

        <div className="space-y-4 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Question Summary</h3>
          {evaluation.questions.map((q, i) => (
            <motion.div
              key={q.question_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 text-gray-700 font-medium">{q.question}</div>
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                    q.is_correct
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {q.is_correct ? "Correct" : "Incorrect"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-500">Your answer: </span>
                {q.student_answer || (
                  <span className="italic text-gray-400">No answer recorded</span>
                )}
              </div>

              {q.feedback && (
                <p className="text-sm text-gray-500 italic">{q.feedback}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>
            Return Home
          </Button>
          <Button onClick={handleDownload}>Download Report</Button>
        </div>
      </main>
    </div>
  );
}
