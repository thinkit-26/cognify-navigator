import { useEffect, useRef, useState } from "react";
import { Bell, FileText, Megaphone, ClipboardList, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotices, usePapers, useAttempts } from "@/lib/student-notes";

type FeedItem = {
  id: string;
  kind: "paper" | "notice" | "attempt";
  title: string;
  sub: string;
  ts: number;
};

export function NotificationBell({
  role,
  onOpenTab,
}: {
  role: "student" | "admin";
  onOpenTab?: (tab: string) => void;
}) {
  const [papers] = usePapers();
  const [notices] = useNotices();
  const [attempts] = useAttempts();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const seenKey = `cognify_notif_seen_${role}`;
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(seenKey) || 0);
  });

  // Build feed
  const feed: FeedItem[] = [];
  if (role === "student") {
    papers.filter((p) => p.broadcast).forEach((p) =>
      feed.push({
        id: `p-${p.id}`,
        kind: "paper",
        title: `New MCQ: ${p.title}`,
        sub: `${p.subject} · ${p.questions.length} Qs · ${p.durationMin} min`,
        ts: new Date(p.createdAt).getTime(),
      })
    );
    notices.forEach((n) =>
      feed.push({
        id: `n-${n.id}`,
        kind: "notice",
        title: n.title,
        sub: n.body.slice(0, 80),
        ts: new Date(n.date).getTime(),
      })
    );
  } else {
    attempts.forEach((a) => {
      const paper = papers.find((p) => p.id === a.paperId);
      feed.push({
        id: `a-${a.id}`,
        kind: "attempt",
        title: `${a.studentId} submitted "${paper?.title ?? "a paper"}"`,
        sub: `Score ${a.score}/${a.total}`,
        ts: new Date(a.submittedAt).getTime(),
      });
    });
    papers.forEach((p) =>
      feed.push({
        id: `p-${p.id}`,
        kind: "paper",
        title: p.broadcast ? `Broadcast: ${p.title}` : `Draft: ${p.title}`,
        sub: `${p.subject} · ${p.questions.length} Qs`,
        ts: new Date(p.createdAt).getTime(),
      })
    );
  }
  feed.sort((a, b) => b.ts - a.ts);
  const recent = feed.slice(0, 12);
  const unread = feed.filter((f) => f.ts > lastSeen).length;

  // Click outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) {
      const now = Date.now();
      localStorage.setItem(seenKey, String(now));
      setLastSeen(now);
    }
  };

  const iconFor = (k: FeedItem["kind"]) => {
    if (k === "paper") return <ClipboardList className="h-4 w-4 text-orange" />;
    if (k === "notice") return <Megaphone className="h-4 w-4 text-gold" />;
    return <FileText className="h-4 w-4 text-navy dark:text-cream" />;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative grid h-10 w-10 place-items-center rounded-full border border-orange/30 bg-orange/10 text-orange transition hover:bg-orange/20 dark:border-orange/40 dark:bg-orange/15"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange px-1 text-[10px] font-black text-white shadow ring-2 ring-cream dark:ring-[#0a1224]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-2xl dark:border-orange/20 dark:bg-[#0d1730]"
          >
            <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3 dark:border-orange/20">
              <div>
                <div className="text-[10px] font-extrabold tracking-[0.25em] text-orange">
                  NOTIFICATIONS
                </div>
                <div className="text-sm font-extrabold text-navy dark:text-cream">
                  {recent.length === 0 ? "All clear" : `${recent.length} recent`}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-navy/60 hover:bg-navy/5 dark:text-cream/60 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {recent.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-navy/60 dark:text-cream/60">
                  Nothing new yet.
                </div>
              )}
              {recent.map((f) => {
                const isNew = f.ts > lastSeen;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (onOpenTab) {
                        if (f.kind === "paper" && role === "student") onOpenTab("tests");
                        else if (f.kind === "notice") onOpenTab(role === "admin" ? "announcements" : "notices");
                        else if (f.kind === "attempt") onOpenTab("papers");
                      }
                    }}
                    className={`flex w-full items-start gap-3 border-b border-navy/5 px-4 py-3 text-left transition hover:bg-navy/5 dark:border-white/5 dark:hover:bg-white/5 ${
                      isNew ? "bg-orange/5 dark:bg-orange/10" : ""
                    }`}
                  >
                    <div className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-orange/10 dark:bg-orange/20">
                      {iconFor(f.kind)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-bold text-navy dark:text-cream">
                          {f.title}
                        </div>
                        {isNew && (
                          <span className="rounded-full bg-orange px-1.5 py-0.5 text-[8px] font-black text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-navy/60 dark:text-cream/60">
                        {f.sub}
                      </div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-orange/80">
                        {timeAgo(f.ts)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}
