import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { QUOTES } from "@/lib/dummy-data";

export function RotatingQuote({
  quotes = QUOTES,
  className = "",
  variant = "card",
}: {
  quotes?: string[];
  className?: string;
  variant?: "card" | "ghost";
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % quotes.length), 4500);
    return () => clearInterval(t);
  }, [quotes.length]);

  if (variant === "ghost") {
    return (
      <div className={`relative ${className}`}>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="font-handwritten text-base italic leading-relaxed text-navy/60"
          >
            "{quotes[i]}"
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border border-orange/30 bg-gradient-to-br from-orange/15 via-gold/10 to-orange/5 p-6 backdrop-blur ${className}`}>
      <Quote className="absolute -right-3 -top-3 h-20 w-20 text-orange/15" />
      <div className="text-[0.62rem] font-extrabold tracking-[0.32em] text-orange">
       , TODAY'S SPARK
      </div>
      <div className="mt-3 min-h-[64px]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg font-bold italic leading-snug text-navy md:text-xl"
          >
            "{quotes[i]}"
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex gap-1.5">
        {quotes.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 rounded-full transition-all ${idx === i ? "w-6 bg-orange" : "w-1.5 bg-orange/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
