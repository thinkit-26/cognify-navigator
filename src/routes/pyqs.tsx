import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PyqPaperList } from "@/components/PyqPaperList";
import { PYQ_CHAPTERS } from "@/data/pyqChapters";

export const Route = createFileRoute("/pyqs")({
  head: () => ({
    meta: [
      { title: "PYQ's — Cognify Institute" },
      {
        name: "description",
        content: "Previous year questions for Classes IX–XII at Cognify Institute.",
      },
    ],
  }),
  component: Pyqs,
});

function Pyqs() {
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);

  const subjects = cls ? Object.keys(PYQ_CHAPTERS[cls]) : [];
  const chapters = cls && subject ? PYQ_CHAPTERS[cls][subject] : [];

  return (
    <div className="bg-background">
      <section className="pt-36 pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> PRACTICE <span className="h-px w-8 bg-orange" />
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            Previous Year <span className="text-gradient-warm">Questions</span>
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
              placeholder="Select chapter"
              disabled={!subject}
              value={chapter}
              options={chapters.map((x, i) => ({ value: x, label: `${i + 1}. ${x}` }))}
              onChange={setChapter}
            />
          </div>

          {chapter && (
            <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-white px-6 py-8 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-orange">
                Class {cls} › {subject}
              </p>
              <p className="mt-1 text-xl font-extrabold text-navy dark:text-cream">{chapter}</p>
              <PyqPaperList cls={cls!} subject={subject!} chapter={chapter} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
