import { motion } from "framer-motion";

const layers = [
  { label: "Analysing", w: 100, color: "#E8721C" },
  { label: "Applying", w: 80, color: "#F19A3E" },
  { label: "Understanding", w: 60, color: "#F5B800" },
  { label: "Remembering", w: 40, color: "#1B2A4A" },
];

export function BloomPyramid() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
      {layers.map((l, i) => (
        <motion.div
          key={l.label}
          initial={{ opacity: 0, scale: 0.6, y: -10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: i * 0.18, type: "spring", stiffness: 140 }}
          style={{ width: `${l.w}%`, background: l.color }}
          className="flex h-14 items-center justify-center rounded-md text-sm font-extrabold tracking-wide text-white shadow-soft"
        >
          {l.label.toUpperCase()}
        </motion.div>
      ))}
    </div>
  );
}
