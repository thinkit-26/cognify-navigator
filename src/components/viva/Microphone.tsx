"use client";

import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";

type Phase = "reading" | "recording" | "processing";

interface Props {
  phase: Phase;
  transcript: string;
  error: string | null;
}

export default function Microphone({ phase, transcript, error }: Props) {
  const listening = phase === "recording";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-32 h-32">
        {listening && (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-orange/25"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-2 rounded-full bg-orange/15"
            />
          </>
        )}

        <div
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg ${
            listening ? "bg-rose-600" : "bg-gradient-to-br from-[#E2740A] to-[#FBBF24]"
          }`}
        >
          {listening ? <Square size={32} /> : <Mic size={32} />}
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-extrabold text-navy dark:text-cream">
          {phase === "reading" && "Get ready"}
          {phase === "recording" && "Listening"}
          {phase === "processing" && "Processing"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {phase === "reading" && "Read the question carefully"}
          {phase === "recording" && "Speak clearly into your microphone"}
          {phase === "processing" && "Transcribing your answer..."}
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">Error: {error}</div>
      )}

      <div className="w-full max-w-2xl">
        <div className="bg-secondary/60 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md p-5 border border-border min-h-[120px]">
          <div className="text-xs font-extrabold tracking-widest text-orange mb-2">
            YOUR ANSWER
          </div>
          <p className="text-navy dark:text-cream leading-relaxed">
            {transcript || (
              <span className="text-navy/40 italic">
                Your spoken answer will appear here...
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
