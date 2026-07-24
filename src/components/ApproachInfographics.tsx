import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Lightbulb, Layers, Repeat, ArrowRight } from "lucide-react";

/* ---------- 1. ROTE vs COGNIFY, animated bar comparison ---------- */
function RetentionBars() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const weeks = [1, 2, 3, 4, 6, 8, 12];
  // forgetting curve vs cognify reinforced curve
  const rote = [95, 60, 40, 28, 18, 12, 8];
  const cog = [95, 88, 84, 82, 80, 78, 76];

  return (
    <div ref={ref} className="rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-sm rounded-bl-sm border border-border bg-white dark:bg-white/[0.04] dark:backdrop-blur p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-2 text-[0.65rem] font-extrabold tracking-[0.25em] text-orange">
        <Brain className="h-3.5 w-3.5" /> RETENTION
      </div>

      <h4 className="mt-2 text-xl font-extrabold text-navy md:text-2xl">
        How much kids actually remember <span className="text-gradient-warm">3 months later.</span>
      </h4>
      <p className="mt-2 text-sm text-muted-foreground">
        Cramming fades fast. When you keep coming back to a topic in small doses, it sticks.
      </p>

      <div className="mt-7 grid grid-cols-7 items-end gap-2 md:gap-3" style={{ height: 180 }}>
        {weeks.map((w, i) => (
          <div key={w} className="flex h-full flex-col items-center justify-end gap-1">
            <div className="relative flex h-full w-full items-end justify-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={inView ? { height: `${rote[i]}%` } : { height: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-1/2 rounded-t-md bg-navy/70 dark:bg-cream/50"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={inView ? { height: `${cog[i]}%` } : { height: 0 }}
                transition={{ delay: 0.05 * i + 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-1/2 rounded-t-md bg-gradient-to-t from-[#D2580A] to-[#FB8B1F]"
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">W{w}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-navy/70 dark:text-cream/80">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-navy/70 dark:bg-cream/50" /> Rote learning</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-gradient-to-t from-[#D2580A] to-[#FB8B1F]" /> Cognify method</span>
      </div>
    </div>
  );
}

/* ---------- 2. CONCEPT COMPOUNDING, animated layered stack ---------- */
function Compounding() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const layers = [
    { y: "IX", t: "Numbers & Algebra", c: "#A8460A" },
    { y: "X",  t: "Trigonometry & Mensuration", c: "#D2691E" },
    { y: "XI", t: "Calculus · Mechanics", c: "#E8721C" },
    { y: "XII", t: "Integration · Fields · Equilibria", c: "#F5B26B" },
  ];

  return (
    <div ref={ref} className="relative overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-sm rounded-bl-sm border border-border bg-navy p-6 text-white shadow-soft md:p-8">
      <div className="flex items-center gap-2 text-[0.65rem] font-extrabold tracking-[0.25em] text-gold">
        <Layers className="h-3.5 w-3.5" /> COMPOUNDING
      </div>
      <h4 className="mt-2 text-xl font-extrabold md:text-2xl">
        Every year <span className="text-gradient-warm">builds on the last.</span>
      </h4>
      <p className="mt-2 text-sm text-white/70">
        Class 12 sits on top of Class 11, which sits on top of Class 10. Miss a step early and the whole tower gets shaky.
      </p>

      <div className="mt-8 space-y-2">
        {layers.map((l, i) => (
          <motion.div
            key={l.y}
            initial={{ opacity: 0, y: 24, scaleX: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scaleX: 1 } : { opacity: 0, y: 24, scaleX: 0.9 }}
            transition={{ delay: 0.15 * (layers.length - i), duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-bold"
            style={{ background: l.c, marginLeft: `${i * 8}px`, marginRight: `${i * 8}px` }}
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white/15 text-[10px] font-black tracking-widest">
              {l.y}
            </span>
            <span className="text-white/95">{l.t}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold/90">
        <ArrowRight className="h-3.5 w-3.5" />
        Boards · JEE · NEET · SAT, all built on the same base
      </div>
    </div>
  );
}

/* ---------- 3. FEEDBACK LOOP, rotating cyclical diagram ---------- */
function FeedbackLoop() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const steps = [
    { label: "TEACH", angle: -90, icon: Lightbulb },
    { label: "CHECK", angle: 0, icon: Brain },
    { label: "ADJUST", angle: 90, icon: Repeat },
    { label: "REPEAT", angle: 180, icon: ArrowRight },
  ];
  const R = 110;

  return (
    <div ref={ref} className="rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-sm rounded-bl-sm border border-border bg-white dark:bg-white/[0.04] dark:backdrop-blur p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-2 text-[0.65rem] font-extrabold tracking-[0.25em] text-orange">
        <Repeat className="h-3.5 w-3.5" /> FEEDBACK LOOP
      </div>
      <h4 className="mt-2 text-xl font-extrabold text-navy md:text-2xl">
        A quick check every <span className="text-gradient-warm">two classes.</span>
      </h4>
      <p className="mt-2 text-sm text-muted-foreground">
        We don't wait for a test to find out what's wrong. Every two classes, teachers know exactly where each kid is stuck.
      </p>

      <div className="relative mx-auto mt-6 grid place-items-center" style={{ height: 280 }}>
        <svg viewBox="-150 -150 300 300" className="absolute inset-0 h-full w-full">
          <motion.circle
            cx="0" cy="0" r={R}
            fill="none"
            stroke="url(#loopGrad)"
            strokeWidth="2"
            strokeDasharray="4 6"
            initial={{ rotate: 0 }}
            animate={inView ? { rotate: 360 } : {}}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "0 0" }}
          />
          <defs>
            <linearGradient id="loopGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#E8721C" />
              <stop offset="100%" stopColor="#F5B800" />
            </linearGradient>
          </defs>
        </svg>

        {/* center medallion */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.4, type: "spring", stiffness: 160 }}
          className="relative z-10 grid h-28 w-28 place-items-center rounded-full bg-navy text-center text-white shadow-glow"
        >
          <div>
            <div className="text-[9px] font-extrabold tracking-[0.25em] text-gold">EVERY</div>
            <div className="text-2xl font-black leading-none">2</div>
            <div className="text-[9px] font-extrabold tracking-[0.25em] text-gold">CLASSES</div>
          </div>
        </motion.div>

        {steps.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          const x = Math.cos(rad) * R;
          const y = Math.sin(rad) * R;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 200 }}
              className="absolute flex flex-col items-center gap-1"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-orange bg-white dark:bg-[#0a1224] text-orange shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-navy">{s.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ApproachInfographics() {
  return (
    <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <RetentionBars />
      <Compounding />
      <FeedbackLoop />
    </div>
  );
}
