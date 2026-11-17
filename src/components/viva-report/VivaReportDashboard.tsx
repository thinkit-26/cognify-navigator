import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { downloadVivaReport } from "@/lib/viva/report";
import {
  PASS_MARK,
  buildClassReport,
  buildStudentReport,
  monotonePath,
  prognosis,
  scoreColor,
  type Session,
  type SlimAnswer,
  type StudentReport,
} from "@/lib/viva/dashboardData";
import "./report.css";

type Answer = Tables<"viva_answers">;
type Profile = { full_name: string; class_level: string | null };

const pct = (n: number) => `${Math.round(n)}%`;
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// Adds the "in" class once the card scrolls into view, which starts its entrance animation.
function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`card ${seen ? "in" : ""} ${className}`}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

function Stat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <Card>
      <div className="num" style={color ? { color } : undefined}>{value}</div>
      <div className="label">{label}</div>
    </Card>
  );
}

function TrendChart({ trend }: { trend: StudentReport["trend"] }) {
  const W = 560, H = 190, L = 30, R = 12, T = 12, B = 26;
  const x = (i: number) => (trend.length === 1 ? (L + W - R) / 2 : L + 10 + (i * (W - L - R - 20)) / (trend.length - 1));
  const y = (v: number) => H - B - (v / 100) * (H - B - T);
  const pts = trend.map((t, i) => ({ x: x(i), y: y(t.score) }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Score trend over the last viva attempts">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line className="grid-l" x1={L} x2={W - R} y1={y(g)} y2={y(g)} />
          <text className="axis" x={L - 6} y={y(g) + 3} textAnchor="end">{g}</text>
        </g>
      ))}
      <line className="pass" x1={L} x2={W - R} y1={y(PASS_MARK)} y2={y(PASS_MARK)} />
      <text className="axis" x={W - R} y={y(PASS_MARK) - 4} textAnchor="end" style={{ fill: "var(--good)" }}>PASS {PASS_MARK}</text>
      <g className="reveal">
        <path className="line" d={monotonePath(pts)} />
        {trend.map((t, i) => (
          <circle key={t.id} className="dot" cx={pts[i].x} cy={pts[i].y} r={4.5} fill={scoreColor(t.score)} stroke="#fff" strokeWidth={2}>
            <title>{`${t.label}: ${Math.round(t.score)}%`}</title>
          </circle>
        ))}
      </g>
      {trend.map((t, i) => (
        <text key={t.id} className="axis" x={x(i)} y={H - 8} textAnchor="middle">{t.label}</text>
      ))}
    </svg>
  );
}

function Prognosis({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <p key={text} className="prog" aria-label={text} style={{ ["--step" as string]: `${Math.min(0.14, 1.4 / words.length)}s` }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden style={{ ["--i" as string]: i }}>{w}&nbsp;</span>
      ))}
    </p>
  );
}

