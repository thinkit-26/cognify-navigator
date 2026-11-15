import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { requireVivaAccess } from "@/lib/viva/guard";
import { downloadVivaReport } from "@/lib/viva/report";
import Button from "@/components/viva/Button";
import { Eyebrow, VivaShell, vivaCard } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/history")({
  ssr: false, // needs the browser's Supabase session
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "My results, AI Oral Viva" }] }),
  component: HistoryPage,
});

type Session = Tables<"viva_sessions">;
type Answer = Tables<"viva_answers">;

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function HistoryPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: sErr } = await supabase
        .from("viva_sessions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);
      if (sErr) return setError("Couldn't load your results. Try again.");
      setSessions(data ?? []);
      if (!data?.length) return;
      const { data: rows, error: aErr } = await supabase
        .from("viva_answers")
        .select("*")
        .in("session_id", data.map((s) => s.session_id))
        .order("question_number", { ascending: true });
      if (aErr) return setError("Couldn't load your answers. Try again.");
      const grouped: Record<string, Answer[]> = {};
      for (const a of rows ?? []) (grouped[a.session_id] ??= []).push(a);
      setAnswers(grouped);
    })();
  }, []);

  const [reporting, setReporting] = useState(false);
  const downloadReport = async () => {
    setReporting(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("full_name, class_level").eq("id", user.id).maybeSingle();
      await downloadVivaReport(
        {
          name: prof?.full_name || (user.user_metadata?.full_name as string | undefined) || "Student",
          id: user.id.slice(0, 8).toUpperCase(),
          classLevel: prof?.class_level ?? null,
        },
        sessions ?? [],
        Object.values(answers).flat(),
      );
    } catch {
      setError("Couldn't make your report. Try again.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <VivaShell
      actions={
        <Link to="/viva/select" className="text-orange hover:underline">
          Start a new viva
        </Link>
      }
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>YOUR PROGRESS</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-navy dark:text-cream md:text-5xl">
            My <span className="text-gradient-warm">results.</span>
          </h1>
        </div>
        <Button variant="outline" onClick={downloadReport} disabled={reporting || !sessions?.length}>
          {reporting ? "Making report..." : "Download report (PDF)"}
        </Button>
      </div>

      {error && <p className="font-semibold text-rose-600">{error}</p>}
      {!error && sessions === null && <p className="text-navy/60">Loading your results...</p>}
      {sessions?.length === 0 && (
        <div className={`${vivaCard} p-10 text-center`}>
          <p className="text-lg font-bold text-navy dark:text-cream">You haven't taken a viva yet.</p>
          <Link to="/viva/select" className="mt-4 inline-block font-bold text-orange hover:underline">
            Start your first viva
          </Link>
        </div>
      )}

      <ul className="space-y-5">
        {sessions?.map((s) => {
          const rows = answers[s.session_id] ?? [];
          const isOpen = open === s.session_id;
          const score = s.overall_score != null ? Math.round(Number(s.overall_score)) : null;
          return (
            <li key={s.id} className={`${vivaCard} p-6`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : s.session_id)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block font-extrabold text-navy dark:text-cream">{when(s.started_at)}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {s.status === "completed"
                      ? `${s.correct_count ?? 0} of ${s.total_questions ?? rows.length} correct`
                      : `In progress, ${rows.length} answered`}
                  </span>
                </span>
                <span
                  className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 text-lg font-black ${
                    score == null ? "border-navy/15 text-navy/40" : score >= 60 ? "border-orange text-navy" : "border-navy/25 text-navy"
                  } dark:text-cream`}
                >
                  {score != null ? `${score}%` : "..."}
                </span>
              </button>

              {isOpen && (
                <div className="mt-6 space-y-4 border-t border-border pt-6">
                  {s.overall_feedback && <p className="leading-relaxed text-navy/80 dark:text-cream/80">{s.overall_feedback}</p>}
                  {rows.map((a) => (
                    <div key={a.id} className="rounded-2xl bg-secondary/70 p-4">
                      <p className="font-bold text-navy dark:text-cream">
                        {a.question_number ? <span className="mr-1.5 text-orange">Q{a.question_number}.</span> : null}
                        {a.question}
                      </p>
                      <p className="mt-2 text-sm text-navy/80 dark:text-cream/80">
                        <span className="font-extrabold">Your answer: </span>
                        {a.student_answer}
                      </p>
                      {a.score != null && (
                        <p className={`mt-2 text-sm font-bold ${a.is_correct ? "text-emerald-700" : "text-rose-600"}`}>
                          Score {a.score}
                          {a.feedback ? <span className="font-normal text-muted-foreground">, {a.feedback}</span> : null}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </VivaShell>
  );
}
