import { motion } from "framer-motion";
import { Astronaut } from "./Doodles";

export type MascotMood = "wave" | "cheer" | "encourage" | "happy";

const moodMessages: Record<MascotMood, string[]> = {
  wave: ["Ready to learn something new today?", "Let's make today count.", "Pick up where you left off?"],
  cheer: ["Amazing work! Keep that streak alive.", "You're on fire 🔥", "That's the spirit!"],
  encourage: ["Every mistake is a step toward mastery.", "Slow is smooth, smooth is fast.", "You've got this."],
  happy: ["Good to see you again!", "Glad you're here.", "Let's get to it."],
};

export function greetingByTime(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Mascot({
  name,
  mood = "wave",
  className = "",
  size = 96,
}: {
  name?: string;
  mood?: MascotMood;
  className?: string;
  size?: number;
}) {
  const greet = greetingByTime();
  const lines = moodMessages[mood];
  // Stable per-mount line so server + client match (avoids hydration mismatch).
  const line = lines[0];
  return (
    <div className={`flex items-end gap-4 ${className}`}>
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: size, height: size }}
        className="shrink-0"
      >
        <Astronaut className="h-full w-full" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-md rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border border-orange/30 bg-accent px-5 py-3 text-navy shadow-soft"
      >
        <div className="absolute -left-2 bottom-4 h-3 w-3 rotate-45 border-b border-l border-orange/30 bg-accent" />
        <p className="text-sm font-extrabold leading-tight">
          {greet}{name ? `, ${name.split(" ")[0]}` : ""}! <span className="text-base">👋</span>
        </p>
        <p className="mt-1 text-xs text-navy/70">{line}</p>
      </motion.div>
    </div>
  );
}
