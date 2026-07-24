import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * "Old way" vs "Cognify way", paired contrasts.
 * Aggressive multi-stroke scribble cross-out (not a single line).
 * Re-triggers each time the section re-enters view.
 */
const pairs = [
  { old: "Memorise the formula", neu: "Derive the formula" },
  { old: "Finish the syllabus", neu: "Understand the syllabus" },
  { old: "Solve for the answer", neu: "Solve for the why" },
  { old: "Cram before the exam", neu: "Compound across the year" },
];

const ROW_GAP = 0.8;
const STRIKE_DUR = 0.7;

/* Slightly randomised strike-through: 1-2 passes, varying angle. */
function Scribble({ play, base, seed }: { play: boolean; base: number; seed: number }) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 9999 + n) * 10000;
    return x - Math.floor(x);
  };
  const twoLines = rand(1) > 0.5;
  const buildPath = (k: number) => {
    const y1 = 36 + (rand(k * 2) - 0.5) * 20;
    const y2 = 44 + (rand(k * 2 + 1) - 0.5) * 20;
    const ymid = (y1 + y2) / 2 + (rand(k * 3) - 0.5) * 10;
    return `M4,${y1.toFixed(1)} C150,${ymid.toFixed(1)} 320,${(ymid + 4).toFixed(1)} 596,${y2.toFixed(1)}`;
  };
  const passes = twoLines
    ? [
        { d: buildPath(1), w: 5, delay: 0 },
        { d: buildPath(2), w: 4.5, delay: 0.12 },
      ]
    : [{ d: buildPath(1), w: 5.5, delay: 0 }];
  return (
    <svg
      viewBox="0 0 600 80"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="scribbleGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#E8721C" />
          <stop offset="100%" stopColor="#F5B800" />
        </linearGradient>
      </defs>
      {passes.map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          fill="none"
          stroke="url(#scribbleGrad)"
          strokeWidth={p.w}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{
            delay: base + p.delay,
            duration: STRIKE_DUR,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
      ))}
    </svg>
  );
}

export function CrossOff() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  return (
    <div ref={ref} className="relative">
      <div className="mb-12 max-w-2xl">
        <div className="text-[0.7rem] font-semibold tracking-[0.3em] text-[var(--orange)]">A BETTER WAY TO LEARN</div>
        <h2 className="mt-4 text-balance text-[2.25rem] font-extrabold leading-[1.05] tracking-tight text-navy md:text-[3rem]">
          Not your <span className="text-fluid italic">conventional coaching centre.</span>
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          No drilling. No cramming. No ranks for sale. We teach the formative years
          that shape how a child thinks. Small batches, real attention, and room
          to get things wrong before getting them right.
        </p>
      </div>



      <ul className="divide-y divide-border border-y border-border">
        {pairs.map((p, i) => {
          const base = i * ROW_GAP;
          return (
            <li
              key={p.old}
              className="grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-[1fr_auto_1fr] md:gap-10 md:py-8"
            >
              {/* OLD, phrase wrapped tight so scribble matches text width */}
              <div className="relative">
                <span className="relative inline-block text-2xl font-bold text-navy/45 md:text-3xl">
                  {p.old}
                  <Scribble play={inView} base={base} seed={i + 1} />
                </span>
              </div>

              {/* arrow */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                transition={{ delay: base + STRIKE_DUR * 0.6, duration: 0.4 }}
                className="hidden text-orange md:block"
                aria-hidden
              >
                <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
                  <path
                    d="M2 10 H40 M32 3 L42 10 L32 17"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </motion.div>

              {/* NEW */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: base + STRIKE_DUR * 0.8, duration: 0.5 }}
              >
                <span className="text-2xl font-extrabold text-navy md:text-3xl">{p.neu}</span>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
