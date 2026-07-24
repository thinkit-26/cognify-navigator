import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, BookOpen, Brain, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";

/**
 * THE JUMP, a creative infographic visualizing the cliff between Class X and Class XI.
 * Three layered "steps" (IX, X, XI, XII) where XI is dramatically taller.
 * Animated stats fly in. A dotted parabola arcs from X to XI showing the leap.
 */
export function TheJumpInfographic() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35, once: true });

  // staircase heights (% of plot area)
  const steps = [
    { y: "IX", h: 18, label: "Foundations", color: "bg-[#F5B800]", text: "text-[#112D57]", highlight: false },
    { y: "X",  h: 30, label: "Boards rehearsal", color: "bg-[#F39B12]", text: "text-[#112D57]", highlight: false },
    { y: "XI", h: 88, label: "The cliff", color: "bg-gradient-to-t from-[#D2580A] to-[#FF8A2A]", text: "text-white", highlight: true },
    { y: "XII", h: 92, label: "Stakes peak", color: "bg-gradient-to-t from-[#B83E04] to-[#E8721C]", text: "text-white", highlight: false },
  ];

  const stats = [
    { icon: BookOpen, big: "3.2×", small: "more chapters per subject vs. Class X" },
    { icon: Brain,    big: "5×",   small: "conceptual depth, calculus, mechanics, mole concept" },
    { icon: Clock,    big: "2×",   small: "self-study hours expected per week" },
    { icon: TrendingUp, big: "60%", small: "of XI students drop a grade band in term 1" },
  ];

  return (
    <div
      ref={ref}
      className="relative mt-16 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-md rounded-bl-md border border-orange/20 bg-gradient-to-br from-[#0F172A] via-[#0f1d3d] to-[#0F172A] p-6 text-cream shadow-glow md:p-10"
    >
      {/* grid + glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* LEFT, staircase */}
        <div>
          <div className="flex items-center gap-2 text-[0.65rem] font-extrabold tracking-[0.3em] text-gold">
            <AlertTriangle className="h-3.5 w-3.5" /> THE JUMP · CLASS X → XI
          </div>
          <h3 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
            One year. <span className="text-gradient-warm">One cliff.</span>
            <br />
            Most students fall off it.
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/80">
            Class XI isn't the next step, it's a different staircase. New abstractions,
            faster pace, exams that don't reward memory. We rebuild the climb so it's a
            ramp, not a wall.
          </p>

          {/* staircase plot */}
          <div className="relative mt-10 h-[320px] w-full">
            {/* dotted parabola from X → XI */}
            <svg
              viewBox="0 0 400 320"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <motion.path
                d="M 165 240 Q 195 40 245 60"
                fill="none"
                stroke="url(#jumpGrad)"
                strokeWidth="2.5"
                strokeDasharray="5 7"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 1.1, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="jumpGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#F5B800" />
                  <stop offset="100%" stopColor="#E8721C" />
                </linearGradient>
              </defs>
              {/* arrow head at peak */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 2.2, type: "spring", stiffness: 220 }}
                style={{ transformOrigin: "245px 60px" }}
              >
                <circle cx="245" cy="60" r="7" fill="#E8721C" />
                <circle cx="245" cy="60" r="13" fill="none" stroke="#E8721C" strokeWidth="1.5" opacity="0.4" />
              </motion.g>
            </svg>

            {/* steps, reserve label row at bottom so every bar shares one baseline */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2" style={{ height: "100%" }}>
              <div className="flex flex-1 items-end gap-3 md:gap-4">
                {steps.map((s, i) => (
                  <div key={s.y} className="relative flex h-full flex-1 items-end">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={inView ? { height: `${s.h}%`, opacity: 1 } : {}}
                      transition={{ delay: 0.2 + i * 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className={`relative flex w-full items-start justify-center overflow-hidden rounded-t-xl ${s.color} ${
                        s.highlight ? "ring-2 ring-[#FF8A2A]/70 shadow-[0_-12px_40px_-8px_rgba(255,138,42,0.6)]" : ""
                      }`}
                    >
                      <span className={`mt-3 text-xl font-black tracking-widest ${s.text}`}>
                        {s.y}
                      </span>
                      {s.highlight && (
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={inView ? { y: 0, opacity: 1 } : {}}
                          transition={{ delay: 1.4 }}
                          className="absolute right-1 top-1 rounded-md bg-white/20 px-1.5 py-0.5 text-[8px] font-extrabold tracking-widest text-white backdrop-blur"
                        >
                          ⚡ JUMP
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
              {/* fixed-height label row keeps all bars on the same baseline */}
              <div className="flex h-10 items-start gap-3 md:gap-4">
                {steps.map((s) => (
                  <div key={s.y} className="flex-1 text-center">
                    <div className="text-[9px] font-extrabold tracking-widest text-gold/60">CLASS</div>
                    <div className={`text-[10px] font-bold ${s.highlight ? "text-orange" : "text-cream/80"}`}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* baseline */}
            <div className="absolute bottom-12 left-0 right-0 h-px bg-orange/20" />
          </div>
        </div>

        {/* RIGHT, stats grid */}
        <div className="flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.big}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-orange/20 bg-orange/5 p-4 backdrop-blur-md transition hover:border-orange/40 hover:bg-orange/10"
              >
                <s.icon className="h-4 w-4 text-gold" />
                <div className="mt-2 text-3xl font-black leading-none text-cream md:text-4xl">
                  <span className="bg-gradient-to-r from-orange to-gold bg-clip-text text-transparent">
                    {s.big}
                  </span>
                </div>
                <div className="mt-2 text-[11px] leading-snug text-gold/85">{s.small}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.4 }}
            className="mt-5 flex items-center gap-3 rounded-xl border border-orange/30 bg-orange/10 p-4 text-sm"
          >
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-orange text-cream">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="text-cream/85">
              <span className="font-extrabold text-cream">Cognify's Transition Year</span> rebuilds
              the slope, slower start, deeper layering, fortnightly check-ins.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
