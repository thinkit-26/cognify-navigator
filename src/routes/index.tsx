import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import teacher from "@/assets/hero-float-teacher.jpg";
import classroom from "@/assets/hero-float-class.jpg";
import alumni from "@/assets/hero-float-alumni.jpg";
import aseem from "@/assets/hero-float-aseem.jpg";
import shesh from "@/assets/hero-float-shesh.jpg";

/* Photos drifting behind the hero. Desktop only; positions are where they peek out around the panel and pills. */
const FLOATERS = [
  { src: teacher, pos: "left-[3%] top-[10%] w-32", rot: -6, dur: 7 },
  { src: classroom, pos: "left-[34%] bottom-[5%] w-36", rot: 5, dur: 8 },
  { src: alumni, pos: "right-[4%] top-[9%] w-52", rot: 4, dur: 9 },
  { src: aseem, pos: "right-[30%] bottom-[5%] w-24", rot: -4, dur: 6.5 },
  { src: shesh, pos: "right-[6%] bottom-[7%] w-28", rot: -5, dur: 7.5 },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cognify Institute, A Thinking Institute for Classes 9–12" },
      { name: "description", content: "Maths, Physics, Chemistry & Economics for Classes 9–12 in South Delhi. Conceptual clarity over rote learning." },
      { property: "og:title", content: "Cognify Institute, Clarity. Confidence. Cognify." },
      { property: "og:description", content: "A thinking institute for Classes 9–12. Maths, Physics, Chemistry & Economics." },
    ],
  }),
  component: Home,
});

/* ---------------- HERO (from the sketch): main panel left, four text-only bars right ---------------- */
const HERO_BARS = [
  { to: "/noah", label: "NOAH", note: "Our learning platform" },
  { to: "/viva/gate", label: "VIVA BOT", note: "Practise your oral viva with AI" },
  { to: "/pyqs", label: "PYQ's", note: "Previous year papers, Classes 9–12" },
  { to: "/contact", label: "BOOK A FREE TRIAL", note: "Come and sit in a class" },
] as const;

function HeroMoodboard() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRefs = [useRef<HTMLLIElement>(null), useRef<HTMLLIElement>(null), useRef<HTMLLIElement>(null), useRef<HTMLLIElement>(null)];
  // Beams measure the bars, so mount them once the slide-in has settled.
  const [beamsReady, setBeamsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBeamsReady(true), reduce ? 0 : 1600);
    return () => clearTimeout(t);
  }, [reduce]);
  const curvature = [-30, 0, 0, 30];
  return (
    <section data-hero className="relative isolate flex min-h-screen items-center overflow-hidden bg-burgundy-paper pt-28 pb-20 md:pt-32 md:pb-24">
      {/* Starts below the 112px navbar, so no photo can touch it. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-28 hidden md:block">
        {FLOATERS.map((f, i) => (
          <motion.img
            key={i}
            src={f.src}
            alt=""
            className={`absolute h-auto rounded-2xl opacity-80 ${f.pos}`}
            style={{ rotate: f.rot }}
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={{ duration: f.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      <div ref={containerRef} className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-stretch gap-12 px-6 md:grid-cols-[1.15fr_1fr] md:gap-16 md:px-10">
        {/* Main area: one thin outline, nothing else */}
        <div ref={panelRef} className="relative z-10 flex items-center rounded-3xl border border-burgundy-ink/25 bg-white p-8 md:p-14">
          <h1 className="text-balance font-semibold leading-[1.02] tracking-[-0.02em] text-burgundy-ink text-[13vw] sm:text-[9vw] md:text-[4.25rem] lg:text-[5.5rem]">
            {["Clarity.", "Confidence.", "Cognify."].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.13, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Four text-only pill buttons, staggered left and right. Each slides in from the left edge. */}
        <ul className="space-y-4 self-center">
          {HERO_BARS.map(({ to, label, note }, i) => {
            const primary = i === HERO_BARS.length - 1;
            return (
              <motion.li
                key={to}
                ref={barRefs[i]}
                initial={reduce ? false : { opacity: 0, x: -56 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 + i * 0.14 }}
                className={`relative z-10 md:w-[17rem] ${i % 2 ? "md:ml-20" : ""}`}
              >
                <Link
                  to={to}
                  className={`block min-h-11 cursor-pointer rounded-full border px-5 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy-paper ${
                    primary
                      ? "border-burgundy bg-burgundy text-white hover:bg-burgundy/90"
                      : "border-burgundy-ink/30 bg-burgundy-paper text-burgundy-ink hover:border-burgundy hover:bg-burgundy hover:text-white"
                  }`}
                >
                  <span className="block text-[13px] font-bold tracking-[0.08em]">{label}</span>
                  <span className="block text-xs leading-snug">{note}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* One beam from the main panel to each button, behind them. Desktop only: stacked on phones the gaps are too short to read. */}
        {beamsReady &&
          barRefs.map((barRef, i) => (
            <AnimatedBeam
              key={i}
              className="hidden md:block"
              containerRef={containerRef}
              fromRef={panelRef}
              toRef={barRef}
              curvature={curvature[i]}
              duration={5 + i * 0.6}
              delay={i * 0.4}
              pathColor="#2A0E18"
              pathOpacity={0.15}
              gradientStartColor="#F0D9DF"
              gradientStopColor="#7A1230"
            />
          ))}
      </div>
    </section>
  );
}

function Home() {
  return <HeroMoodboard />;
}
