import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/viva/Button";
import { Mic, Clock, BrainCircuit, CheckCircle2 } from "lucide-react";
import { startViva } from "@/lib/viva/api";

export const Route = createFileRoute("/viva/instructions")({
  head: () => ({ meta: [{ title: "Instructions, AI Oral Viva" }] }),
  component: InstructionsPage,
});

function InstructionsPage() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const rules = [
    { icon: <Mic className="text-orange-500" />, text: "Allow microphone access when prompted — recording starts automatically for each question." },
    { icon: <Clock className="text-orange-500" />, text: "You'll get a few seconds to read each question before recording begins." },
    { icon: <BrainCircuit className="text-orange-500" />, text: "You have up to 90 seconds to answer. Click Next when you're done, or it advances automatically." },
    { icon: <CheckCircle2 className="text-orange-500" />, text: "Speak clearly. Your responses are evaluated automatically." },
  ];

  async function handleStart() {
    setStarting(true);

    const chapters = JSON.parse(
      localStorage.getItem("selectedChapters") || "[]"
    );

    const topics = JSON.parse(
      localStorage.getItem("selectedTopics") || "[]"
    );

    // Request mic permission here, up front, so the viva page can
    // auto-start recording without ever needing to prompt mid-question.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setStarting(false);
      console.error(err);
      alert(
        "Microphone access is required to take the viva. Please allow microphone access and try again."
      );
      return;
    }

    try {
      const session = await startViva(chapters, topics);

      localStorage.setItem("sessionId", session.session_id);

      navigate({ to: "/viva/viva" });
    } catch (err) {
      setStarting(false);
      console.error(err);
      alert("Unable to start viva.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6 pt-32 md:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-2xl w-full"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Instructions
          </h2>

          <div className="space-y-6 mb-10">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-gray-50 rounded-xl p-4"
              >
                {rule.icon}
                <span>{rule.text}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleStart}
            disabled={starting}
          >
            {starting ? "Starting..." : "Begin Test"}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
