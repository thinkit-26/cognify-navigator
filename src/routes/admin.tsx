import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  TrendingUp,
  Activity,
  Award,
  GraduationCap,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Sparkles,
  Flame,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { MonthCalendar } from "@/components/dashboard/MonthCalendar";
import { getCheatRole, clearCheatRole } from "@/lib/cheat";
import {
  useNotices,
  useClasses,
  useAttendance,
  uid,
  type Notice,
  type ScheduledClass,
  type AttendanceMark,
} from "@/lib/student-notes";
import {
  STUDENTS,
  PAPERS,
  SUBJECT_TYPOLOGY,
  CLASS_DIFFICULTY_SPLIT,
  classChapterPerf,
  studentChapterPerf,
  type Student,
} from "@/lib/dummy-data";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin, Cognify" }] }),
});

type Tab = "overview" | "papers" | "students" | "notices" | "calendar" | "attendance";

const ORANGE = "#E2740A";
const GLOW = "#FBBF24";
const NAVY = "#112D57";
const GOLD = "#C8A977";
const TEAL = "#0EA5A4";
const VIOLET = "#7C5CFF";
const ROSE = "#F43F5E";
const GREEN = "#22C55E";

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (getCheatRole() !== "admin") navigate({ to: "/login" });
  }, [navigate]);

  const logout = () => {
    clearCheatRole();
    navigate({ to: "/" });
  };

  const classAvg = Math.round(STUDENTS.reduce((s, x) => s + x.overall, 0) / STUDENTS.length);

  return (
    <div className="flex min-h-screen bg-[#F9F8F6] dark:bg-[#070d1c]">
      <DashboardSidebar
        subtitle="ADMIN"
        onLogout={logout}
        items={[
          { label: "Overview", icon: LayoutDashboard, onClick: () => setTab("overview"), active: tab === "overview" },
          { label: "Papers", icon: FileText, onClick: () => setTab("papers"), active: tab === "papers" },
          { label: "Students", icon: Users, onClick: () => setTab("students"), active: tab === "students" },
          { label: "Notices", icon: Megaphone, onClick: () => setTab("notices"), active: tab === "notices" },
          { label: "Calendar", icon: CalendarDays, onClick: () => setTab("calendar"), active: tab === "calendar" },
          { label: "Attendance", icon: CheckCircle2, onClick: () => setTab("attendance"), active: tab === "attendance" },
        ]}
      />
      <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black tracking-[0.32em] text-orange">ADMIN CONSOLE</div>
            <h1 className="mt-1 text-2xl font-black leading-tight text-navy dark:text-cream sm:text-3xl md:text-4xl">
              {tab === "overview" && "Good to see you, Aseem."}
              {tab === "papers" && "Paper Analytics"}
              {tab === "students" && "Class Roster"}
              {tab === "notices" && "Notices"}
              {tab === "calendar" && "Calendar"}
              {tab === "attendance" && "Attendance"}
            </h1>
            <p className="mt-1 text-xs text-navy/60 dark:text-cream/60 sm:text-sm">
              {STUDENTS.length} students · {PAPERS.length} papers · class avg {classAvg}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell role="admin" />
          </div>
        </div>

        {tab === "overview" && <OverviewPanel goTo={setTab} openStudent={setActiveStudent} />}
        {tab === "papers" && <PapersPanel />}
        {tab === "students" && <StudentsPanel onOpen={setActiveStudent} />}
        {tab === "notices" && <NoticesPanel />}
        {tab === "calendar" && <CalendarPanel />}
        {tab === "attendance" && <AttendancePanel />}
      </main>

      {activeStudent && <StudentDetailModal student={activeStudent} onClose={() => setActiveStudent(null)} />}
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewPanel({
  goTo,
  openStudent,
}: {
  goTo: (t: Tab) => void;
  openStudent: (s: Student) => void;
}) {
  const [notices] = useNotices();
  const [classes] = useClasses();

  const classAvg = Math.round(STUDENTS.reduce((s, x) => s + x.overall, 0) / STUDENTS.length);
  const atRisk = STUDENTS.filter((s) => s.overall < 60).length;
  const topPerformer = [...STUDENTS].sort((a, b) => b.overall - a.overall)[0];
  const upcoming = [...classes].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const latestNotices = [...notices].sort((a, b) => b.date.localeCompare(a.date));

  const overallBars = STUDENTS.map((s) => ({ name: s.name.split(" ")[0], score: s.overall })).sort(
    (a, b) => b.score - a.score,
  );

  return (
    <>
      {/* Hero strip */}
      <div className="mb-5 border-2 border-orange/30 bg-navy p-5 text-cream shadow-[6px_6px_0_0_rgba(226,116,10,0.25)] dark:bg-[#0d1730]">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-orange-glow" />
          <div>
            <div className="text-[10px] font-black tracking-[0.3em] text-orange-glow/80">QUICK START</div>
            <p className="mt-1 text-base font-bold leading-snug sm:text-lg md:text-xl">
              Post a notice, schedule a class on the calendar, or mark today's attendance.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <QuickAction icon={<Megaphone className="h-5 w-5" />} label="Post Notice" sub="To all students" onClick={() => goTo("notices")} primary />
        <QuickAction icon={<CalendarDays className="h-5 w-5" />} label="Schedule Class" sub="Click any date" onClick={() => goTo("calendar")} />
        <QuickAction icon={<CheckCircle2 className="h-5 w-5" />} label="Mark Attendance" sub="Today's session" onClick={() => goTo("attendance")} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatTile color={ORANGE} icon={<FileText className="h-4 w-4" />} label="Papers" value={String(PAPERS.length)} sub="this term" />
        <StatTile color={TEAL} icon={<TrendingUp className="h-4 w-4" />} label="Class Avg" value={`${classAvg}%`} sub={`${STUDENTS.length} students`} />
        <StatTile color={ROSE} icon={<AlertTriangle className="h-4 w-4" />} label="At-Risk" value={String(atRisk)} sub="below 60%" />
        <StatTile color={VIOLET} icon={<Award className="h-4 w-4" />} label="Top" value={topPerformer.name.split(" ")[0]} sub={`${topPerformer.overall}% · ${topPerformer.classLevel}`} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" title="Class Overall, sorted" subtitle="Tap a bar's name to inspect" icon={<TrendingUp className="h-4 w-4 text-orange" />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallBars} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={10} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score">
                  {overallBars.map((b, i) => (
                    <Cell key={i} fill={b.score >= 80 ? GREEN : b.score >= 60 ? GLOW : ROSE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Class Difficulty Split" icon={<Activity className="h-4 w-4 text-orange" />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CLASS_DIFFICULTY_SPLIT} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {CLASS_DIFFICULTY_SPLIT.map((c, i) => (<Cell key={i} fill={c.fill} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <GlassCard title="CBSE Typology by Subject" subtitle="Stacked share, class-wide" icon={<BookOpen className="h-4 w-4 text-orange" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUBJECT_TYPOLOGY}>
                <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="subject" stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <YAxis stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Remember" stackId="a" fill={TEAL} />
                <Bar dataKey="Understand" stackId="a" fill={GLOW} />
                <Bar dataKey="Apply" stackId="a" fill={ORANGE} />
                <Bar dataKey="Analyse" stackId="a" fill={VIOLET} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Chapter-wise Avg, Physics" icon={<Activity className="h-4 w-4 text-orange" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChapterPerf("Physics")} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="chapter" type="category" width={120} stroke="currentColor" className="text-navy/60 dark:text-cream/50" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="avg" fill={ORANGE} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <GlassCard title="Latest Notices" subtitle={`${latestNotices.length} posted`} icon={<Megaphone className="h-4 w-4 text-orange" />}>
          {latestNotices.length === 0 ? (
            <Empty text="No notices yet, post one from the Notices tab." />
          ) : (
            <div className="space-y-2">
              {latestNotices.slice(0, 4).map((n) => (
                <div key={n.id} className="border-2 border-navy/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-extrabold text-navy dark:text-cream">{n.title}</div>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-orange">
                      {prettyDate(n.date)}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-xs text-navy/60 dark:text-cream/60">{n.body}</div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard title="Upcoming Classes" subtitle={`${upcoming.length} scheduled`} icon={<CalendarDays className="h-4 w-4 text-orange" />}>
          {upcoming.length === 0 ? (
            <Empty text="No classes scheduled, add one from the Calendar tab." />
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-3 border-2 border-navy/10 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
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

      <div className="mt-5">
        <GlassCard title="Click a student for full report" icon={<Users className="h-4 w-4 text-orange" />}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {STUDENTS.slice(0, 8).map((s) => (
              <button
                key={s.id}
                onClick={() => openStudent(s)}
                className="group flex items-center justify-between gap-2 border-2 border-navy/10 bg-white p-2.5 text-left transition hover:border-orange dark:border-white/10 dark:bg-white/5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-navy dark:text-cream">{s.name}</div>
                  <div className="text-[10px] font-bold text-navy/55 dark:text-cream/55">{s.classLevel} · {s.overall}%</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-navy/30 group-hover:text-orange" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

/* ---------------- PAPERS ---------------- */
function PapersPanel() {
  const [activePaperId, setActivePaperId] = useState(PAPERS[0].id);
  const activePaper = PAPERS.find((p) => p.id === activePaperId) ?? PAPERS[0];

  const difficultyData = [
    { name: "Easy", mix: activePaper.difficultyMix.easy, perf: activePaper.performanceByDifficulty.easy },
    { name: "Medium", mix: activePaper.difficultyMix.medium, perf: activePaper.performanceByDifficulty.medium },
    { name: "Hard", mix: activePaper.difficultyMix.hard, perf: activePaper.performanceByDifficulty.hard },
  ];
  const typologyData = [
    { name: "Remember", value: activePaper.typology.remembering },
    { name: "Apply", value: activePaper.typology.applying },
    { name: "Analyse", value: activePaper.typology.analysing },
  ];
  const typologyColors = [ORANGE, GLOW, GOLD];

  return (
    <GlassCard title="Paper Performance" subtitle="Switch papers to inspect" icon={<Activity className="h-4 w-4 text-orange" />}>
      <div className="mb-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {PAPERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePaperId(p.id)}
            className={`shrink-0 border-2 px-3 py-1.5 text-xs font-black uppercase tracking-wide transition ${
              activePaperId === p.id
                ? "border-orange bg-orange text-white"
                : "border-navy/15 bg-white text-navy hover:border-orange dark:border-white/15 dark:bg-white/5 dark:text-cream"
            }`}
          >
            {p.title.replace(/ \(.*\)/, "")}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Pill label="Avg Score" value={`${activePaper.avgScore}%`} />
        <Pill label="Students" value={`${activePaper.totalStudents}`} />
        <Pill label="Date" value={activePaper.date} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-navy/55 dark:text-cream/55">DIFFICULTY MIX vs PERFORMANCE</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData}>
                <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <YAxis stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="mix" fill={NAVY} name="Mix %" />
                <Bar dataKey="perf" fill={ORANGE} name="Avg %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-navy/55 dark:text-cream/55">BLOOM TYPOLOGY</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typologyData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {typologyData.map((_, i) => (<Cell key={i} fill={typologyColors[i]} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-navy/55 dark:text-cream/55">LEADERBOARD</div>
        <div className="space-y-1.5">
          {activePaper.leaderboard.map((l, i) => (
            <div key={l.name} className="flex items-center justify-between border-2 border-navy/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`grid h-7 w-7 place-items-center text-xs font-black ${i === 0 ? "bg-orange text-white" : "bg-navy/10 text-navy dark:bg-white/10 dark:text-cream"}`}>{i + 1}</div>
                <div className="font-bold text-navy dark:text-cream">{l.name}</div>
              </div>
              <div className="font-black text-orange">{l.score}%</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------------- STUDENTS (clickable rows) ---------------- */
function StudentsPanel({ onOpen }: { onOpen: (s: Student) => void }) {
  return (
    <GlassCard title="Class Roster" subtitle="Tap any row for the full report" icon={<GraduationCap className="h-4 w-4 text-orange" />}>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] font-black uppercase tracking-wider text-navy/55 dark:text-cream/55">
            <tr className="border-b-2 border-navy/15 dark:border-white/15">
              <th className="py-2 pr-3">Student</th>
              <th className="px-3">Class</th>
              <th className="px-3">Overall</th>
              <th className="px-3">Attendance</th>
              <th className="px-3">Streak</th>
              <th className="px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s) => (
              <tr
                key={s.id}
                onClick={() => onOpen(s)}
                className="cursor-pointer border-b border-navy/5 text-navy hover:bg-orange/5 dark:border-white/5 dark:text-cream dark:hover:bg-white/5"
              >
                <td className="py-2.5 pr-3 font-bold">{s.name}</td>
                <td className="px-3 text-navy/70 dark:text-cream/70">{s.classLevel}</td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden bg-navy/10 dark:bg-white/10">
                      <div className="h-full bg-orange" style={{ width: `${s.overall}%` }} />
                    </div>
                    <span className="font-bold">{s.overall}%</span>
                  </div>
                </td>
                <td className="px-3 text-navy/70 dark:text-cream/70">{s.attendance.present}%</td>
                <td className="px-3">
                  <span className="inline-flex items-center gap-1 text-orange"><Flame className="h-3 w-3" />{s.streak}</span>
                </td>
                <td className="px-3 text-right">
                  <StatusBadge overall={s.overall} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {STUDENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpen(s)}
            className="flex w-full items-center justify-between gap-3 border-2 border-navy/10 bg-white p-3 text-left dark:border-white/10 dark:bg-white/5"
          >
            <div className="min-w-0">
              <div className="truncate font-extrabold text-navy dark:text-cream">{s.name}</div>
              <div className="text-[11px] text-navy/55 dark:text-cream/55">{s.classLevel} · {s.attendance.present}% present · 🔥 {s.streak}</div>
              <div className="mt-1.5 h-1.5 w-32 overflow-hidden bg-navy/10 dark:bg-white/10">
                <div className="h-full bg-orange" style={{ width: `${s.overall}%` }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-navy dark:text-cream">{s.overall}%</div>
              <StatusBadge overall={s.overall} />
            </div>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function StatusBadge({ overall }: { overall: number }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
        overall >= 80
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
          : overall >= 60
            ? "bg-orange/15 text-orange"
            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
      }`}
    >
      {overall >= 80 ? "On track" : overall >= 60 ? "Watch" : "At risk"}
    </span>
  );
}

/* ---------------- STUDENT DETAIL MODAL ---------------- */
function StudentDetailModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const subjects = Object.entries(student.subjects);
  const radar = [
    { skill: "Conceptual", value: Math.min(99, student.overall + 4) },
    { skill: "Speed", value: Math.max(40, student.overall - 8) },
    { skill: "Accuracy", value: Math.min(99, student.overall + 2) },
    { skill: "Numerical", value: student.overall - 2 },
    { skill: "Theory", value: student.overall - 5 },
    { skill: "Application", value: student.overall - 1 },
  ];
  const attendance = [
    { name: "Present", value: student.attendance.present, fill: GREEN },
    { name: "Online", value: student.attendance.online, fill: ORANGE },
    { name: "Absent", value: student.attendance.absent, fill: ROSE },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/60 backdrop-blur-sm" onClick={onClose}>
      <div className="min-h-full px-3 py-6 sm:py-10">
        <div
          className="mx-auto max-w-4xl border-2 border-orange/40 bg-[#F9F8F6] shadow-2xl dark:bg-[#0a1224]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b-2 border-navy/10 bg-navy p-5 text-cream dark:border-white/10">
            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-[0.3em] text-orange-glow">STUDENT REPORT</div>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">{student.name}</h2>
              <div className="text-sm text-cream/70">{student.classLevel} · Overall {student.overall}%</div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center border-2 border-cream/30 text-cream hover:bg-cream/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <StatTile color={ORANGE} icon={<TrendingUp className="h-4 w-4" />} label="Overall" value={`${student.overall}%`} sub="this term" />
              <StatTile color={GREEN} icon={<CheckCircle2 className="h-4 w-4" />} label="Present" value={`${student.attendance.present}%`} sub={`${student.attendance.online}% online`} />
              <StatTile color={ROSE} icon={<AlertTriangle className="h-4 w-4" />} label="Absent" value={`${student.attendance.absent}%`} sub="this term" />
              <StatTile color={VIOLET} icon={<Flame className="h-4 w-4" />} label="Streak" value={`${student.streak}d`} sub="active days" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {subjects.map(([sub, val]) => (
                <SubjectRing key={sub} subject={sub} value={val} />
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard title="Skill Radar" icon={<GraduationCap className="h-4 w-4 text-orange" />}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radar}>
                      <PolarGrid stroke="rgba(17,45,87,0.18)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 10 }} className="text-navy dark:text-cream" />
                      <Radar dataKey="value" stroke={ORANGE} fill={GLOW} fillOpacity={0.45} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard title="Attendance Split" icon={<Activity className="h-4 w-4 text-orange" />}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attendance} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                        {attendance.map((a, i) => (<Cell key={i} fill={a.fill} />))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {subjects.map(([sub, val]) => (
              <GlassCard key={sub} title={`Chapter-wise, ${sub}`} subtitle={`Subject avg ${val}%`} icon={<BookOpen className="h-4 w-4 text-orange" />}>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentChapterPerf(student.id, sub, val)} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(17,45,87,0.08)" strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} stroke="currentColor" className="text-navy/50 dark:text-cream/40" fontSize={11} />
                      <YAxis dataKey="chapter" type="category" width={120} stroke="currentColor" className="text-navy/60 dark:text-cream/50" fontSize={10} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="score">
                        {studentChapterPerf(student.id, sub, val).map((d, i) => (
                          <Cell key={i} fill={d.score >= 80 ? GREEN : d.score >= 60 ? GLOW : ROSE} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectRing({ subject, value }: { subject: string; value: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="flex items-center gap-3 border-2 border-navy/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(17,45,87,0.12)" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={ORANGE} strokeWidth="7"
          strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90 40 40)" />
        <text x="40" y="45" textAnchor="middle" className="fill-navy dark:fill-cream" fontSize="16" fontWeight="900">{value}</text>
      </svg>
      <div>
        <div className="text-sm font-extrabold text-navy dark:text-cream">{subject}</div>
        <div className="text-[11px] text-navy/55 dark:text-cream/55">out of 100</div>
      </div>
    </div>
  );
}

/* ---------------- NOTICES ---------------- */
function NoticesPanel() {
  const [notices, setNotices] = useNotices();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const post = () => {
    if (!title.trim() || !body.trim()) return;
    const n: Notice = { id: uid(), title: title.trim(), body: body.trim(), date: new Date().toISOString() };
    setNotices([n, ...notices]);
    setTitle(""); setBody("");
  };

  return (
    <div className="space-y-6">
      <GlassCard title="Post a Notice" icon={<Megaphone className="h-4 w-4 text-orange" />}>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" className={fieldCls} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the notice here…" rows={4} className={fieldCls} />
          <button onClick={post} disabled={!title.trim() || !body.trim()} className={primaryBtn}>
            <Plus className="h-4 w-4" /> Publish
          </button>
        </div>
      </GlassCard>

      <GlassCard title="Published" subtitle={`${notices.length} live`}>
        {notices.length === 0 ? (
          <Empty text="Nothing posted yet." />
        ) : (
          <div className="space-y-2">
            {[...notices].sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 border-2 border-navy/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <div>
                  <div className="font-extrabold text-navy dark:text-cream">{n.title}</div>
                  <div className="text-xs text-navy/55 dark:text-cream/55">{prettyDate(n.date)}</div>
                  <p className="mt-1 text-sm text-navy/75 dark:text-cream/75">{n.body}</p>
                </div>
                <button onClick={() => setNotices(notices.filter((x) => x.id !== n.id))} className="shrink-0 border-2 border-transparent p-2 text-navy/40 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ---------------- CALENDAR (click date to schedule) ---------------- */
function CalendarPanel() {
  const [classes, setClasses] = useClasses();
  const [picked, setPicked] = useState<string | null>(null);
  const [time, setTime] = useState("17:00");
  const [title, setTitle] = useState("");
  const [classLevel, setClassLevel] = useState("XII PCM");

  const add = () => {
    if (!picked || !time || !title.trim()) return;
    const c: ScheduledClass = { id: uid(), date: picked, time, title: title.trim(), classLevel };
    setClasses([...classes, c]);
    setTitle("");
  };

  const dayEvents = picked ? classes.filter((c) => c.date === picked) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <GlassCard title="Click a date to schedule" subtitle="Tap any day on the grid" icon={<CalendarDays className="h-4 w-4 text-orange" />}>
          <MonthCalendar events={classes} onDayClick={setPicked} selectedDate={picked ?? undefined} />
        </GlassCard>
      </div>

      <div className="space-y-4">
        <GlassCard
          accent
          title={picked ? `Schedule for ${prettyDate(picked)}` : "Pick a date"}
          icon={<Plus className="h-4 w-4 text-orange" />}
        >
          {!picked ? (
            <Empty text="Click any date on the calendar to add a class." />
          ) : (
            <div className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Topic, e.g. Coulomb's Law revision" className={fieldCls} />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls} />
                <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className={fieldCls}>
                  {["XII PCM", "XI PCM", "X", "ALL"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={add} disabled={!title.trim()} className={primaryBtn}>
                <Plus className="h-4 w-4" /> Add to {prettyDate(picked)}
              </button>
            </div>
          )}
        </GlassCard>

        {picked && (
          <GlassCard title="On this day" subtitle={`${dayEvents.length} class${dayEvents.length === 1 ? "" : "es"}`}>
            {dayEvents.length === 0 ? (
              <Empty text="Nothing yet." />
            ) : (
              <div className="space-y-2">
                {dayEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((c) => (
                    <div key={c.id} className="flex items-center gap-3 border-2 border-navy/10 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-navy dark:text-cream">{c.title}</div>
                        <div className="text-xs text-navy/60 dark:text-cream/60">{c.time} · {c.classLevel}</div>
                      </div>
                      <button onClick={() => setClasses(classes.filter((x) => x.id !== c.id))} className="border-2 border-transparent p-2 text-navy/40 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}

/* ---------------- ATTENDANCE ---------------- */
function AttendancePanel() {
  const [marks, setMarks] = useAttendance();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [classFilter, setClassFilter] = useState<string>("XII PCM");

  const filtered = STUDENTS.filter((s) => s.classLevel === classFilter);

  const todayMark = (studentId: string): AttendanceMark["status"] | null => {
    const m = marks.find((x) => x.studentId === studentId && x.date === date);
    return m?.status ?? null;
  };

  const setStatus = (studentId: string, status: AttendanceMark["status"]) => {
    const rest = marks.filter((x) => !(x.studentId === studentId && x.date === date));
    setMarks([...rest, { studentId, date, status }]);
  };

  const markAll = (status: AttendanceMark["status"]) => {
    const rest = marks.filter((x) => !(filtered.some((s) => s.id === x.studentId) && x.date === date));
    const fresh = filtered.map((s) => ({ studentId: s.id, date, status }));
    setMarks([...rest, ...fresh]);
  };

  const done = filtered.filter((s) => todayMark(s.id) !== null).length;

  return (
    <div className="space-y-6">
      <GlassCard title="Mark Attendance" subtitle={`${done}/${filtered.length} marked today`} icon={<CheckCircle2 className="h-4 w-4 text-orange" />}>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} />
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={fieldCls}>
            {Array.from(new Set(STUDENTS.map((s) => s.classLevel))).map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => markAll("present")} className={`${pillBtn} bg-emerald-500 text-white`}>All Present</button>
            <button onClick={() => markAll("absent")} className={`${pillBtn} bg-red-500 text-white`}>All Absent</button>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          {filtered.map((s) => {
            const cur = todayMark(s.id);
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-2 border-navy/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <div className="font-bold text-navy dark:text-cream">{s.name}</div>
                <div className="flex gap-1.5">
                  {(["present", "online", "absent"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatus(s.id, st)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${
                        cur === st
                          ? st === "present"
                            ? "bg-emerald-500 text-white"
                            : st === "online"
                              ? "bg-orange text-white"
                              : "bg-red-500 text-white"
                          : "bg-navy/5 text-navy/60 hover:bg-navy/10 dark:bg-white/10 dark:text-cream/60"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------------- helpers ---------------- */
const tooltipStyle = {
  background: "var(--cream-soft)",
  border: "2px solid rgba(226,116,10,0.4)",
  borderRadius: 0,
  fontSize: 12,
} as const;

const fieldCls =
  "w-full border-2 border-navy/15 bg-white px-3 py-2 text-sm font-medium text-navy outline-none transition focus:border-orange dark:border-white/15 dark:bg-white/5 dark:text-cream";

const primaryBtn =
  "inline-flex items-center gap-2 self-start bg-orange px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[3px_3px_0_0_#112D57] transition hover:bg-[#c95f00] disabled:opacity-50";

const pillBtn = "px-3 py-2 text-xs font-black uppercase tracking-wider transition hover:brightness-105";

function QuickAction({
  icon, label, sub, onClick, primary,
}: { icon: React.ReactNode; label: string; sub: string; onClick?: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} className={`group flex items-center gap-3 border-2 p-4 text-left transition hover:-translate-y-0.5 ${primary ? "border-orange bg-orange text-white shadow-[4px_4px_0_0_#112D57]" : "border-navy/15 bg-white text-navy hover:border-orange dark:border-white/15 dark:bg-white/5 dark:text-cream"}`}>
      <div className={`grid h-10 w-10 place-items-center ${primary ? "bg-white/20 text-white" : "bg-orange/15 text-orange"}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-black uppercase tracking-wide">{label}</div>
        <div className={`text-xs ${primary ? "text-white/85" : "text-navy/55 dark:text-cream/55"}`}>{sub}</div>
      </div>
    </button>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-navy/15 bg-white px-4 py-3 dark:border-white/15 dark:bg-white/5">
      <div className="text-[10px] font-black uppercase tracking-wider text-navy/55 dark:text-cream/55">{label}</div>
      <div className="mt-0.5 text-lg font-black text-navy dark:text-cream">{value}</div>
    </div>
  );
}

function StatTile({
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

function Empty({ text }: { text: string }) {
  return <div className="border-2 border-dashed border-navy/20 px-6 py-8 text-center text-sm text-navy/55 dark:border-white/15 dark:text-cream/55">{text}</div>;
}

function prettyDate(d: string) {
  try { return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); } catch { return d; }
}
function shortMonth(d: string) {
  try { return new Date(d).toLocaleDateString(undefined, { month: "short" }).toUpperCase(); } catch { return ""; }
}

