import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import MicrophoneContainer, { RecordingPhase } from "@/components/viva/MicrophoneContainer";
import { getQuestion, submitAnswer } from "@/lib/viva/api";
import { logAnswer } from "@/lib/viva/log";
import type { VivaQuestion } from "@/lib/viva/types";
import { requireVivaAccess } from "@/lib/viva/guard";
import { Eyebrow, VivaShell, vivaCard } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/viva")({
  ssr: false, // the token lives in sessionStorage, so the check must run in the browser
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "AI Oral Viva, Cognify Institute" }] }),
  component: VivaPage,
});

const ANSWER_TIME = 45;
const MIN_READING_TIME = 3;
const MAX_READING_TIME = 8;

function computeReadingTime(questionText: string): number {
  const wordCount = questionText.trim().split(/\s+/).length;
  return Math.min(MAX_READING_TIME, Math.max(MIN_READING_TIME, Math.ceil(wordCount * 0.5)));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function VivaPage() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState<VivaQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [phase, setPhase] = useState<RecordingPhase>("reading");
  const [timeLeft, setTimeLeft] = useState(MIN_READING_TIME);

  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(localStorage.getItem("sessionId"));
  }, []);

  function resetToReading(questionText: string) {
    setTranscript("");
    transcriptRef.current = "";
    setPhase("reading");
    setTimeLeft(computeReadingTime(questionText));
  }

  async function loadQuestion() {
    if (!sessionId) return;

    try {
      const data = await getQuestion(sessionId);

      if (data.status === "completed") {
        navigate({ to: "/viva/evaluating" });
        return;
      }

      setQuestion(data.question);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      resetToReading(data.question.question);
    } catch {
      // network or server error — stay on page, user can retry via Next
    }
  }

  useEffect(() => {
    if (sessionId) loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Master countdown — advances phase automatically when it hits 0
  useEffect(() => {
    if (phase === "processing") return;

    if (timeLeft <= 0) {
      if (phase === "reading") {
        setPhase("recording");
        setTimeLeft(ANSWER_TIME);
      } else if (phase === "recording") {
        setPhase("processing");
      }
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase]);

  function handleTranscriptChange(text: string) {
    setTranscript(text);
    transcriptRef.current = text;
  }

  async function handleTranscriptionDone() {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);

    const answerToSubmit = transcriptRef.current.trim() || "No answer recorded";

    try {
      const response = await submitAnswer(sessionId, answerToSubmit);
      if (question) void logAnswer(sessionId, question, questionNumber, answerToSubmit);

      if (response.status === "completed") {
        navigate({ to: "/viva/evaluating" });
        return;
      }

      setQuestion(response.next_question);
      setQuestionNumber(response.question_number);
      setTotalQuestions(response.total_questions);
      resetToReading(response.next_question.question);
    } catch {
      // submit failed — stay on page, user can retry
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleManualAdvance() {
    if (phase !== "recording") return;
    setPhase("processing");
  }

  if (!question) {
    return (
      <VivaShell step={3}>
        <p className="py-24 text-center font-semibold text-navy/60">Loading question...</p>
      </VivaShell>
    );
  }

  const phaseTotal = phase === "reading" ? computeReadingTime(question.question) : ANSWER_TIME;
  const fraction = phase === "processing" ? 0 : Math.max(0, Math.min(1, timeLeft / phaseTotal));
  const RING = 2 * Math.PI * 44;

  return (
    <VivaShell step={3}>
      <div className="mb-8 flex items-center justify-between gap-4">
        <Eyebrow>
          QUESTION {questionNumber} OF {totalQuestions}
        </Eyebrow>
        <div className="flex flex-1 max-w-xs items-center gap-1.5" aria-hidden>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < questionNumber ? "bg-orange" : "bg-navy/15"}`} />
          ))}
        </div>
      </div>

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${vivaCard} p-8 md:p-12`}
      >
        <h2 className="text-balance text-center text-2xl font-extrabold leading-snug text-navy dark:text-cream md:text-4xl">
          {question.question}
        </h2>

        <div className="mt-10 flex flex-col items-center">
          <div className="relative grid h-32 w-32 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" className="stroke-navy/10" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={phase === "recording" ? "stroke-orange" : "stroke-navy"}
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - fraction)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="text-center">
              <div className="font-mono text-3xl font-black text-navy dark:text-cream">{formatTime(timeLeft)}</div>
              <div className="text-[10px] font-extrabold tracking-widest text-navy/50 dark:text-cream/50">
                {phase === "reading" ? "READING" : "LEFT"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <MicrophoneContainer
            phase={phase}
            onTranscriptChange={handleTranscriptChange}
            onTranscriptionDone={handleTranscriptionDone}
          />
        </div>
      </motion.div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-navy/60 dark:text-cream/60">
          {phase === "reading" && "Read the question. Recording starts automatically."}
          {phase === "recording" && "Recording your answer..."}
          {phase === "processing" && "Processing your answer..."}
        </div>
        <Button onClick={handleManualAdvance} disabled={phase !== "recording" || isSubmitting} className="px-8 py-3">
          {phase === "processing" ? "Processing audio..." : questionNumber === totalQuestions ? "Finish viva" : "Next question"}
        </Button>
      </div>
    </VivaShell>
  );
}
