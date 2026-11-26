import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FileViewer } from "@/components/FileViewer";
import { PyqPick as Pick } from "@/components/PyqPick";
import { DerivationList } from "@/components/DerivationList";
import { PYQ_SUBJECTS } from "@/data/pyqSubjects";
import { derivationFileUrl, listChapters } from "@/lib/derivations";
import type { ChapterOption } from "@/lib/chapters";
import { text } from "@/lib/search";

type DerivationSearch = { cls?: number; subject?: string; chapter?: string; view?: string; title?: string };

export const Route = createFileRoute("/derivations")({
  // The choices and the open derivation live in the address, so Back closes it and a refresh keeps your place.
  validateSearch: (s: Record<string, unknown>): DerivationSearch => ({
    cls: Number(s.cls) || undefined,
    subject: text(s.subject),
    chapter: text(s.chapter),
    view: text(s.view),
    title: text(s.title),
  }),
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
  const { cls, subject, chapter, view, title } = Route.useSearch();
  const navigate = Route.useNavigate();
  const openedHere = useRef(false);
  const [chapters, setChapters] = useState<ChapterOption[] | null>(null);
  const [failed, setFailed] = useState(false);

  const subjects = cls ? (PYQ_SUBJECTS[cls] ?? []) : [];
  const validSubject = subject && subjects.includes(subject) ? subject : undefined;

  // Only chapters that already have a derivation are offered.
  useEffect(() => {
    setChapters(null);
    setFailed(false);
    if (!cls || !validSubject) return;
    listChapters(cls, validSubject).then(setChapters, () => setFailed(true));
  }, [cls, validSubject]);

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
              onChange={(v) => navigate({ search: (prev) => ({ ...prev, cls: Number(v), subject: undefined, chapter: undefined }), replace: true })}
            />
            <Pick
              label="SUBJECT"
              placeholder="Select subject"
              disabled={!cls}
              value={validSubject ?? null}
              options={subjects.map((x) => ({ value: x, label: x }))}
              onChange={(v) => navigate({ search: (prev) => ({ ...prev, subject: v, chapter: undefined }), replace: true })}
            />
            <Pick
              label="CHAPTER"
              placeholder={validSubject && chapters?.length === 0 ? "Coming soon" : "Select chapter"}
              disabled={!validSubject || !chapters?.length}
              value={chapter && chapters?.some((c) => c.name === chapter) ? chapter : null}
              options={(chapters ?? []).map((c) => ({ value: c.name, label: c.name }))}
              onChange={(v) => navigate({ search: (prev) => ({ ...prev, chapter: v }), replace: true })}
            />
          </div>

          {failed && <p className="mt-8 text-muted-foreground">Could not load chapters. Please try again.</p>}
          {validSubject && chapters?.length === 0 && <p className="mt-8 text-muted-foreground">Derivations for this subject are coming soon.</p>}

          {cls && validSubject && chapter && chapters?.some((c) => c.name === chapter) && (
            <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-white px-6 py-8 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-orange">
                Class {cls} › {validSubject} › {chapter}
              </p>
              <DerivationList cls={cls} subject={validSubject} chapter={chapter} onOpen={open} />
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>{view && <FileViewer key={view} url={derivationFileUrl(view)} title={title ?? "Derivation"} onClose={close} />}</AnimatePresence>
    </div>
  );
}
