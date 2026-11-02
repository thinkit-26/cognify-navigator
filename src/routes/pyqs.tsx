import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

const pill = (on: boolean) =>
  `rounded-full border-2 px-5 py-2 text-sm font-bold transition ${
    on
      ? "border-transparent bg-gradient-to-r from-[#E2740A] to-[#FBBF24] text-white shadow-sm"
      : "border-navy/30 text-navy hover:border-navy dark:text-cream"
  }`;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
        <span className="h-px w-8 bg-orange" /> STEP {n} <span className="h-px w-8 bg-orange" />
      </div>
      <h2 className="text-2xl font-extrabold text-navy dark:text-cream">{title}</h2>
      <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

function Pyqs() {
  const [cls, setCls] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);

  const subjects = cls ? Object.keys(PYQ_CHAPTERS[cls]) : [];
  const chapters = cls && subject ? PYQ_CHAPTERS[cls][subject] : [];

  return (
    <div className="bg-background">
      <section className="pt-36 pb-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> PRACTICE <span className="h-px w-8 bg-orange" />
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            Previous Year <span className="text-gradient-warm">Questions</span>
          </h1>

          <Step n={1} title="Select your class">
            {[9, 10, 11, 12].map((c) => (
              <button
                key={c}
                className={pill(cls === c)}
                onClick={() => {
                  setCls(c);
                  setSubject(null);
                  setChapter(null);
                }}
              >
                Class {c}
              </button>
            ))}
          </Step>

          {cls && (
            <Step n={2} title="Select the subject">
              {subjects.map((s) => (
                <button
                  key={s}
                  className={pill(subject === s)}
                  onClick={() => {
                    setSubject(s);
                    setChapter(null);
                  }}
                >
                  {s}
                </button>
              ))}
            </Step>
          )}

          {subject && (
            <Step n={3} title="Select the chapter">
              {chapters.map((c, i) => (
                <button key={c} className={pill(chapter === c)} onClick={() => setChapter(c)}>
                  {i + 1}. {c}
                </button>
              ))}
            </Step>
          )}

          {chapter && (
            <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-white px-6 py-8 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-orange">
                Class {cls} › {subject}
              </p>
              <p className="mt-1 text-xl font-extrabold text-navy dark:text-cream">{chapter}</p>
              <p className="mt-3 text-muted-foreground">
                Questions for this chapter are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
