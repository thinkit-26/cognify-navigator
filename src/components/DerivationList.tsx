import { useEffect, useState } from "react";
import { derivationFileUrl, listDerivations } from "@/lib/derivations";

type Item = Awaited<ReturnType<typeof listDerivations>>[number];

export function DerivationList({ cls, subject, chapter }: { cls: number; subject: string; chapter: string }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setItems(null);
    setFailed(false);
    listDerivations(cls, subject, chapter).then(setItems, () => setFailed(true));
  }, [cls, subject, chapter]);

  if (failed) return <p className="mt-3 text-muted-foreground">Could not load derivations. Please try again.</p>;
  if (!items) return <p className="mt-3 text-muted-foreground">Loading…</p>;
  if (items.length === 0) return <p className="mt-3 text-muted-foreground">Derivations for this chapter are coming soon.</p>;

  return (
    <ul className="mt-4 space-y-3 text-left">
      {items.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 dark:border-white/10">
          <span className="font-bold text-navy dark:text-cream">{d.title}</span>
          <a
            href={derivationFileUrl(d.file_path)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-navy/30 px-4 py-1 text-xs font-bold text-navy transition hover:border-navy dark:text-cream"
          >
            Open
          </a>
        </li>
      ))}
    </ul>
  );
}
