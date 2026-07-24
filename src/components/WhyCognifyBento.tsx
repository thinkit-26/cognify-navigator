import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Placeholder } from "./Placeholder";
import iconSmallBatch from "@/assets/icon-small-batch.png";
import iconSchoolSync from "@/assets/icon-school-sync.png";
import iconAiCheck from "@/assets/icon-ai-check.png";
import iconSafeEnv from "@/assets/icon-safe-env.png";
import iconMonitoring from "@/assets/icon-monitoring.png";
import iconReports from "@/assets/icon-reports.png";
import iconOutcome from "@/assets/icon-outcome.png";
import iconCuriosity from "@/assets/icon-curiosity.png";


type Reason = {
  icon: string;
  title: string;
  body: string;
  metric?: string;
  span?: string; // tailwind grid-span override
  tone?: "light" | "dark" | "accent";
  tag: string;
};

const reasons: Reason[] = [
  {
    icon: iconSmallBatch, tag: "01", title: "Small batches",
    body: "Max 12 per batch. Every student gets seen, heard and stretched, every single class.",
    metric: "≤ 12 per batch", span: "md:col-span-2 md:row-span-2", tone: "accent",
  },
  {
    icon: iconSchoolSync, tag: "02", title: "In sync with school",
    body: "We complement your school's pace, not a parallel track that doubles your load.",
    tone: "light",
  },
  {
    icon: iconAiCheck, tag: "03", title: "AI-backed check-ins",
    body: "A short check every two classes, insight, not guesswork.",
    metric: "every 2 classes", tone: "light",
  },
  {
    icon: iconSafeEnv, tag: "04", title: "A safe place to be wrong",
    body: "Non-intimidating. Diverse. Curious. The right answers come after the safe ones.",
    tone: "dark", span: "md:col-span-2",
  },
  {
    icon: iconMonitoring, tag: "05", title: "Eyes on progress",
    body: "Faculty see exactly where each student is, weekly, not termly.",
    tone: "light",
  },
  {
    icon: iconReports, tag: "06", title: "Honest parent reports",
    body: "No surprises in March. Truthful updates, fortnightly.",
    metric: "every 14 days", tone: "light",
  },
  {
    icon: iconOutcome, tag: "07", title: "Outcome-anchored",
    body: "Designed for Boards, JEE, NEET, SAT and undergrad admissions abroad, together, not separately.",
    tone: "accent", span: "md:col-span-2",
  },
  {
    icon: iconCuriosity, tag: "08", title: "Curiosity-first",
    body: "We protect the muscle most coaching kills, the one that asks 'why', not 'what's the trick'.",
    tone: "light",
  },
];


function Card({ r, i }: { r: Reason; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3, once: false });

  const bg =
    r.tone === "dark"
      ? "bg-navy text-white border-navy"
      : r.tone === "accent"
      ? "bg-gradient-to-br from-orange/15 via-gold/10 to-[var(--cream-deep)] dark:to-[#0F172A] border-orange/20"
      : "bg-[var(--cream-soft)] border-border";
  const textMuted = r.tone === "dark" ? "text-white/70" : "text-muted-foreground";
  const tagColor = r.tone === "dark" ? "text-gold" : "text-orange";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-sm rounded-bl-sm border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow md:p-7 ${bg} ${r.span ?? ""}`}
    >
      {/* dotted decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
           style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "14px 14px" }} />

      <div className="relative flex items-start justify-between gap-3">
        <span className={`text-[0.65rem] font-extrabold tracking-[0.3em] ${tagColor}`}>REASON · {r.tag}</span>
        {r.metric && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest ${
            r.tone === "dark" ? "bg-gold/15 text-gold" : "bg-orange/10 text-orange"
          }`}>
            {r.metric.toUpperCase()}
          </span>
        )}
      </div>

      <motion.img
        src={r.icon}
        alt=""
        loading="lazy"
        width={512}
        height={512}
        className="relative mt-4 h-20 w-20 object-contain md:h-24 md:w-24"
        animate={inView ? { rotate: [0, -3, 3, 0] } : {}}
        transition={{ delay: i * 0.05 + 0.3, duration: 0.8 }}
      />

      <h3 className={`relative mt-4 text-xl font-extrabold tracking-tight md:text-2xl ${r.tone === "dark" ? "text-white" : "text-navy"}`}>
        {r.title}
      </h3>
      <p className={`relative mt-2 text-sm leading-relaxed ${textMuted}`}>{r.body}</p>

      {/* Photo placeholder, only on the large feature tile (small batches) */}
      {r.tag === "01" && (
        <div className="relative mt-5 flex-1">
          <Placeholder label="Batch in session" ratio="16/9" />
        </div>
      )}


      {/* hover sparkle line */}
      <span className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full ${
        r.tone === "dark" ? "bg-gold" : "bg-orange"
      }`} />
    </motion.div>
  );
}

export function WhyCognifyBento() {
  return (
    <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-5 md:grid-cols-4">
      {reasons.map((r, i) => (
        <Card key={r.tag} r={r} i={i} />
      ))}
      {/* Wide symmetry tile, long photo container next to Curiosity card */}
      <div className="md:col-span-3">
        <Placeholder label="Curiosity in the room" ratio="16/6" className="h-full" />
      </div>
    </div>
  );
}

