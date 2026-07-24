import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pillars = [
  {
    key: "APPLICATION",
    x: 250, y: 60,
    color: "#E8721C",
    tag: "01",
    title: "Apply",
    desc: "Foundational ideas become powerful tools, students use concepts to solve real, unfamiliar problems.",
  },
  {
    key: "ASSOCIATION",
    x: 70, y: 330,
    color: "#F5B800",
    tag: "02",
    title: "Associate",
    desc: "Maths, physics and chemistry stop being islands. Concepts thread together into one coherent system.",
  },
  {
    key: "CONTINUATION",
    x: 430, y: 330,
    color: "#1B2A4A",
    tag: "03",
    title: "Continue",
    desc: "Every chapter reinforces the last. Understanding compounds, across topics, terms and years.",
  },
];

export function Triangle({ compact = false }: { compact?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-3xl">
      {/* Soft glow backdrop so it never looks "empty" */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange/15 via-gold/10 to-transparent blur-3xl" />
      </div>

      <svg viewBox="0 0 500 460" className="w-full">
        <defs>
          <linearGradient id="triLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#E8721C" />
            <stop offset="100%" stopColor="#F5B800" />
          </linearGradient>
          <linearGradient id="triFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#E8721C" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#F5B800" stopOpacity="0.04" />
          </linearGradient>
          <radialGradient id="centerFill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2A3D6B" />
            <stop offset="100%" stopColor="#1B2A4A" />
          </radialGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* dotted construction grid, gives it "designed" feel even before animation */}
        <g opacity="0.4">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="40" y1={70 + i * 50} x2="460" y2={70 + i * 50}
              stroke="#1B2A4A" strokeOpacity="0.05" strokeDasharray="2 6" />
          ))}
        </g>

        {/* always-visible faint triangle (so it's not empty if JS slow) */}
        <polygon points="250,80 90,340 410,340"
          fill="url(#triFill)" stroke="#E8721C" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="3 6" />

        {/* animated sides */}
        {[
          "M250 80 L90 340",
          "M90 340 L410 340",
          "M410 340 L250 80",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="url(#triLine)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.3, delay: 0.2 + i * 0.22, ease: "easeInOut" }}
          />
        ))}

        {/* center medallion */}
        <g>
          <circle cx="250" cy="250" r="72" fill="#1B2A4A" opacity="0.18" filter="url(#softShadow)" />
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 140 }}
          >
            <circle cx="250" cy="250" r="64" fill="url(#centerFill)" />
            <circle cx="250" cy="250" r="64" fill="none" stroke="#F5B800" strokeOpacity=".35" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="76" fill="none" stroke="#F5B800" strokeOpacity=".12" strokeWidth="1" strokeDasharray="2 4" />
            <text x="250" y="240" textAnchor="middle" fill="#F5B800" fontSize="10" fontWeight="800" letterSpacing="3">
              THE
            </text>
            <text x="250" y="258" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" letterSpacing="1">
              COGNIFY
            </text>
            <text x="250" y="274" textAnchor="middle" fill="#E8721C" fontSize="11" fontWeight="800" letterSpacing="2">
              METHOD
            </text>
          </motion.g>
        </g>

        {/* pillar nodes */}
        {pillars.map((p, i) => (
          <g key={p.key}>
            {/* always-visible static dot, visible even pre-animation */}
            <circle cx={p.x} cy={p.y} r="10" fill={p.color} opacity="0.2" />
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.9 + i * 0.18, type: "spring", stiffness: 180 }}
            >
              <circle cx={p.x} cy={p.y} r="28" fill="#fff" stroke={p.color} strokeWidth="3" />
              <circle cx={p.x} cy={p.y} r="36" fill="none" stroke={p.color} strokeOpacity=".25" />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={p.color}>
                {p.tag}
              </text>
              <text
                x={p.x}
                y={p.key === "APPLICATION" ? p.y - 44 : p.y + 60}
                textAnchor="middle"
                fontSize="14"
                fontWeight="800"
                fill="#1B2A4A"
                letterSpacing="1.5"
              >
                {p.key}
              </text>
            </motion.g>
          </g>
        ))}
      </svg>

      {!compact && (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.4 + i * 0.12 }}
              className="group relative overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-sm rounded-bl-sm border border-border bg-[var(--cream-soft)] p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: p.color }}
              />
              <div className="flex items-baseline justify-between">
                <span className="text-[0.65rem] font-extrabold tracking-[0.25em] text-muted-foreground">
                  PILLAR {p.tag}
                </span>
                <span className="text-2xl font-black" style={{ color: p.color }}>
                  {p.tag}
                </span>
              </div>
              <h4 className="mt-3 text-xl font-extrabold tracking-tight text-navy">{p.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
