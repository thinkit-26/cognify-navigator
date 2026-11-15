import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Session = Tables<"viva_sessions">;
type Answer = Tables<"viva_answers">;

const input =
  "h-11 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// Reads every student's viva attempts. The database only returns other students' rows to a real
// Supabase admin session (row level security), so this panel signs in like the PYQ upload panel.
export function VivaResultsPanel() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "completed" | "in_progress">("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setIsAdmin(false);
    const { data: row } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!row);
    if (!row) setAuthMsg("This account is not an admin.");
  };
  useEffect(() => {
    checkAdmin();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    const { data, error: sErr } = await supabase
      .from("viva_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(500);
    if (sErr) {
      setError("Couldn't load viva results. Try again.");
      setLoading(false);
      return;
    }
    setSessions(data ?? []);
    const ids = [...new Set((data ?? []).map((s) => s.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setNames(Object.fromEntries((profs ?? []).map((p) => [p.id, p.full_name])));
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) return setAuthMsg(err.message);
    checkAdmin();
  };

  const toggle = async (s: Session) => {
    const next = open === s.session_id ? null : s.session_id;
    setOpen(next);
    if (!next || answers[next]) return;
    const { data } = await supabase
      .from("viva_answers")
      .select("*")
      .eq("session_id", next)
      .order("question_number", { ascending: true });
    setAnswers((a) => ({ ...a, [next]: data ?? [] }));
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter(
      (s) =>
        (status === "all" || s.status === status) &&
        (!q || (names[s.user_id] ?? "").toLowerCase().includes(q)),
    );
  }, [sessions, names, query, status]);

  const stats = useMemo(() => {
    const done = sessions.filter((s) => s.overall_score != null);
    const avg = done.length ? Math.round(done.reduce((t, s) => t + Number(s.overall_score), 0) / done.length) : null;
    return {
      attempts: sessions.length,
      students: new Set(sessions.map((s) => s.user_id)).size,
      completed: sessions.filter((s) => s.status === "completed").length,
      avg,
    };
  }, [sessions]);

  if (isAdmin === null) return <p className="text-navy/60 dark:text-cream/60">Checking access…</p>;
  if (!isAdmin) {
    return (
      <form onSubmit={signIn} className="max-w-sm space-y-3">
        <p className="text-navy dark:text-cream">Sign in with your Supabase admin account to see viva results.</p>
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white dark:bg-cream dark:text-navy">Sign in</button>
        {authMsg && <p className="text-sm font-semibold text-rose-500">{authMsg}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Attempts", stats.attempts],
          ["Students", stats.students],
          ["Completed", stats.completed],
          ["Average score", stats.avg == null ? "-" : `${stats.avg}%`],
        ].map(([label, value]) => (
          <div key={label} className="border-2 border-navy/15 p-4 dark:border-white/15">
            <div className="text-3xl font-black text-navy dark:text-cream">{value}</div>
            <div className="mt-1 text-xs font-bold text-navy/60 dark:text-cream/60">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <input className={`${input} max-w-xs`} placeholder="Search by student name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={`${input} max-w-[12rem]`} value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status">
          <option value="all">All attempts</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In progress</option>
        </select>
        <button type="button" onClick={load} className="rounded-full border-2 border-navy/30 px-5 text-sm font-bold text-navy dark:text-cream">
          Refresh
        </button>
      </div>

      {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
      {loading && <p className="text-navy/60 dark:text-cream/60">Loading…</p>}
      {!loading && !error && shown.length === 0 && (
        <p className="text-navy/60 dark:text-cream/60">
          {sessions.length === 0 ? "No viva attempts yet." : "No attempts match your filters."}
        </p>
      )}

      <ul className="space-y-3">
        {shown.map((s) => {
          const isOpen = open === s.session_id;
          const rows = answers[s.session_id];
          return (
            <li key={s.id} className="border-2 border-navy/15 p-4 dark:border-white/15">
              <button
                type="button"
                onClick={() => toggle(s)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate font-black text-navy dark:text-cream">{names[s.user_id] || "Unnamed student"}</span>
                  <span className="block text-xs text-navy/60 dark:text-cream/60">
                    {when(s.started_at)} ·{" "}
                    {s.status === "completed"
                      ? `${s.correct_count ?? 0} of ${s.total_questions ?? "?"} correct`
                      : "In progress"}
                  </span>
                </span>
                <span className="text-2xl font-black text-orange">
                  {s.overall_score != null ? `${Math.round(Number(s.overall_score))}%` : "-"}
                </span>
              </button>

              {isOpen && (
                <div className="mt-4 space-y-3 border-t border-navy/10 pt-4 dark:border-white/10">
                  {s.overall_feedback && <p className="text-sm text-navy dark:text-cream">{s.overall_feedback}</p>}
                  {!rows && <p className="text-sm text-navy/60 dark:text-cream/60">Loading answers…</p>}
                  {rows?.length === 0 && <p className="text-sm text-navy/60 dark:text-cream/60">No answers saved for this attempt.</p>}
                  {rows?.map((a) => (
                    <div key={a.id} className="bg-navy/[0.04] p-3 dark:bg-white/[0.05]">
                      <p className="text-sm font-bold text-navy dark:text-cream">
                        {a.question_number ? `Q${a.question_number}. ` : ""}
                        {a.question}
                      </p>
                      <p className="mt-1 text-sm text-navy/80 dark:text-cream/80">
                        <span className="font-bold">Answer: </span>
                        {a.student_answer}
                      </p>
                      {a.score != null && (
                        <p className={`mt-1 text-xs font-bold ${a.is_correct ? "text-green-600" : "text-rose-500"}`}>
                          Score {a.score}
                          {a.feedback ? <span className="font-normal text-navy/70 dark:text-cream/70">, {a.feedback}</span> : null}
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
      {sessions.length === 500 && <p className="text-xs text-navy/60 dark:text-cream/60">Showing the latest 500 attempts.</p>}
    </div>
  );
}
