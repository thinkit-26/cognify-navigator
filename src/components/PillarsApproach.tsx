import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Astronaut } from "./Doodles";

/**
 * The Cognify Method, pop-art comic strip.
 * Each panel: oversized astronaut floating at its own angle, SFX
 * starbursts tucked into a corner (NEVER over the speech), and
 * speech bubbles cut into wild, hand-drawn organic curves.
 */
const panels = [
  {
    n: "I",
    word: "Apply",
    bubble:
      "Concepts aren't slides, they're tools. We use them on unfamiliar problems until intuition becomes muscle.",
    bg: "#FFD93D",
    rayBg: "#FFB800",
    sfx: "AHA!",
    sfxBg: "#FF3D7F",
    sfxText: "#FFFFFF",
    sfxCorner: "br" as const, // bottom-right (text sits top-left)
    pattern: "rays" as const,
    astroAngle: -18,
    astroScale: 1,
  },
  {
    n: "II",
    word: "Associate",
    bubble:
      "Maths, physics, chemistry, economics, they're not islands. We thread them into one story.",
    bg: "#FFFFFF",
    rayBg: "#1FA8E0",
    sfx: "CLICK!",
    sfxBg: "#1FA8E0",
    sfxText: "#FFF200",
    sfxCorner: "br" as const,
    pattern: "dots" as const,
    astroAngle: 14,
    astroScale: 1.05,
  },
  {
    n: "III",
    word: "Continue",
    bubble:
      "Every chapter reinforces the last. Understanding compounds across years, not dissolves after the test.",
    bg: "#FF6B1A",
    rayBg: "#FFB800",
    sfx: "KAPOW!",
    sfxBg: "#FFD93D",
    sfxText: "#E11D48",
    sfxCorner: "br" as const,
    pattern: "rays" as const,
    astroAngle: -28,
    astroScale: 1.1,
  },
];

function PanelBg({ pattern, rayBg }: { pattern: "rays" | "dots"; rayBg: string }) {
  if (pattern === "dots") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${rayBg} 1.6px, transparent 1.8px)`,
          backgroundSize: "10px 10px",
          opacity: 0.85,
        }}
      />
    );
  }
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: `repeating-conic-gradient(from 0deg at 50% 50%, ${rayBg} 0deg 8deg, transparent 8deg 16deg)`,
        opacity: 0.5,
        maskImage: "radial-gradient(circle at 50% 50%, #000 25%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 25%, transparent 78%)",
      }}
    />
  );
}

function Starburst({
  label,
  bg,
  color,
  rotate = -6,
  size = 96,
}: {
  label: string;
  bg: string;
  color: string;
  rotate?: number;
  size?: number;
}) {
  const points = Array.from({ length: 32 }, (_, i) => {
    const angle = (i / 32) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 50 : 32;
    const x = 50 + Math.cos(angle) * r;
    const y = 50 + Math.sin(angle) * r;
    return `${x}% ${y}%`;
  }).join(",");
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ transform: `rotate(${rotate}deg)`, width: size, height: size }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "#0F172A",
          clipPath: `polygon(${points})`,
          transform: "scale(1.1)",
        }}
      />
      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ background: bg, clipPath: `polygon(${points})` }}
      >
        <span
          className="font-serif text-base font-black italic leading-none md:text-lg"
          style={{ color, textShadow: "1.2px 1.2px 0 rgba(0,0,0,0.3)" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/** Wild, hand-drawn-feeling speech bubble (organic blob path, with tail). */
function WildBubble({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 0 | 1 | 2;
}) {
  // 3 distinct organic blobby shapes
  const clipPaths = [
    // 0, wobble bottom
    "path('M 24 4 Q 60 -2 120 6 T 280 12 Q 320 22 318 60 T 312 130 Q 300 158 240 160 T 90 165 Q 30 158 14 130 T 8 60 Q 6 16 24 4 Z')",
    // 1, leaning right
    "path('M 12 18 Q 40 0 130 4 T 290 12 Q 326 28 322 78 T 308 142 Q 280 162 210 158 T 70 162 Q 18 150 10 110 T 12 18 Z')",
    // 2, taller / dramatic
    "path('M 18 8 Q 70 -2 160 6 T 300 14 Q 326 38 320 90 T 308 152 Q 282 174 200 168 T 60 170 Q 14 160 8 118 T 18 8 Z')",
  ];
  return (
    <div className="relative" style={{ filter: "drop-shadow(3px 3px 0 #0F172A)" }}>
      {/* black outline backing */}
      <div
        className="absolute inset-0"
        style={{
          background: "#0F172A",
          clipPath: clipPaths[variant],
          transform: "scale(1.025)",
          transformOrigin: "center",
        }}
      />
      <div
        className="relative bg-white px-6 py-5"
        style={{ clipPath: clipPaths[variant], minHeight: 150 }}
      >
        {children}
      </div>
    </div>
  );
}

export function PillarsApproach() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border-[4px] border-navy bg-white p-3 md:p-4"
      style={{ borderRadius: 6 }}
    >
      <div className="grid gap-3 md:grid-cols-3 md:gap-3">
        {panels.map((p, i) => (
          <motion.article
            key={p.n}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden border-[4px] border-navy"
            style={{ background: p.bg, borderRadius: 4, minHeight: 460 }}
          >
            <PanelBg pattern={p.pattern} rayBg={p.rayBg} />

            {/* Oversized astronaut, angled, behind content but visible */}
            <div
              className="pointer-events-none absolute z-0"
              style={{
                top: "-8%",
                right: "-10%",
                width: 230,
                height: 230,
                transform: `rotate(${p.astroAngle}deg) scale(${p.astroScale})`,
                color: "#112D57",
                filter: "drop-shadow(3px 3px 0 rgba(17,45,87,0.25))",
              }}
            >
              <Astronaut className="h-full w-full" delay={i * 0.4} />
            </div>

            {/* panel number tab */}
            <div className="absolute left-0 top-0 z-30 border-b-[3px] border-r-[3px] border-navy bg-navy px-3 py-1 font-serif text-base font-black text-white">
              {p.n}
            </div>

            <div className="relative z-20 flex h-full flex-col justify-between gap-6 p-5 pt-20">
              {/* Speech bubble, wild organic shape */}
              <div className="max-w-[92%]">
                <WildBubble variant={i as 0 | 1 | 2}>
                  <p className="text-[0.86rem] font-extrabold uppercase leading-snug tracking-wide text-navy">
                    {p.bubble}
                  </p>
                </WildBubble>
              </div>

              <div className="flex items-end justify-between gap-3">
                {/* Big word caption banner */}
                <div
                  className="inline-block border-[3px] border-navy bg-white px-4 py-2"
                  style={{ borderRadius: 6, transform: "rotate(-2deg)" }}
                >
                  <h3
                    className="font-serif text-3xl font-black italic leading-none text-navy md:text-[2rem]"
                    style={{ textShadow: "2px 2px 0 #FFD93D" }}
                  >
                    {p.word}!
                  </h3>
                </div>

                {/* SFX starburst, tucked in bottom-right, away from the bubble text */}
                <div className="shrink-0">
                  <Starburst
                    label={p.sfx}
                    bg={p.sfxBg}
                    color={p.sfxText}
                    rotate={i % 2 === 0 ? 10 : -12}
                    size={92}
                  />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
