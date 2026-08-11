import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Button from "@/components/viva/Button";
import { getTopics } from "@/lib/viva/api";

export const Route = createFileRoute("/viva/select-topic")({
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto p-6 pt-32 md:pt-24">
        <h1 className="text-3xl font-bold mb-8">
          Select Topics
        </h1>

        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic}
              onClick={() => toggle(topic)}
              className={`cursor-pointer rounded-xl p-5 border-2 text-gray-900 transition ${
                selected.includes(topic)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {topic}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-10">
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
