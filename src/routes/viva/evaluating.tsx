import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getEvaluation } from "@/lib/viva/api";

export const Route = createFileRoute("/viva/evaluating")({
  head: () => ({ meta: [{ title: "Evaluating, AI Oral Viva" }] }),
  component: EvaluatingPage,
});

function EvaluatingPage() {
  const navigate = useNavigate();
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    if (!sessionId) {
      navigate({ to: "/" });
      return;
    }

    let cancelled = false;

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

      if (!cancelled) {
        pollTimeout.current = setTimeout(poll, 2000);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, [navigate]);

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
