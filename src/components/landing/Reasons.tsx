import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, FileText, Lightbulb, Link2, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { Band, Heading, Rise, hair, ink, sub } from "./ui";

const reasons = [
  { Icon: Users, title: "Small batches", body: "Max 12 per batch. Every student gets seen, heard and stretched, every single class." },
  { Icon: Link2, title: "In sync with school", body: "We complement your school's pace, not a parallel track that doubles your load." },
  { Icon: Sparkles, title: "AI-backed check-ins", body: "A short check every two classes: insight, not guesswork." },
  { Icon: ShieldCheck, title: "A safe place to be wrong", body: "Non-intimidating. Diverse. Curious. The right answers come after the safe ones." },
  { Icon: Eye, title: "Eyes on progress", body: "Faculty see exactly where each student is, weekly, not termly." },
  { Icon: FileText, title: "Honest parent reports", body: "No surprises in March. Truthful updates, fortnightly." },
  { Icon: Target, title: "Outcome-anchored", body: "Designed for Boards, JEE, NEET, SAT and undergrad admissions abroad, together, not separately." },
  { Icon: Lightbulb, title: "Curiosity-first", body: "We protect the muscle most coaching kills, the one that asks 'why', not 'what's the trick'." },
];

const words = ["students", "families", "parents", "teachers"];

/* The headline's one moving word. Static under reduced motion. */
function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span className="relative inline-block min-w-[6ch] text-navy">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          initial={reduce ? false : { y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* Eight reasons as a ruled two-column list: no cards. */
export function Reasons() {
  return (
    <Band id="why">
      <Rise>
        <Heading intro="A thinking institute, built for students who want to understand, not just survive, their syllabus.">
          Eight reasons <RotatingWord /> stay.
        </Heading>
      </Rise>
      <div className="mt-14 grid gap-x-16 md:grid-cols-2">
        {reasons.map((r, i) => (
          <Rise key={r.title} delay={(i % 2) * 0.06} className={`border-t py-8 ${hair}`}>
            <r.Icon className="h-6 w-6 text-navy" strokeWidth={1.5} />
            <h3 className={`mt-4 text-xl font-semibold tracking-[-0.01em] ${ink}`}>{r.title}</h3>
            <p className={`mt-2 max-w-[48ch] ${sub}`}>{r.body}</p>
          </Rise>
        ))}
      </div>
    </Band>
  );
}
