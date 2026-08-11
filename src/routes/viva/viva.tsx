import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import MicrophoneContainer, { RecordingPhase } from "@/components/viva/MicrophoneContainer";
import { getQuestion, submitAnswer } from "@/lib/viva/api";
import type { VivaQuestion, QuestionResponse } from "@/lib/viva/types";

export const Route = createFileRoute("/viva/viva")({
  head: () => ({ meta: [{ title: "AI Oral Viva, Cognify Institute" }] }),
  component: VivaPage,
});

const ANSWER_TIME = 90;
const MIN_READING_TIME = 5;
const MAX_READING_TIME = 15;

function computeReadingTime(questionText: string): number {
  const wordCount = questionText.trim().split(/\s+/).length;
  return Math.min(MAX_READING_TIME, Math.max(MIN_READING_TIME, wordCount));
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
  const submittingRef = useRef(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(localStorage.getItem("sessionId"));
  }, []);

  async function loadQuestion() {
    if (!sessionId) return;

    const data = await getQuestion(sessionId);

    if (data.status === "completed") {
      navigate({ to: "/viva/evaluating" });
      return;
    }

    setQuestion(data.question);
    setQuestionNumber(data.question_number);
    setTotalQuestions(data.total_questions);

    setTranscript("");
    transcriptRef.current = "";

    setPhase("reading");
    setTimeLeft(computeReadingTime(data.question.question));
  }

  useEffect(() => {
    if (sessionId) loadQuestion();
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

  // Fires once MicrophoneContainer finishes transcribing — whether that was
  // triggered by the timer hitting 0 or by the student clicking Next/Finish
  async function handleTranscriptionDone() {
    if (!sessionId || submittingRef.current) return;
    submittingRef.current = true;

    const answerToSubmit = transcriptRef.current.trim() || "No answer recorded";

    try {
      const response = await submitAnswer(sessionId, answerToSubmit);

      if (response.status === "completed") {
        navigate({ to: "/viva/evaluating" });
        return;
      }

      setQuestion(response.next_question);
      setQuestionNumber(response.question_number);
      setTotalQuestions(response.total_questions);

      setTranscript("");
      transcriptRef.current = "";

      setPhase("reading");
      setTimeLeft(computeReadingTime(response.next_question.question));
    } finally {
      submittingRef.current = false;
    }
  }

  function handleManualAdvance() {
    if (phase !== "recording") return;
    setPhase("processing");
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Question...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 pt-32 md:pt-24 flex flex-col justify-center">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>

        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-relaxed text-center mb-10">
            {question.question}
          </h2>

          <div className="text-center mb-8">
            <div className="text-5xl font-light text-gray-800 font-mono">
              00:{timeLeft.toString().padStart(2, "0")}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {phase === "reading" ? "Reading time" : "Time remaining"}
            </p>
          </div>

          <MicrophoneContainer
            phase={phase}
            onTranscriptChange={handleTranscriptChange}
            onTranscriptionDone={handleTranscriptionDone}
          />
        </motion.div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {phase === "reading" && "Read the question — recording starts automatically"}
            {phase === "recording" && "Recording your answer..."}
            {phase === "processing" && "Processing your answer..."}
          </div>

          <Button
            onClick={handleManualAdvance}
            disabled={phase !== "recording" || submittingRef.current}
            className="px-8 py-3"
          >
            {phase === "processing" ? "Processing Audio..." : questionNumber === totalQuestions ? "Finish Viva" : "Next Question"}
          </Button>
        </div>
      </main>
    </div>
  );
}
