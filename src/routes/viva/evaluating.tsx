import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getEvaluation } from "@/lib/viva/api";
import { isExamLocked } from "@/lib/viva/useExamLock";
import { requireVivaAccess } from "@/lib/viva/guard";
import Button from "@/components/viva/Button";
import { VivaShell, vivaCard } from "@/components/viva/Shell";
import { Rocket } from "@/components/Doodles";

export const Route = createFileRoute("/viva/evaluating")({
  ssr: false, // the token lives in sessionStorage, so the check must run in the browser
  beforeLoad: requireVivaAccess,
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
      <VivaShell>
        <div className={`${vivaCard} mx-auto max-w-xl p-10 text-center`}>
          <h2 className="text-3xl font-extrabold text-navy dark:text-cream">This is taking longer than expected</h2>
          <p className="mt-3 text-muted-foreground">
            The AI is working through a long set of answers. Please try again in a few minutes.
          </p>
          <Button className="mt-8" onClick={() => navigate({ to: "/viva/gate" })}>
            Back to start
          </Button>
        </div>
      </VivaShell>
    );
  }

  return (
    <VivaShell>
      <div className={`${vivaCard} mx-auto max-w-xl overflow-hidden p-10 text-center`}>
        <div className="relative mx-auto grid h-28 w-28 place-items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[6px] border-orange/20 border-t-orange"
          />
          <Rocket className="h-14 w-14 text-navy" delay={0} />
        </div>
        <h2 className="mt-8 text-3xl font-extrabold text-navy dark:text-cream">
          Evaluating your <span className="text-gradient-warm">answers.</span>
        </h2>
        <p className="mt-3 text-muted-foreground">The AI examiner is reading each response. This takes a moment.</p>
      </div>
    </VivaShell>
  );
}
