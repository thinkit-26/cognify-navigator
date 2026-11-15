import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/viva/Button";
import { Eyebrow, VivaShell, vivaCard } from "@/components/viva/Shell";
import { getTopics } from "@/lib/viva/api";
import { requireVivaAccess } from "@/lib/viva/guard";

export const Route = createFileRoute("/viva/select-topic")({
  ssr: false, // the token lives in sessionStorage, so the check must run in the browser
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "Select Topics, AI Oral Viva" }] }),
  component: TopicSelectionPage,
});

function TopicSelectionPage() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const chapters = JSON.parse(
      localStorage.getItem("selectedChapters") || "[]"
    );

    async function loadTopics() {
      try {
        const data = await getTopics(chapters);
        setTopics(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadTopics();
  }, []);

  function toggle(topic: string) {
    if (selected.includes(topic)) {
      setSelected(selected.filter((t) => t !== topic));
    } else {
      setSelected([...selected, topic]);
    }
  }

  function continueHandler() {
    localStorage.setItem(
      "selectedTopics",
      JSON.stringify(selected)
    );

    navigate({ to: "/viva/instructions" });
  }

  return (
    <VivaShell step={1}>
      <Eyebrow>STEP 2 OF 4</Eyebrow>
      <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.05] text-navy dark:text-cream md:text-5xl">
        Choose your <span className="text-gradient-warm">topics.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">Questions will come only from the topics you tick.</p>

      <div className="mt-10 space-y-3">
        {topics.map((topic) => {
          const on = selected.includes(topic);
          return (
            <button
              type="button"
              key={topic}
              aria-pressed={on}
              onClick={() => toggle(topic)}
              className={`${vivaCard} flex w-full items-center gap-4 px-6 py-4 text-left font-bold text-navy transition hover:-translate-y-0.5 dark:text-cream ${
                on ? "!border-navy ring-2 ring-navy/10" : ""
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${on ? "border-navy bg-navy text-cream" : "border-navy/25"}`}>
                {on && <Check className="h-4 w-4" />}
              </span>
              {topic}
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-10 flex items-center justify-between gap-4 rounded-full border border-border bg-white/90 px-6 py-3 shadow-soft backdrop-blur dark:bg-[#0a1224]/90">
        <span className="text-sm font-bold text-navy dark:text-cream">
          {selected.length === 0 ? "No topics selected" : `${selected.length} topic${selected.length === 1 ? "" : "s"} selected`}
        </span>
        <Button disabled={selected.length === 0} onClick={continueHandler}>
          Continue
        </Button>
      </div>
    </VivaShell>
  );
}
