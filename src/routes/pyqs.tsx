import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PyqPaperList } from "@/components/PyqPaperList";
import { PYQ_SUBJECTS } from "@/data/pyqSubjects";
import { PYQ_SESSIONS } from "@/data/pyqYears";

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
  const [year, setYear] = useState<string | null>(null);

  const subjects = cls ? PYQ_SUBJECTS[cls] : [];

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
                setYear(null);
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
                setYear(null);
              }}
            />
            <Pick
              label="YEAR"
              placeholder="Select year"
              disabled={!subject}
              value={year}
              options={PYQ_SESSIONS.map((y) => ({ value: y, label: y }))}
              onChange={setYear}
            />
          </div>

          {subject && year && (
            <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-white px-6 py-8 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-orange">
                Class {cls} › {subject} › {year}
              </p>
              <PyqPaperList cls={cls!} subject={subject} year={year} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