function Attempt({ s, answers, onOpen }: { s: Session; answers: Answer[] | undefined; onOpen: () => void }) {
  const score = s.overall_score != null ? Number(s.overall_score) : null;
  return (
    <details onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && onOpen()}>
      <summary>
        <span>
          {when(s.started_at)}
          <small>{s.status === "completed" ? `${s.correct_count ?? 0} of ${s.total_questions ?? "?"} correct` : "In progress"}</small>
        </span>
        <b className="mono" style={{ color: score == null ? "var(--faint)" : scoreColor(score) }}>{score == null ? "-" : pct(score)}</b>
      </summary>
      <div style={{ paddingBottom: 12 }}>
        {s.overall_feedback && <p className="q">{s.overall_feedback}</p>}
        {!answers && <p className="empty">Loading answers...</p>}
        {answers?.length === 0 && <p className="empty">No answers saved for this attempt.</p>}
        {answers?.map((a) => (
          <div key={a.id} className="q">
            <p><b>{a.question_number ? `Q${a.question_number}. ` : ""}{a.question}</b></p>
            <p style={{ color: "var(--soft)" }}>{a.student_answer}</p>
            {a.score != null && (
              <p className="fb" style={{ color: a.is_correct ? "var(--good)" : "var(--bad)" }}>
                Score {a.score}{a.feedback ? ` - ${a.feedback}` : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}

function StudentView({ name, classAvg, sessions, slim, loadAnswers, cache, onPdf, pdfBusy }: {
  name: string | null;
  classAvg: number | null;
  sessions: Session[];
  slim: SlimAnswer[];
  loadAnswers: (sessionId: string) => void;
  cache: Record<string, Answer[]>;
  onPdf: () => void;
  pdfBusy: boolean;
}) {
  const r = useMemo(() => buildStudentReport(sessions, slim), [sessions, slim]);
  const attempts = [...sessions].sort((a, b) => b.started_at.localeCompare(a.started_at));
  return (
    <>
      <div className="grid stats">
        <Stat value={r.count} label="Vivas taken" />
        <Stat value={r.count ? pct(r.avg) : "-"} label="Average" color={r.count ? scoreColor(r.avg) : undefined} />
        <Stat value={r.count ? pct(r.best) : "-"} label="Best" color={r.count ? scoreColor(r.best) : undefined} />
        <Stat value={r.count ? `${r.passed}/${r.count}` : "-"} label={`Passed (${PASS_MARK}%+)`} />
      </div>
      <Card title="Prognosis"><Prognosis text={prognosis(r, name, classAvg)} /></Card>
      <div className="grid two">
        <Card title="Score trend">
          {r.trend.length ? <TrendChart trend={r.trend} /> : <p className="empty">No finished vivas yet.</p>}
        </Card>
        <Card title="Topic accuracy">
          {r.topics.length ? (
            <div className="bars">
              {r.topics.slice(0, 8).map((t) => (
                <div className="row" key={t.topic}>
                  <span className="name" title={t.topic}>{t.topic}</span>
                  <b style={{ color: scoreColor(t.accuracy) }}>{pct(t.accuracy)}</b>
                  <div className="track"><div className="fill" style={{ ["--w" as string]: `${t.accuracy}%`, background: scoreColor(t.accuracy) }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="empty">Topics appear after a finished viva.</p>}
        </Card>
      </div>
      <div className="grid two">
        <Card title="Fix it first">
          {r.weak.length ? (
            <div className="bars">
              {r.weak.slice(0, 6).map((t) => (
                <div className="row" key={t.topic}>
                  <span className="name" title={t.topic}>{t.topic}</span>
                  <b style={{ color: "var(--bad)" }}>{t.flagged} viva{t.flagged === 1 ? "" : "s"}</b>
                </div>
              ))}
            </div>
          ) : <p className="empty">No weak topics flagged.</p>}
        </Card>
        <Card title="Attempts">
          {attempts.length === 0 && <p className="empty">No attempts yet.</p>}
          {attempts.map((s) => (
            <Attempt key={s.id} s={s} answers={cache[s.session_id]} onOpen={() => loadAnswers(s.session_id)} />
          ))}
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn" onClick={onPdf} disabled={pdfBusy || !r.count}>
              {pdfBusy ? "Making report..." : "Download report (PDF)"}
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function ClassView({ sessions, slim, names, pick }: { sessions: Session[]; slim: SlimAnswer[]; names: Record<string, Profile>; pick: (id: string) => void }) {
  const c = useMemo(() => buildClassReport(sessions, slim), [sessions, slim]);
  const max = Math.max(1, ...c.bands);
  const medals = ["m1", "m2", "m3"];
  return (
    <>
      <div className="grid stats">
        <Stat value={c.students} label="Students" />
        <Stat value={c.attempts} label="Attempts" />
        <Stat value={c.classAvg == null ? "-" : pct(c.classAvg)} label="Class average" color={c.classAvg == null ? undefined : scoreColor(c.classAvg)} />
        <Stat value={c.rows.filter((r) => r.avg >= PASS_MARK).length} label={`Averaging ${PASS_MARK}%+`} />
      </div>
      <div className="grid two">
        <Card title="Spread of student averages">
          {c.rows.length ? (
            <div className="hist" role="img" aria-label="Number of students in each 10 percent score band">
              {c.bands.map((n, i) => (
                <div className="col" key={i} title={`${i * 10}-${i === 9 ? 100 : i * 10 + 9}%: ${n}`}>
                  {n || ""}
                  <i style={{ ["--h" as string]: `${(n / max) * 100}px`, ["--i" as string]: i, background: scoreColor(i * 10 + 5), opacity: n ? 1 : 0.15 }} />
                  {i * 10}
                </div>
              ))}
            </div>
          ) : <p className="empty">No finished vivas yet.</p>}
        </Card>
        <Card title="Where the class struggles">
          {c.struggling.length ? (
            <div className="bars">
              {c.struggling.slice(0, 6).map((t) => (
                <div className="row" key={t.topic}>
                  <span className="name" title={t.topic}>{t.topic}</span>
                  <b style={{ color: scoreColor(t.accuracy) }}>{pct(t.accuracy)}</b>
                  <div className="track"><div className="fill" style={{ ["--w" as string]: `${t.accuracy}%`, background: scoreColor(t.accuracy) }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="empty">No topic is under {PASS_MARK}% yet.</p>}
        </Card>
      </div>
      <div style={{ marginTop: 14 }}>
        <Card title="Leaderboard">
          {c.rows.length === 0 && <p className="empty">No finished vivas yet.</p>}
          <ol className="lb">
            {c.rows.map((r, i) => (
              <li key={r.userId}>
                <span className="rank">{i < 3 ? <span className={`medal ${medals[i]}`}>{i + 1}</span> : i + 1}</span>
                <button type="button" onClick={() => pick(r.userId)}>{names[r.userId]?.full_name || "Unnamed student"}</button>
                <span className="mono" style={{ color: "var(--soft)" }}>{r.count} viva{r.count === 1 ? "" : "s"}</span>
                <b className="mono" style={{ color: scoreColor(r.avg) }}>{pct(r.avg)}</b>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}

// mode "student": the signed-in student's own results. mode "admin": every student (row level
// security only returns other students' rows to an admin session) with a picker for one student.
export function VivaReportDashboard({ mode }: { mode: "student" | "admin" }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [slim, setSlim] = useState<SlimAnswer[]>([]);
  const [names, setNames] = useState<Record<string, Profile>>({});
  const [cache, setCache] = useState<Record<string, Answer[]>>({});
  const [sel, setSel] = useState("all");
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return setError("Sign in to see your results.");
      let q = supabase.from("viva_sessions").select("*").order("started_at", { ascending: false }).limit(500);
      if (mode === "student") q = q.eq("user_id", user.id);
      const { data, error: sErr } = await q;
      if (sErr) return setError("Couldn't load viva results. Try again.");
      setSessions(data ?? []);
      const ids = [...new Set((data ?? []).map((s) => s.user_id))];
      if (mode === "student") ids.push(user.id);
      const [profs, ans] = await Promise.all([
        supabase.from("profiles").select("id, full_name, class_level").in("id", ids),
        data?.length
          ? supabase.from("viva_answers").select("session_id, user_id, topic, is_correct").in("session_id", data.map((s) => s.session_id)).limit(5000)
          : Promise.resolve({ data: [] as SlimAnswer[] }),
      ]);
      const map = Object.fromEntries((profs.data ?? []).map((p) => [p.id, { full_name: p.full_name, class_level: p.class_level }]));
      setNames(map);
      setSlim((ans.data ?? []) as SlimAnswer[]);
      setMe({ id: user.id, name: map[user.id]?.full_name || (user.user_metadata?.full_name as string | undefined) || "Student" });
    })();
  }, [mode]);

  const loadAnswers = async (sessionId: string) => {
    if (cache[sessionId]) return;
    const { data } = await supabase.from("viva_answers").select("*").eq("session_id", sessionId).order("question_number", { ascending: true });
    setCache((c) => ({ ...c, [sessionId]: data ?? [] }));
  };

  const userId = mode === "student" ? me?.id : sel === "all" ? null : sel;
  const mine = useMemo(() => (userId ? (sessions ?? []).filter((s) => s.user_id === userId) : []), [sessions, userId]);
  const mineSlim = useMemo(() => (userId ? slim.filter((a) => a.user_id === userId) : []), [slim, userId]);

  const classAvg = useMemo(() => (mode === "admin" && sessions ? buildClassReport(sessions, []).classAvg : null), [mode, sessions]);

  const pdf = async () => {
    if (!userId) return;
    setPdfBusy(true);
    try {
      await downloadVivaReport(
        { name: names[userId]?.full_name || me?.name || "Student", id: userId.slice(0, 8).toUpperCase(), classLevel: names[userId]?.class_level ?? null },
        mine,
        mineSlim,
      );
    } catch {
      setError("Couldn't make the report. Try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  const shownName = mode === "student" ? null : userId ? names[userId]?.full_name || "This student" : null;
  const students = [...new Set((sessions ?? []).map((s) => s.user_id))].sort((a, b) => (names[a]?.full_name ?? "").localeCompare(names[b]?.full_name ?? ""));

  return (
    <div className="vr">
      <div className="bar">
        <div>
          <h2 className="title">{mode === "student" ? (me ? `${me.name}'s report` : "") : userId ? `${shownName}'s report` : "Viva report, all students"}</h2>
          {mode === "admin" && !userId && <p className="sub">Latest 500 attempts</p>}
        </div>
        {mode === "admin" && sessions && (
          <div className="tools">
            <select value={sel} onChange={(e) => setSel(e.target.value)} aria-label="Student">
              <option value="all">All students</option>
              {students.map((id) => (
                <option key={id} value={id}>{names[id]?.full_name || "Unnamed student"}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="empty" style={{ color: "var(--bad)" }}>{error}</p>}
      {!error && sessions === null && <p className="empty">Loading results...</p>}
      {sessions && (mode === "admin" || me) && (mode === "admin" && !userId ? (
        <ClassView sessions={sessions} slim={slim} names={names} pick={setSel} />
      ) : (
        <StudentView name={shownName} classAvg={classAvg} sessions={mine} slim={mineSlim} loadAnswers={loadAnswers} cache={cache} onPdf={pdf} pdfBusy={pdfBusy} />
      ))}
    </div>
  );
}
