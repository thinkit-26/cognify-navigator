import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getEvaluation } from "@/lib/viva/api";
import { isExamLocked } from "@/lib/viva/useExamLock";

export const Route = createFileRoute("/viva/evaluating")({
  head: () => ({ meta: [{ title: "Evaluating, AI Oral Viva" }] }),
  component: EvaluatingPage,
});

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_TIME_MS = 5 * 60 * 1000; // 5 minutes

function EvaluatingPage() {
  const navigate = useNavigate();
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    if (!sessionId || !isExamLocked()) {
      navigate({ to: "/viva/gate" });
      return;
    }

    let cancelled = false;
    const startTime = Date.now();

    async function poll() {
      try {
        const data = await getEvaluation(sessionId as string);

        if (cancelled) return;

        if (data.status === "ready") {
          navigate({ to: "/viva/results" });
          return;
        }
      } catch {
        // ignore transient errors, just keep polling
      }

      if (!cancelled && Date.now() - startTime < MAX_POLL_TIME_MS) {
        pollTimeout.current = setTimeout(poll, POLL_INTERVAL_MS);
      } else if (!cancelled) {
        setTimedOut(true);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, [navigate]);

  if (timedOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Evaluation is taking longer than expected
        </h2>
        <p className="text-gray-500 mb-6">
          This usually means the AI is processing a complex set of answers.
          Please try again in a few minutes.
        </p>
        <button
          onClick={() => navigate({ to: "/viva/gate" })}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Return to Gate
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-8"
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Evaluating Your Responses...
      </h2>
      <p className="text-gray-500">
        Please wait while the AI analyzes your answers.
      </p>
    </div>
  );
}
