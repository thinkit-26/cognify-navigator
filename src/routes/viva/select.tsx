import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import { getChapters } from "@/lib/viva/api";
import type { Chapter } from "@/lib/viva/types";

export const Route = createFileRoute("/viva/select")({
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading Chapters...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 pt-32 md:pt-24">
        <h1 className="text-3xl font-bold mb-8">
          Select Chapters
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {chapters.map((chapter) => (
            <motion.div
              key={chapter.chapter_no}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(chapter.chapter_no)}
              className={`cursor-pointer rounded-xl border-2 p-6 transition ${
                selected.includes(chapter.chapter_no)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="text-orange-500 font-semibold">
                Chapter {chapter.chapter_no}
              </p>
              <h2 className="text-xl font-semibold mt-2 text-gray-900">
                {chapter.chapter}
              </h2>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Button
            disabled={selected.length === 0}
            onClick={continueHandler}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
}
