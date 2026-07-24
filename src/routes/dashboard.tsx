import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Target,
  Flame,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Trophy,
  Activity,
  GraduationCap,
  CheckCircle2,
  Megaphone,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { MonthCalendar } from "@/components/dashboard/MonthCalendar";
import { getCheatRole, clearCheatRole } from "@/lib/cheat";
import { useNotices, useClasses, useAttendance } from "@/lib/student-notes";
import {
  STUDENTS,
  ABHAY_TIMELINE,
  ABHAY_RADAR,
  ABHAY_RECENT,
  QUOTES,
  studentChapterPerf,
} from "@/lib/dummy-data";

export const Route = createFileRoute("/dashboard")({
  component: StudentDashboard,
  head: () => ({ meta: [{ title: "Dashboard, Cognify" }] }),
});

type Tab = "overview" | "performance" | "calendar" | "attendance" | "notices";

const ORANGE = "#E2740A";
const GLOW = "#FBBF24";
const GREEN = "#22C55E";
const ROSE = "#F43F5E";
const TEAL = "#0EA5A4";
const VIOLET = "#7C5CFF";

function StudentDashboard() {
  const navigate = useNavigate();
  const me = STUDENTS[0]; // Abhay
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (getCheatRole() !== "student") navigate({ to: "/login" });
  }, [navigate]);

  const logout = () => {
    clearCheatRole();
    navigate({ to: "/" });
  };

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="flex min-h-screen bg-[#F9F8F6] dark:bg-[#070d1c]">
      <DashboardSidebar
        subtitle="STUDENT"
        onLogout={logout}
        items={[
          { label: "Overview", icon: LayoutDashboard, onClick: () => setTab("overview"), active: tab === "overview" },
          { label: "Performance", icon: TrendingUp, onClick: () => setTab("performance"), active: tab === "performance" },
          { label: "Calendar", icon: CalendarDays, onClick: () => setTab("calendar"), active: tab === "calendar" },
          { label: "Attendance", icon: CheckCircle2, onClick: () => setTab("attendance"), active: tab === "attendance" },
          { label: "Notices", icon: Megaphone, onClick: () => setTab("notices"), active: tab === "notices" },
        ]}
      />
      <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black tracking-[0.32em] text-orange">
              {tab === "overview" ? "WELCOME BACK" : tab.toUpperCase()}
            </div>
            <h1 className="mt-1 text-2xl font-black leading-tight text-navy dark:text-cream sm:text-3xl md:text-4xl">
              {tab === "overview" && `Hey ${me.name.split(" ")[0]} 👋`}
              {tab === "performance" && "Your Performance"}
              {tab === "calendar" && "Class Calendar"}
              {tab === "attendance" && "Your Attendance"}
              {tab === "notices" && "Notices"}
            </h1>
            <p className="mt-1 text-xs text-navy/60 dark:text-cream/60 sm:text-sm">
              {me.classLevel} · Overall {me.overall}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell role="student" />
          </div>
        </div>

        {tab === "overview" && <OverviewPanel quote={quote} me={me} />}
        {tab === "performance" && <PerformancePanel me={me} />}
        {tab === "calendar" && <CalendarTab classLevel={me.classLevel} />}
        {tab === "attendance" && <AttendancePanel studentId={me.id} />}
        {tab === "notices" && <NoticesPanel />}
      </main>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewPanel({ quote, me }: { quote: string; me: typeof STUDENTS[number] }) {
  return (
    <>
      <div className="mb-5 border-2 border-orange/30 bg-navy p-5 text-cream shadow-[6px_6px_0_0_rgba(226,116,10,0.25)] dark:bg-[#0d1730]">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-orange-glow" />
          <div>
            <div className="text-[10px] font-black tracking-[0.3em] text-orange-glow/80">DAILY SPARK</div>
            <p className="mt-1 text-base font-bold leading-snug sm:text-lg md:text-xl">"{quote}"</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Tile color={ORANGE} icon={<Flame className="h-4 w-4" />} label="Streak" value={`${me.streak}d`} sub="Keep going" />
        <Tile color={TEAL} icon={<Trophy className="h-4 w-4" />} label="Overall" value={`${me.overall}%`} sub="Class avg 71%" />
        <Tile color={VIOLET} icon={<Target className="h-4 w-4" />} label="Target" value="95%" sub={`${95 - me.overall}% to go`} />
        <Tile color={GREEN} icon={<Activity className="h-4 w-4" />} label="Present" value={`${me.attendance.present}%`} sub={`${me.attendance.online}% online`} />
      </div>

      <div className="mt-5">
        <GlassCard title="Subject Scores" subtitle="This term" icon={<Activity className="h-4 w-4 text-orange" />}>
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(me.subjects).map(([sub, val]) => (
              <SubjectRing key={sub} subject={sub} value={val} />
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

/* ---------------- PERFORMANCE ---------------- */
function PerformancePanel({ me }: { me: typeof STUDENTS[number] }) {
  const subjects = Object.entries(me.subjects);
  const subjectBars = subjects.map(([name, score]) => ({ name, score }));

  return (
    <div className="space-y-5">
      <GlassCard title="Score Trajectory" subtitle="Last 7 weeks vs class avg" icon={<TrendingUp className="h-4 w-4 text-orange" />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ABHAY_TIMELINE}>
              <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
              <YAxis stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke={ORANGE} strokeWidth={3} dot={{ fill: GLOW, r: 4 }} name="You" />
              <Line type="monotone" dataKey="avg" stroke="#112D57" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Class avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard title="Skill Radar" icon={<GraduationCap className="h-4 w-4 text-orange" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={ABHAY_RADAR}>
                <PolarGrid stroke="rgba(17,45,87,0.18)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 10 }} className="text-navy dark:text-cream" />
                <Radar dataKey="value" stroke={ORANGE} fill={GLOW} fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Subject-wise" subtitle="Your scores per subject" icon={<BookOpen className="h-4 w-4 text-orange" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBars}>
                <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <YAxis stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score">
                  {subjectBars.map((b, i) => (
                    <Cell key={i} fill={b.score >= 80 ? GREEN : b.score >= 60 ? GLOW : ROSE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {subjects.map(([sub, val]) => (
        <GlassCard
          key={sub}
          title={`Chapter-wise, ${sub}`}
          subtitle={`Subject avg ${val}%`}
          icon={<BookOpen className="h-4 w-4 text-orange" />}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={studentChapterPerf(me.id, sub, val)}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <YAxis dataKey="chapter" type="category" width={130} stroke="currentColor" className="text-navy/60 dark:text-cream/50" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score">
                  {studentChapterPerf(me.id, sub, val).map((d, i) => (
                    <Cell key={i} fill={d.score >= 80 ? GREEN : d.score >= 60 ? GLOW : ROSE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      ))}

      <GlassCard title="Test History" icon={<ClipboardList className="h-4 w-4 text-orange" />}>
        <div className="space-y-2">
          {ABHAY_RECENT.map((r) => (
            <div
              key={r.paper}
              className="flex items-center justify-between border-2 border-navy/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="min-w-0">
                <div className="truncate font-bold text-navy dark:text-cream">{r.paper}</div>
                <div className="text-xs text-navy/55 dark:text-cream/55">{r.subject} · {r.date}</div>
              </div>
              <div
                className={`ml-3 shrink-0 px-3 py-1 text-xs font-black ${
                  r.score >= 80
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : r.score >= 60
                      ? "bg-orange/15 text-orange"
                      : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                }`}
              >
                {r.score}%
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------------- CALENDAR (read-only month grid) ---------------- */
function CalendarTab({ classLevel }: { classLevel: string }) {
  const [classes] = useClasses();
  const mine = classes.filter((c) => c.classLevel === classLevel || c.classLevel === "ALL");
  const sorted = [...mine].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <GlassCard title="Month" subtitle={`${mine.length} scheduled by your teacher`} icon={<CalendarDays className="h-4 w-4 text-orange" />}>
          <MonthCalendar events={mine} />
        </GlassCard>
      </div>
      <GlassCard title="Upcoming List" icon={<ClipboardList className="h-4 w-4 text-orange" />}>
        {sorted.length === 0 ? (
          <EmptyState text="When your teacher schedules a class it will show up here." />
        ) : (
          <div className="space-y-2">
            {sorted.map((c) => (
              <div key={c.id} className="flex items-center gap-3 border-2 border-navy/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <div className="grid h-12 w-12 shrink-0 place-items-center border-2 border-orange bg-orange/10 text-center text-orange">
                  <div className="leading-none">
                    <div className="text-[9px] font-black uppercase">{shortMonth(c.date)}</div>
                    <div className="text-lg font-black">{c.date.slice(-2)}</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-navy dark:text-cream">{c.title}</div>
                  <div className="text-xs text-navy/60 dark:text-cream/60">{c.time} · {c.classLevel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ---------------- ATTENDANCE ---------------- */
function AttendancePanel({ studentId }: { studentId: string }) {
  const [marks] = useAttendance();
  const mine = marks
    .filter((m) => m.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const present = mine.filter((m) => m.status === "present").length;
  const online = mine.filter((m) => m.status === "online").length;
  const absent = mine.filter((m) => m.status === "absent").length;
  const total = mine.length || 1;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-3">
        <KPI label="Present" value={`${Math.round((present / total) * 100)}%`} sub={`${present} classes`} tone="green" />
        <KPI label="Online" value={`${Math.round((online / total) * 100)}%`} sub={`${online} classes`} tone="orange" />
        <KPI label="Absent" value={`${Math.round((absent / total) * 100)}%`} sub={`${absent} classes`} tone="red" />
      </div>

      <GlassCard title="History" icon={<CheckCircle2 className="h-4 w-4 text-orange" />}>
        {mine.length === 0 ? (
          <EmptyState text="Your teacher hasn't marked attendance yet." />
        ) : (
          <div className="space-y-1.5">
            {mine.map((m) => (
              <div
                key={m.date}
                className="flex items-center justify-between border-2 border-navy/10 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              >
                <span className="font-bold text-navy dark:text-cream">{prettyDate(m.date)}</span>
                <StatusPill status={m.status} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ---------------- NOTICES ---------------- */
function NoticesPanel() {
  const [notices] = useNotices();
  const sorted = [...notices].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <GlassCard
      title="From Cognify"
      subtitle={sorted.length ? `${sorted.length} notice${sorted.length === 1 ? "" : "s"}` : "Nothing right now"}
      icon={<Megaphone className="h-4 w-4 text-orange" />}
    >
      {sorted.length === 0 ? (
        <EmptyState text="Your teacher hasn't posted any notices." />
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => (
            <div key={n.id} className="border-2 border-navy/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="font-extrabold text-navy dark:text-cream">{n.title}</div>
                <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-orange">
                  {prettyDate(n.date)}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/75 dark:text-cream/75">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ---------------- shared bits ---------------- */
const tooltipStyle = {
  background: "var(--cream-soft)",
  border: "2px solid rgba(226,116,10,0.4)",
  borderRadius: 0,
  fontSize: 12,
} as const;

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-navy/20 px-6 py-10 text-center text-sm text-navy/55 dark:border-white/15 dark:text-cream/55">
      {text}
    </div>
  );
}

function Tile({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="border-2 border-navy/15 bg-white p-4 dark:border-white/15 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-wider text-navy/55 dark:text-cream/55">{label}</div>
        <div className="grid h-7 w-7 place-items-center text-white" style={{ backgroundColor: color }}>{icon}</div>
      </div>
      <div className="mt-1 text-2xl font-black text-navy dark:text-cream sm:text-3xl">{value}</div>
      <div className="text-[11px] text-navy/55 dark:text-cream/55">{sub}</div>
    </div>
  );
}

function KPI({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "green" | "orange" | "red" }) {
  const color = tone === "green" ? GREEN : tone === "red" ? ROSE : ORANGE;
  return (
    <div className="border-2 border-navy/15 bg-white p-4 dark:border-white/15 dark:bg-white/5">
      <div className="text-[10px] font-black uppercase tracking-wider text-navy/55 dark:text-cream/55">{label}</div>
      <div className="mt-1 text-2xl font-black sm:text-3xl" style={{ color }}>{value}</div>
      <div className="text-[11px] text-navy/55 dark:text-cream/55">{sub}</div>
    </div>
  );
}

function StatusPill({ status }: { status: "present" | "online" | "absent" }) {
  const map = {
    present: "bg-emerald-500 text-white",
    online: "bg-orange text-white",
    absent: "bg-red-500 text-white",
  } as const;
  return (
    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider ${map[status]}`}>{status}</span>
  );
}

function prettyDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}
function shortMonth(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short" }).toUpperCase();
  } catch {
    return "";
  }
}

function SubjectRing({ subject, value }: { subject: string; value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="flex items-center gap-4 border-2 border-navy/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(17,45,87,0.12)" strokeWidth="8" />
        <circle cx="46" cy="46" r={r} fill="none" stroke="url(#g)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90 46 46)" />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor={ORANGE} />
            <stop offset="1" stopColor={GLOW} />
          </linearGradient>
        </defs>
        <text x="46" y="51" textAnchor="middle" className="fill-navy dark:fill-cream" fontSize="18" fontWeight="900">{value}</text>
      </svg>
      <div>
        <div className="text-sm font-extrabold text-navy dark:text-cream">{subject}</div>
        <div className="text-xs text-navy/55 dark:text-cream/55">out of 100</div>
      </div>
    </div>
  );
}
