import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { FileViewer } from "@/components/FileViewer";
import { PyqPick as Pick } from "@/components/PyqPick";
import { PyqPaperList } from "@/components/PyqPaperList";
import { PYQ_SUBJECTS } from "@/data/pyqSubjects";
import { PYQ_SESSIONS } from "@/data/pyqYears";
import { pyqFileUrl } from "@/lib/pyqPapers";
import { text } from "@/lib/search";

type PyqSearch = { cls?: number; subject?: string; year?: string; view?: string; title?: string };

export const Route = createFileRoute("/pyqs")({
  // The choices and the open paper live in the address, so Back closes the paper and a refresh keeps your place.
  validateSearch: (s: Record<string, unknown>): PyqSearch => ({
    cls: Number(s.cls) || undefined,
    subject: text(s.subject),
    year: text(s.year),
    view: text(s.view),
    title: text(s.title),
  }),
  head: () => ({
    meta: [
      { title: "Previous Year Papers, Cognify Institute" },
      {
        name: "description",
        content: "Previous year questions for Classes IX–XII at Cognify Institute.",
      },
    ],
  }),
  component: Pyqs,
});

function Pyqs() {
  const { cls, subject, year, view, title } = Route.useSearch();
  const navigate = Route.useNavigate();
  const openedHere = useRef(false);

  const subjects = cls ? (PYQ_SUBJECTS[cls] ?? []) : [];
  const validSubject = subject && subjects.includes(subject) ? subject : undefined;

  const open = (path: string, label: string) => {
    openedHere.current = true;
    void navigate({ search: (prev) => ({ ...prev, view: path, title: label }) });
  };
  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back(); // the entry added by open()
    } else {
      void navigate({ search: (prev) => ({ ...prev, view: undefined, title: undefined }), replace: true });
    }
  }, [navigate]);

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
              onChange={(v) => navigate({ search: (prev) => ({ ...prev, cls: Number(v), subject: undefined, year: undefined }), replace: true })}
            />
            <Pick
              label="SUBJECT"
              placeholder="Select subject"
              disabled={!cls}
              value={validSubject ?? null}
              options={subjects.map((x) => ({ value: x, label: x }))}
              onChange={(v) => navigate({ search: (prev) => ({ ...prev, subject: v, year: undefined }), replace: true })}
            />
            <Pick
              label="YEAR"
              placeholder="Select year"
              disabled={!validSubject}
              value={year ?? null}
              options={PYQ_SESSIONS.map((y) => ({ value: y, label: y }))}
              onChange={(v) => navigate({ search: (prev) => ({ ...prev, year: v }), replace: true })}
            />
          </div>

          {cls && validSubject && year && (
            <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-white px-6 py-8 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-orange">
                Class {cls} › {validSubject} › {year}
              </p>
              <PyqPaperList cls={cls} subject={validSubject} year={year} onOpen={open} />
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>{view && <FileViewer key={view} url={pyqFileUrl(view)} title={title ?? "Paper"} onClose={close} />}</AnimatePresence>
    </div>
  );
}
