import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  classLevel: string;
};

export function MonthCalendar({
  events,
  onDayClick,
  selectedDate,
}: {
  events: CalendarEvent[];
  onDayClick?: (iso: string) => void;
  selectedDate?: string;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const { y, m } = cursor;
  const first = new Date(y, m, 1);
  const startDow = first.getDay(); // 0 Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayIso = new Date().toISOString().slice(0, 10);

  const cells = useMemo(() => {
    const out: { iso: string; day: number; inMonth: boolean }[] = [];
    // leading blanks from prev month
    const prevDays = new Date(y, m, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevDays - i;
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      out.push({ iso: iso(py, pm, d), day: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) out.push({ iso: iso(y, m, d), day: d, inMonth: true });
    while (out.length % 7 !== 0 || out.length < 42) {
      const last = out[out.length - 1];
      const dt = new Date(last.iso);
      dt.setDate(dt.getDate() + 1);
      out.push({
        iso: dt.toISOString().slice(0, 10),
        day: dt.getDate(),
        inMonth: dt.getMonth() === m,
      });
      if (out.length >= 42) break;
    }
    return out;
  }, [y, m, startDow, daysInMonth]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [events]);

  const monthLabel = new Date(y, m, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="border-2 border-navy/15 bg-white/80 p-3 dark:border-white/15 dark:bg-white/5 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
          className="grid h-9 w-9 place-items-center border-2 border-navy/20 bg-cream text-navy hover:border-orange hover:text-orange dark:border-white/20 dark:bg-white/10 dark:text-cream"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-base font-black uppercase tracking-wider text-navy dark:text-cream sm:text-lg">
          {monthLabel}
        </div>
        <button
          onClick={() => setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
          className="grid h-9 w-9 place-items-center border-2 border-navy/20 bg-cream text-navy hover:border-orange hover:text-orange dark:border-white/20 dark:bg-white/10 dark:text-cream"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-navy/50 dark:text-cream/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => {
          const ev = byDate.get(c.iso) ?? [];
          const isToday = c.iso === todayIso;
          const isSelected = c.iso === selectedDate;
          const isInteractive = !!onDayClick;
          return (
            <button
              key={c.iso}
              disabled={!isInteractive}
              onClick={() => onDayClick?.(c.iso)}
              className={[
                "group relative aspect-square min-h-[44px] border-2 p-1 text-left transition sm:min-h-[64px]",
                c.inMonth ? "bg-white dark:bg-white/5" : "bg-navy/[0.02] text-navy/30 dark:bg-white/[0.02] dark:text-cream/30",
                isSelected
                  ? "border-orange ring-2 ring-orange/30"
                  : isToday
                    ? "border-navy dark:border-cream"
                    : "border-navy/10 dark:border-white/10",
                isInteractive && c.inMonth ? "cursor-pointer hover:border-orange hover:bg-orange/5" : "",
              ].join(" ")}
            >
              <div
                className={`text-[11px] font-black sm:text-sm ${
                  c.inMonth ? "text-navy dark:text-cream" : ""
                }`}
              >
                {c.day}
              </div>
              {ev.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {ev.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className="truncate bg-orange px-1 py-[1px] text-[8px] font-bold uppercase tracking-wide text-white sm:text-[10px]"
                      title={`${e.time} · ${e.title}`}
                    >
                      <span className="hidden sm:inline">{e.time} </span>
                      {e.title}
                    </div>
                  ))}
                  {ev.length > 2 && (
                    <div className="text-[8px] font-bold text-orange sm:text-[10px]">+{ev.length - 2}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function iso(y: number, m: number, d: number) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}
