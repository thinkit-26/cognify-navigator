import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, X } from "lucide-react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdfjs";

// Shows a PDF or an image inside the page instead of in a new tab. PDFs are drawn page by page, each page
// only when it is about to scroll into view, and a grey placeholder pulses until it is ready.

const A4 = 1.414;

// The page behind must not scroll while a file is open. A counter, because a viewer that is still fading
// out can overlap the next one that opens.
let scrollLocks = 0;
const setScrollLock = (on: boolean) => {
  scrollLocks += on ? 1 : -1;
  document.body.style.overflow = scrollLocks > 0 ? "hidden" : "";
};
const shimmer = "animate-pulse bg-navy/10 motion-reduce:animate-none dark:bg-white/10";

function PdfPage({ doc, index, ratio }: { doc: PDFDocumentProxy; index: number; ratio: number }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [aspect, setAspect] = useState(ratio);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let task: RenderTask | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        void (async () => {
          const page = await doc.getPage(index);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (el.clientWidth * Math.min(window.devicePixelRatio || 1, 2)) / base.width });
          const c = canvas.current!;
          c.width = viewport.width;
          c.height = viewport.height;
          setAspect(base.height / base.width);
          task = page.render({ canvasContext: c.getContext("2d")!, canvas: c, viewport });
          await task.promise;
          if (!cancelled) setReady(true);
        })().catch(() => {}); // a cancelled render ends here
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      task?.cancel();
    };
  }, [doc, index]);

  return (
    <div ref={box} style={{ aspectRatio: `1 / ${aspect}` }} className="relative w-full overflow-hidden rounded-lg bg-white shadow-sm">
      {!ready && <div className={`absolute inset-0 ${shimmer}`} />}
      <canvas ref={canvas} className={`h-full w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

function PdfPages({ url, onFail }: { url: string; onFail: () => void }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [ratio, setRatio] = useState(A4);
  const fail = useRef(onFail);
  fail.current = onFail;

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | undefined;
    void (async () => {
      const pdfjs = await loadPdfjs();
      task = pdfjs.getDocument({ url, verbosity: 0 });
      const loaded = await task.promise;
      if (cancelled) return;
      const first = (await loaded.getPage(1)).getViewport({ scale: 1 });
      setRatio(first.height / first.width);
      setDoc(loaded);
    })().catch(() => !cancelled && fail.current());
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [url]);

  if (!doc) return <PageSkeletons />;
  return (
    <div className="space-y-4">
      {Array.from({ length: doc.numPages }, (_, i) => (
        <PdfPage key={i} doc={doc} index={i + 1} ratio={ratio} />
      ))}
    </div>
  );
}

function PageSkeletons() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className={`w-full rounded-lg ${shimmer}`} style={{ aspectRatio: `1 / ${A4}` }} />
      <div className={`w-full rounded-lg ${shimmer}`} style={{ aspectRatio: `1 / ${A4}`, opacity: 0.6 }} />
    </div>
  );
}

function Picture({ url, title }: { url: string; title: string }) {
  const [ready, setReady] = useState(false);
  return (
    <div className="relative min-h-[50vh]">
      {!ready && <div className={`absolute inset-0 rounded-lg ${shimmer}`} />}
      <img src={url} alt={title} onLoad={() => setReady(true)} className={`w-full rounded-lg bg-white shadow-sm transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

async function download(url: string, name: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch {
    window.location.assign(url); // the browser's own download if the file cannot be fetched here
  }
}

export function FileViewer({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closeNow = useRef(onClose);
  closeNow.current = onClose;
  const isPdf = /\.pdf($|\?)/i.test(url);
  const fileName = `${title.replace(/[^\w\- ]+/g, "").trim() || "file"}.${isPdf ? "pdf" : (url.split(".").pop() ?? "png")}`;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    setScrollLock(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeNow.current();
    window.addEventListener("keydown", onKey);
    return () => {
      setScrollLock(false);
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  const t = (duration: number) => ({ duration: reduce ? 0 : duration, ease: [0.16, 1, 0.3, 1] as const });

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex flex-col bg-background/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={t(0.25)}
    >
      <motion.header
        className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={t(0.35)}
      >
        <h2 className="min-w-0 truncate text-sm font-extrabold text-navy dark:text-cream md:text-base">{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => download(url, fileName)}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-navy/30 px-4 py-1 text-xs font-bold text-navy transition hover:border-navy dark:text-cream"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-navy text-white transition hover:bg-navy/90 dark:bg-cream dark:text-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.header>

      <motion.div className="flex-1 overflow-y-auto overscroll-contain" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={t(0.4)}>
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {failed ? (
            <div className="rounded-2xl border border-border bg-white px-6 py-10 text-center dark:bg-white/5">
              <p className="font-bold text-navy dark:text-cream">This file could not be shown here.</p>
              <button type="button" onClick={() => download(url, fileName)} className="mt-4 rounded-full bg-navy px-5 py-2 text-sm font-bold text-white dark:bg-cream dark:text-navy">
                Download it instead
              </button>
            </div>
          ) : isPdf ? (
            <PdfPages url={url} onFail={() => setFailed(true)} />
          ) : (
            <Picture url={url} title={title} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
