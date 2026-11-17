import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Button from "@/components/viva/Button";
import { getChapters } from "@/lib/viva/api";
import type { Chapter } from "@/lib/viva/types";
import { requireVivaAccess } from "@/lib/viva/guard";
import { Eyebrow, VivaShell, vivaCard } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/select")({
  ssr: false, // the token lives in sessionStorage, so the check must run in the browser
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "Select Chapters, AI Oral Viva" }] }),
  component: SelectPage,
});

function SelectPage() {
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getChapters();
        setChapters(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function toggle(chapterNo: number) {
    if (selected.includes(chapterNo)) {
      setSelected(selected.filter((x) => x !== chapterNo));
    } else {
      setSelected([...selected, chapterNo]);
    }
  }

  function continueHandler() {
    localStorage.setItem(
      "selectedChapters",
      JSON.stringify(selected)
    );

    navigate({ to: "/viva/select-topic" });
  }

  const actions = (
    <>
      <Link to="/viva/history" className="text-orange hover:underline">
        Dashboard
      </Link>
      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          sessionStorage.clear();
          navigate({ to: "/viva/gate" });
        }}
        className="text-navy/60 hover:text-navy dark:text-cream/60"
      >
        Sign out
      </button>
    </>
  );

  return (
    <VivaShell step={0} actions={actions} wide>
      <h1 className="text-balance text-4xl font-extrabold leading-[1.05] text-navy dark:text-cream md:text-5xl">
        Pick the chapters you want to be <span className="text-gradient-warm">examined on.</span>
      </h1>

      {loading ? (
        <p className="mt-12 text-navy/60">Loading chapters...</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {chapters.map((chapter, i) => {
            const on = selected.includes(chapter.chapter_no);
            return (
              <motion.button
                type="button"
                key={chapter.chapter_no}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={on}
                onClick={() => toggle(chapter.chapter_no)}
                className={`${vivaCard} group flex items-center gap-5 p-6 text-left transition hover:-translate-y-1 hover:shadow-glow ${
                  on ? "!border-navy ring-2 ring-navy/10" : ""
                }`}
              >
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-tl-xl rounded-br-xl text-xl font-black transition ${
                    on ? "bg-navy text-cream" : "bg-orange/10 text-orange"
                  }`}
                >
                  {on ? <Check className="h-6 w-6" /> : String(chapter.chapter_no).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-extrabold tracking-widest text-navy/50 dark:text-cream/50">CHAPTER {chapter.chapter_no}</span>
                  <span className="mt-1 block text-lg font-extrabold leading-snug text-navy dark:text-cream">{chapter.chapter}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="sticky bottom-4 mt-10 flex items-center justify-between gap-4 rounded-full border border-border bg-white/90 px-6 py-3 shadow-soft backdrop-blur dark:bg-[#0a1224]/90">
        <span className="text-sm font-bold text-navy dark:text-cream">
          {selected.length === 0 ? "No chapters selected" : `${selected.length} chapter${selected.length === 1 ? "" : "s"} selected`}
        </span>
        <Button disabled={selected.length === 0} onClick={continueHandler}>
          Continue
        </Button>
      </div>
    </VivaShell>
  );
}
