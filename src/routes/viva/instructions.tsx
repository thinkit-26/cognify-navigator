import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import { Mic, Clock, BrainCircuit, CheckCircle2 } from "lucide-react";
import { startViva } from "@/lib/viva/api";
import { logSessionStart } from "@/lib/viva/log";
import { useExamLock } from "@/lib/viva/useExamLock";
import { requireVivaAccess } from "@/lib/viva/guard";
import { Eyebrow, VivaShell, vivaCard } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/instructions")({
  ssr: false, // the token lives in sessionStorage, so the check must run in the browser
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "Instructions, AI Oral Viva" }] }),
  component: InstructionsPage,
});

function InstructionsPage() {
  const navigate = useNavigate();
  const { lockExam } = useExamLock();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rules = [
    { icon: <Mic className="h-6 w-6" />, text: "Allow microphone access when prompted. Recording starts automatically for each question." },
    { icon: <Clock className="h-6 w-6" />, text: "You'll get a few seconds to read each question before recording begins." },
    { icon: <BrainCircuit className="h-6 w-6" />, text: "You have up to 45 seconds to answer. Click Next when you're done, or it advances automatically." },
    { icon: <CheckCircle2 className="h-6 w-6" />, text: "Speak clearly. Your responses are evaluated automatically." },
  ];

  async function handleStart() {
    setStarting(true);
    setError(null);

    const chapters = JSON.parse(
      localStorage.getItem("selectedChapters") || "[]"
    );

    const topics = JSON.parse(
      localStorage.getItem("selectedTopics") || "[]"
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setStarting(false);
      setError("Microphone access is required. Please allow microphone access and try again.");
      return;
    }

    try {
      const session = await startViva(chapters, topics);

      localStorage.setItem("sessionId", session.session_id);
      void logSessionStart(session.session_id, chapters, topics, session.total_questions);

      lockExam();
      navigate({ to: "/viva/viva" });
    } catch {
      setStarting(false);
      setError("Unable to start viva. Please try again.");
    }
  }

  return (
    <VivaShell step={2}>
      <Eyebrow>STEP 3 OF 4</Eyebrow>
      <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.05] text-navy dark:text-cream md:text-5xl">
        Before you <span className="text-gradient-warm">begin.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">Four things to know. The viva takes a few minutes.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {rules.map((rule, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${vivaCard} flex items-start gap-4 p-6`}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl bg-orange/10 text-orange">{rule.icon}</span>
            <span className="leading-relaxed text-navy dark:text-cream">{rule.text}</span>
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>
      )}

      <div className="mt-10 flex justify-end">
        <Button onClick={handleStart} disabled={starting} className="px-9 py-3.5">
          {starting ? "Starting..." : "Begin the viva"}
        </Button>
      </div>
    </VivaShell>
  );
}
