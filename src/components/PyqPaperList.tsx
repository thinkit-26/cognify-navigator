import { useEffect, useState } from "react";
import { listPapers, pyqFileUrl } from "@/lib/pyqPapers";

type Paper = Awaited<ReturnType<typeof listPapers>>[number];

export function PyqPaperList({ cls, subject, chapter }: { cls: number; subject: string; chapter: string }) {
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setPapers(null);
    setFailed(false);
    listPapers(cls, subject, chapter).then(setPapers, () => setFailed(true));
  }, [cls, subject, chapter]);

  if (failed) return <p className="mt-3 text-muted-foreground">Could not load papers. Please try again.</p>;
  if (!papers) return <p className="mt-3 text-muted-foreground">Loading…</p>;
  if (papers.length === 0)
    return <p className="mt-3 text-muted-foreground">Questions for this chapter are coming soon.</p>;

  const btn = "rounded-full border-2 border-navy/30 px-4 py-1 text-xs font-bold text-navy transition hover:border-navy dark:text-cream";
  return (
    <ul className="mt-4 space-y-3 text-left">
      {papers.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 dark:border-white/10">
          <span className="font-bold text-navy dark:text-cream">
            {p.exam} · {p.year}
          </span>
          <span className="flex gap-2">
            <a href={pyqFileUrl(p.paper_path)} target="_blank" rel="noreferrer" className={btn}>Paper</a>
            {p.solution_path && (
              <a href={pyqFileUrl(p.solution_path)} target="_blank" rel="noreferrer" className={btn}>Solution</a>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
