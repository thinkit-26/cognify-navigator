import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { requireVivaAccess } from "@/lib/viva/guard";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 pt-32 md:pt-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">My results</h1>
          <Link to="/viva/select" className="text-sm font-semibold text-orange-500 hover:underline">
            Start a new viva
          </Link>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {!error && sessions === null && <p className="text-gray-500">Loading your results...</p>}
        {sessions?.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-gray-700">You haven't taken a viva yet.</p>
            <Link to="/viva/select" className="mt-3 inline-block font-semibold text-orange-500 hover:underline">
              Start your first viva
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {sessions?.map((s) => {
            const rows = answers[s.session_id] ?? [];
            const isOpen = open === s.session_id;
            return (
              <li key={s.id} className="rounded-2xl bg-white p-5 shadow">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.session_id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="block font-semibold text-gray-900">{when(s.started_at)}</span>
                    <span className="block text-sm text-gray-500">
                      {s.status === "completed"
                        ? `${s.correct_count ?? 0} of ${s.total_questions ?? rows.length} correct`
                        : `In progress, ${rows.length} answered`}
                    </span>
                  </span>
                  <span className="text-2xl font-bold text-orange-500">
                    {s.overall_score != null ? `${Math.round(Number(s.overall_score))}%` : "..."}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
                    {s.overall_feedback && <p className="text-gray-700">{s.overall_feedback}</p>}
                    {rows.map((a) => (
                      <div key={a.id} className="rounded-xl bg-gray-50 p-4">
                        <p className="font-semibold text-gray-900">
                          {a.question_number ? `Q${a.question_number}. ` : ""}
                          {a.question}
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">Your answer: </span>
                          {a.student_answer}
                        </p>
                        {a.score != null && (
                          <p className={`mt-2 text-sm font-semibold ${a.is_correct ? "text-green-600" : "text-red-500"}`}>
                            Score {a.score}
                            {a.feedback ? <span className="font-normal text-gray-600">, {a.feedback}</span> : null}
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
      </main>
    </div>
  );
}
