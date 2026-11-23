import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PyqPick as Pick } from "@/components/PyqPick";
import { DerivationList } from "@/components/DerivationList";
import { PYQ_SUBJECTS } from "@/data/pyqSubjects";
import { listChapters } from "@/lib/derivations";

export const Route = createFileRoute("/derivations")({
  head: () => ({
    meta: [
      { title: "Derivations, Cognify Institute" },
      {
        name: "description",
        content: "Step-by-step derivations for Classes IX–XII at Cognify Institute.",
      },
    ],
  }),
  component: Derivations,
});

function Derivations() {
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [chapters, setChapters] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);

  const subjects = cls ? PYQ_SUBJECTS[cls] : [];

  // Only chapters that already have a derivation are offered.
  useEffect(() => {
    setChapters(null);
    setFailed(false);
    if (!cls || !subject) return;
    listChapters(cls, subject).then(setChapters, () => setFailed(true));
  }, [cls, subject]);

  return (
    <div className="bg-background">
      <section className="pt-36 pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> LEARN <span className="h-px w-8 bg-orange" />
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            <span className="text-gradient-warm">Derivations</span>
          </h1>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Pick
              label="CLASS"
              placeholder="Select class"
              value={cls ? String(cls) : null}
              options={[9, 10, 11, 12].map((c) => ({ value: String(c), label: `Class ${c}` }))}
              onChange={(v) => {
                setCls(Number(v));
                setSubject(null);
                setChapter(null);
              }}
            />
            <Pick
              label="SUBJECT"
              placeholder="Select subject"
              disabled={!cls}
              value={subject}
              options={subjects.map((x) => ({ value: x, label: x }))}
              onChange={(v) => {
                setSubject(v);
                setChapter(null);
              }}
            />
            <Pick
              label="CHAPTER"
              placeholder={subject && chapters?.length === 0 ? "Coming soon" : "Select chapter"}
              disabled={!subject || !chapters?.length}
              value={chapter}
              options={(chapters ?? []).map((c) => ({ value: c, label: c }))}
              onChange={setChapter}
            />
          </div>

          {failed && <p className="mt-8 text-muted-foreground">Could not load chapters. Please try again.</p>}
          {subject && chapters?.length === 0 && <p className="mt-8 text-muted-foreground">Derivations for this subject are coming soon.</p>}

          {subject && chapter && (
            <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-white px-6 py-8 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-orange">
                Class {cls} › {subject} › {chapter}
              </p>
              <DerivationList cls={cls!} subject={subject} chapter={chapter} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
