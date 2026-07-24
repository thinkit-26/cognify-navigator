import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, GraduationCap, Users, BrainCircuit, ShieldCheck,
  Quote, Calculator, Atom, FlaskConical, AlertTriangle, Eye, MessagesSquare, Target, Sparkles,
  Menu, ChevronDown,
} from "lucide-react";

import { Wave } from "@/components/Wave";
import { Astronaut, Rocket, Planet, Satellite, UFO, Star, Moon, Comet } from "@/components/Doodles";
import { PillarsApproach } from "@/components/PillarsApproach";
import cognifyMethodDesktop from "@/assets/cognify-method-desktop.png.asset.json";
import cognifyMethodMobile from "@/assets/cognify-method-mobile.png.asset.json";
import { Section, Reveal } from "@/components/Section";
import { Counter } from "@/components/Counter";
import { CrossOff } from "@/components/CrossOff";
import { CutLink } from "@/components/CutButton";
import { Faculty } from "@/components/Faculty";
import { LogoFull, LogoMark } from "@/components/Logo";
import { WhyCognifyBento } from "@/components/WhyCognifyBento";
import { Placeholder } from "@/components/Placeholder";
import { QuoteBubble } from "@/components/QuoteBubble";
import { TheJumpInfographic } from "@/components/TheJumpInfographic";
import { ApproachInfographics } from "@/components/ApproachInfographics";


/* Rotating-word, cycles through "students", "families", "parents", "teachers" stay */
function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className={`relative inline-block align-baseline ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block text-fluid"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}


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

/* ---------------- HERO (mood-board: left headline, right doodles) ---------------- */
function HeroMoodboard() {
  return (
    <section data-hero className="relative isolate overflow-hidden bg-accent/40 pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="absolute inset-0 maze-bg opacity-50" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:px-10">
        {/* Left, copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.32em] text-navy/55"
          >
            <span className="h-px w-8 bg-orange" />
            EST. SDA MARKET · CLASSES IX–XII
          </motion.div>

          <h1 className="mt-6 text-balance font-black leading-[0.98] tracking-tight text-navy text-[14vw] sm:text-[10vw] md:text-[5.5rem] lg:text-[6.25rem]">
            <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.6 }} className="block">
              Clarity.
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.6 }} className="block">
              Confidence.
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.6 }} className="block text-fluid">
              Cognify.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-7 max-w-lg text-balance text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            A modern learning institute for <strong className="text-navy">Maths, Physics, Chemistry &amp; Economics</strong>,
            where deep conceptual understanding replaces rote memorisation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <CutLink to="/contact" variant="filled">
              Book a Free Trial Class <ArrowRight className="h-4 w-4" />
            </CutLink>
            <CutLink to="/" hash="programs" variant="filled">
              Explore Programs <ArrowRight className="h-4 w-4" />
            </CutLink>
          </motion.div>
        </div>

        {/* Right, doodle composition (sparse on mobile, full on desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[42%] md:relative md:inset-auto md:right-auto md:z-auto md:h-[680px] md:w-auto">
          <Astronaut className="absolute right-[8%] top-[34%] h-14 w-14 md:h-72 md:w-72 md:top-[10%] md:right-[4%]" />
          <Rocket className="absolute right-[60%] top-[58%] h-12 w-12 md:h-44 md:w-44 md:left-[6%] md:right-auto md:top-[40%]" delay={1} />
          <Planet className="absolute right-[20%] top-[70%] h-9 w-12 opacity-75 md:h-28 md:w-36 md:left-[34%] md:right-auto md:bottom-[6%] md:top-auto" delay={2} />
          <Star className="absolute right-[40%] top-[44%] h-4 w-4 md:h-10 md:w-10 md:top-[14%] md:right-[40%]" delay={0.2} />
          <Star className="absolute right-[72%] top-[38%] h-3 w-3 opacity-90" delay={0.5} />
          <Star className="absolute right-[14%] top-[54%] h-3 w-3 opacity-80" delay={0.8} />
          <Star className="absolute right-[48%] top-[66%] h-2.5 w-2.5 opacity-70" delay={1.1} />
          <UFO className="absolute right-[55%] top-[30%] h-8 w-10 opacity-80 md:hidden" delay={1.6} />
          {/* Extra mobile doodles to fill empty space */}
          <Satellite className="absolute right-[6%] top-[6%] h-10 w-12 opacity-80 md:hidden" delay={0.3} />
          <Moon className="absolute right-[28%] top-[14%] h-7 w-7 opacity-70 md:hidden" delay={0.9} />
          <Star className="absolute right-[18%] top-[2%] h-3 w-3 opacity-75 md:hidden" delay={1.3} />
          <Star className="absolute right-[48%] top-[10%] h-2.5 w-2.5 opacity-65 md:hidden" delay={0.6} />
          <Comet className="absolute right-[40%] top-[22%] h-5 w-16 opacity-60 md:hidden" delay={1.8} />
          <UFO className="absolute right-[10%] top-[82%] h-7 w-10 opacity-75 md:hidden" delay={2.0} />
          <Moon className="absolute right-[42%] top-[88%] h-6 w-6 opacity-65 md:hidden" delay={1.4} />
          <Star className="absolute right-[22%] top-[94%] h-3 w-3 opacity-70 md:hidden" delay={0.4} />
          <Star className="absolute right-[60%] top-[80%] h-2.5 w-2.5 opacity-60 md:hidden" delay={2.2} />
          {/* Desktop-only extras */}
          <UFO className="absolute left-[2%] top-[0%] hidden md:block md:h-28 md:w-36 opacity-90" delay={1.5} />
          <UFO className="absolute right-[6%] bottom-[18%] hidden md:block md:h-16 md:w-24 opacity-60" delay={2.4} />
          <UFO className="absolute left-[52%] top-[22%] hidden md:block md:h-12 md:w-16 opacity-50" delay={0.8} />
          <Satellite className="absolute right-[48%] top-[2%] hidden md:block md:h-14 md:w-16 opacity-80" delay={0.4} />
          <Satellite className="absolute right-[30%] bottom-[24%] hidden md:block md:h-16 md:w-20 opacity-75" delay={0.9} />
          <Planet className="absolute right-[2%] top-[2%] hidden md:block md:h-16 md:w-24 opacity-55" delay={1.2} />
          <Moon className="absolute right-[2%] bottom-[4%] hidden md:block md:h-24 md:w-24 opacity-85" delay={2.2} />
          <Moon className="absolute left-[18%] top-[28%] hidden md:block md:h-10 md:w-10 opacity-50" delay={1.7} />
          <Comet className="absolute right-[40%] top-[8%] hidden md:block md:h-12 md:w-32 opacity-70" delay={0.6} />
          <Comet className="absolute left-[34%] bottom-[34%] hidden md:block md:h-10 md:w-28 opacity-55" delay={1.8} />
          <Star className="absolute left-[42%] top-[10%] hidden md:block md:h-7 md:w-7" delay={1.1} />
          <Star className="absolute right-[14%] bottom-[2%] hidden md:block md:h-6 md:w-6" delay={0.7} />
          <Star className="absolute left-[8%] top-[34%] hidden md:block md:h-5 md:w-5 opacity-80" delay={1.4} />
          <Star className="absolute right-[6%] top-[40%] hidden md:block md:h-4 md:w-4 opacity-70" delay={2.0} />
          <Star className="absolute left-[58%] bottom-[14%] hidden md:block md:h-5 md:w-5 opacity-75" delay={0.5} />
          <Star className="absolute left-[20%] bottom-[8%] hidden md:block md:h-4 md:w-4 opacity-60" delay={2.6} />
          <Star className="absolute right-[22%] top-[4%] hidden md:block md:h-4 md:w-4 opacity-65" delay={1.9} />
          <Star className="absolute left-[62%] top-[18%] hidden md:block md:h-3 md:w-3 opacity-55" delay={2.3} />
          <Star className="absolute left-[44%] bottom-[2%] hidden md:block md:h-5 md:w-5 opacity-70" delay={0.3} />
          <Star className="absolute right-[36%] bottom-[8%] hidden md:block md:h-3 md:w-3 opacity-50" delay={1.5} />
        </div>

      </div>

    </section>
  );
}


/* legacy hero kept for reference, no longer rendered */
function HeroCentered() {
  return <HeroMoodboard />;
}

/* ---------------- HERO V2 (asymmetric editorial, refined) ---------------- */
function HeroEditorial() {
  const words = [
    { t: "Clarity.", align: "start", className: "text-navy" },
    { t: "Confidence.", align: "center", className: "text-stroke-navy" },
    { t: "Cognify.", align: "end", className: "text-gradient-warm" },
  ] as const;

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-28 md:pt-32 md:pb-36">
      <div className="absolute inset-0 maze-bg opacity-50" />
      <div data-doodles="extra" className="contents">
      <Astronaut className="absolute right-[4%] top-[12%] h-20 w-20 md:h-28 md:w-28 opacity-90" />
      <Rocket className="absolute left-[5%] bottom-[24%] h-16 w-16 md:h-24 md:w-24 opacity-80" delay={1} />
      <Planet className="absolute left-[44%] top-[8%] hidden h-16 w-24 opacity-40 md:block" delay={2} />
      <Satellite className="absolute right-[20%] bottom-[20%] hidden h-12 w-14 opacity-50 md:block" delay={0.5} />
      <UFO className="absolute right-[38%] top-[6%] hidden h-14 w-20 opacity-60 md:block" delay={1.4} />
      <Star className="absolute left-[24%] top-[16%] h-7 w-7 opacity-80" delay={0.3} />
      <Moon className="absolute right-[8%] bottom-[12%] hidden h-14 w-14 opacity-60 md:block" delay={2.2} />
      <Comet className="absolute left-[60%] bottom-[28%] hidden h-8 w-20 opacity-50 md:block" delay={0.9} />
      </div>


      <div className="relative mx-auto max-w-7xl px-8 md:px-14 lg:px-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-navy/60"
          >
            <span className="h-px w-10 bg-orange" />
            EST. SDA MARKET · SOUTH DELHI
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-navy/60"
          >
            <span>Classes IX – XII</span>
            <span className="font-mono text-navy/40">N° 01 / 26</span>
          </motion.div>
        </div>

        <div className="relative">
          <h1 className="space-y-1 overflow-visible pb-3 font-black leading-[0.95] tracking-[-0.02em] md:space-y-1.5 text-[11vw] md:text-[6vw] lg:text-[5.25rem] xl:text-[5.75rem]">
            {words.map((w, i) => (
              <div key={w.t} className={`flex ${w.align === "center" ? "justify-center" : w.align === "end" ? "justify-end" : "justify-start"}`}>
                <motion.span
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative inline-block pr-[0.08em] ${w.className}`}
                >
                  {w.t}
                  {i === 0 && (
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="absolute -bottom-1 left-1 right-3 h-[6px] origin-left rounded-full bg-orange/70 md:h-[10px]"
                    />
                  )}
                </motion.span>
              </div>
            ))}
          </h1>

          <div className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-[1fr_auto]">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              A modern learning institute for <strong className="text-navy">Mathematics, Science &amp; PCM</strong>,
              where deep conceptual understanding replaces rote memorisation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center gap-3 md:justify-end"
            >
              <CutLink to="/contact" variant="solid">
                Book a Free Trial <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </CutLink>
              <Link
                to="/"
                hash="programs"
                className="group inline-flex items-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-2 border-navy/15 bg-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-navy transition hover:-translate-y-0.5 hover:border-navy"
              >
                Explore Programs
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <Wave className="absolute bottom-0 left-0 h-40 w-full md:h-56" />
    </section>
  );
}

/* ---------------- HERO V3 (Spark-inspired: announcement bar + centered logo) ---------------- */
/* V3 internal header, left-side dropdown nav, centered logo + name */
function V3Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const links = [
    { label: "Home", to: "/", hash: "" },
    { label: "Approach", to: "/", hash: "approach" },
    { label: "Programs", to: "/", hash: "programs" },
    { label: "Why Cognify", to: "/", hash: "why" },
    { label: "Testimonials", to: "/testimonials", hash: "" },
    { label: "Contact", to: "/contact", hash: "" },
  ];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative z-20 border-b border-border/60 bg-white/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-5 md:px-10 md:py-6">
        {/* LEFT, dropdown trigger */}
        <div className="relative justify-self-start" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="group inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border-2 border-navy/15 bg-white px-4 py-2.5 text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-navy transition hover:border-navy"
            aria-expanded={open}
          >
            <Menu className="h-4 w-4" />
            Menu
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border border-border bg-white shadow-soft"
              >
                {links.map((l, i) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    hash={l.hash || undefined}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-border/60 px-4 py-3 text-sm font-bold text-navy transition last:border-b-0 hover:bg-orange/5 hover:text-orange"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-navy/40">0{i + 1}</span>
                      {l.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER, logo + institute wordmark */}
        <Link to="/" className="flex flex-col items-center gap-2 justify-self-center">
          <LogoMark size={56} />
          <div className="flex flex-col items-center leading-none">
            <span className="text-lg font-black tracking-[0.18em] text-navy md:text-xl">
              COGNIFY
            </span>
            <span className="mt-1.5 flex items-center gap-1.5 text-[0.55rem] font-bold tracking-[0.32em] text-orange md:text-[0.62rem]">
              <span className="h-px w-4 bg-orange" />
              INSTITUTE
              <span className="h-px w-4 bg-orange" />
            </span>
          </div>
        </Link>

        {/* RIGHT, CTA */}
        <div className="justify-self-end">
          <CutLink to="/contact" variant="solid" className="hidden md:inline-flex">
            Enquire
          </CutLink>
        </div>
      </div>
    </div>
  );
}

function HeroSparkV3() {
  const words = [
    { t: "Clarity.", align: "start", className: "text-navy" },
    { t: "Confidence.", align: "center", className: "text-stroke-navy" },
    { t: "Cognify.", align: "end", className: "text-gradient-warm" },
  ] as const;

  return (
    <section className="relative isolate overflow-hidden bg-white pt-20">
      <V3Header />

      {/* Hero body, editorial type, on a soft navy gradient panel */}
      <div className="relative">
        <div className="absolute inset-0 maze-bg opacity-40" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[120%] bg-gradient-to-b from-secondary via-white to-white" />

        <div data-doodles="extra" className="contents">
        <Astronaut className="absolute right-[4%] top-[10%] h-20 w-20 md:h-28 md:w-28 opacity-90" />
        <Rocket className="absolute left-[5%] bottom-[28%] h-16 w-16 md:h-24 md:w-24 opacity-80" delay={1} />
        <Planet className="absolute left-[46%] top-[6%] hidden h-16 w-24 opacity-40 md:block" delay={2} />
        <Satellite className="absolute right-[22%] bottom-[22%] hidden h-12 w-14 opacity-50 md:block" delay={0.5} />
        <UFO className="absolute right-[36%] top-[4%] hidden h-14 w-20 opacity-60 md:block" delay={1.4} />
        <Star className="absolute left-[28%] top-[14%] h-7 w-7 opacity-80" delay={0.3} />
        <Moon className="absolute right-[10%] bottom-[14%] hidden h-14 w-14 opacity-60 md:block" delay={2.2} />
        <Comet className="absolute left-[58%] bottom-[30%] hidden h-8 w-20 opacity-50 md:block" delay={0.9} />
        </div>

        <div className="relative mx-auto max-w-7xl px-8 pb-28 pt-16 md:px-14 md:pb-36 md:pt-20 lg:px-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
            <div className="flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-navy/60">
              <span className="h-px w-10 bg-orange" />
              EST. SDA MARKET · SOUTH DELHI
            </div>
            <div className="flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-navy/60">
              <span>Classes IX – XII</span>
              <span className="font-mono text-navy/40">N° 01 / 26</span>
            </div>
          </div>

          <h1 className="space-y-1 overflow-visible pb-3 font-black leading-[0.95] tracking-[-0.02em] md:space-y-1.5 text-[11vw] md:text-[6vw] lg:text-[5.25rem] xl:text-[5.75rem]">
            {words.map((w, i) => (
              <div key={w.t} className={`flex ${w.align === "center" ? "justify-center" : w.align === "end" ? "justify-end" : "justify-start"}`}>
                <motion.span
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative inline-block pr-[0.08em] ${w.className}`}
                >
                  {w.t}
                  {i === 0 && (
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="absolute -bottom-1 left-1 right-3 h-[6px] origin-left rounded-full bg-orange/70 md:h-[10px]"
                    />
                  )}
                </motion.span>
              </div>
            ))}
          </h1>

          <div className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-[1fr_auto]">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              A modern learning institute for <strong className="text-navy">Mathematics, Science &amp; PCM</strong>,
              where deep conceptual understanding replaces rote memorisation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center gap-3 md:justify-end"
            >
              <CutLink to="/contact" variant="solid">
                Book a Free Trial <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </CutLink>
              <Link
                to="/"
                hash="programs"
                className="group inline-flex items-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-2 border-navy/15 bg-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-navy transition hover:-translate-y-0.5 hover:border-navy"
              >
                Explore Programs
              </Link>
            </motion.div>
          </div>
        </div>

        <Wave className="absolute bottom-0 left-0 h-40 w-full md:h-56" />
      </div>
    </section>
  );
}


/* Hero, single mood-board version, no toggle */
function Hero() {
  return <HeroMoodboard />;
}




/* ---------------- WHAT WE'RE NOT (scroll cross-off) ---------------- */
function NotATuitionCentre() {
  return (
    <section className="relative bg-[var(--cream-soft)] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <CrossOff />
        <ApproachInfographics />
      </div>
    </section>
  );
}


/* ---------------- STATS BAR (redesigned, uneven cards, vibrant accents) ---------------- */
function StatsBar() {
  const stats = [
    { n: 500, s: "+", l: "Students Taught", tone: "navy" },
    { n: 12, s: "+", l: "Years Running", tone: "cream" },
    { n: 100, s: "%", l: "Board Pass Rate", tone: "orange" },
    { n: 40, s: "+", l: "Top University Admits", tone: "cream" },
  ];
  const toneCls = (t: string) =>
    t === "navy"
      ? "bg-navy text-[var(--cream)] border-navy"
      : t === "orange"
      ? "bg-[var(--orange)] text-white border-[var(--orange)]"
      : "bg-[var(--cream-soft)] text-navy border-navy";
  return (
    <div className="relative px-6 py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4, once: true }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`group border-2 px-5 py-8 text-center shadow-[4px_5px_0_rgba(17,45,87,0.95)] transition hover:-translate-y-1 ${toneCls(s.tone)}`}
          >
            <div className="text-4xl font-black md:text-5xl">
              <Counter to={s.n} suffix={s.s} />
            </div>
            <div className={`mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] ${s.tone === "cream" ? "text-navy/70" : "opacity-90"}`}>
              {s.l}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- APPROACH (single, tight) ---------------- */
function Approach() {
  return (
    <Section
      id="approach"
      className="bg-[#FEFEFE]"
      eyebrow="THE COGNIFY APPROACH"
      title={<>Three pillars. <span className="text-fluid">One way of thinking.</span></>}
      subtitle="Apply, Associate, Continue, concepts that compound across years instead of disappearing after the test."
      center
    >
      <img
        src={cognifyMethodMobile.url}
        alt="The Cognify Method, Apply, Associate, Continue"
        className="mx-auto w-full max-w-md md:hidden"
      />
      <img
        src={cognifyMethodDesktop.url}
        alt="The Cognify Method, Apply, Associate, Continue"
        className="mx-auto hidden w-full max-w-5xl md:block"
      />
    </Section>
  );
}

/* ---------------- PROGRAMS (merged from /programs) ---------------- */
function Programs() {
  const tracks = [
    {
      icon: Calculator, cls: "IX – X",
      title: "Foundation",
      body: "Build the structural understanding that turns Class XI into a forward step, not a cliff.",
      tags: ["Maths", "Physics", "Chemistry", "Economics"],
    },
    {
      icon: Atom, cls: "XI",
      title: "The Transition Year",
      body: "Class XI is the single largest jump in school. We slow it down, layer it, and rebuild fluency.",
      tags: ["Maths", "Physics", "Chemistry", "Economics"],
      warn: true,
    },
    {
      icon: FlaskConical, cls: "XII",
      title: "Boards & Beyond",
      body: "Board mastery plus the conceptual depth that holds up in JEE, NEET, SAT and undergrad abroad.",
      tags: ["Maths", "Physics", "Chemistry", "Economics"],
    },
  ];
  return (
    <Section
      id="programs"
      className="bg-secondary"
      eyebrow="PROGRAMS"
      title={<>Built for the <span className="text-gradient-warm">formative years that matter most.</span></>}
      subtitle="Small batches. In sync with school. Faculty who know each student by name."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {tracks.map((t, i) => (
          <Reveal key={t.cls} delay={i * 0.08}>
            <div className={`group relative h-full overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border bg-[var(--cream-soft)] p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow ${t.warn ? "border-orange/40" : "border-border"}`}>
              {t.warn && (
                <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl bg-orange px-3 py-1 text-[10px] font-extrabold tracking-widest text-white">
                  <AlertTriangle className="h-3 w-3" /> THE JUMP
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-tl-xl rounded-br-xl bg-orange/10 text-orange">
                  <t.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-extrabold tracking-widest text-navy/60">CLASS {t.cls}</div>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold text-navy">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-navy/70">{tag}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <TheJumpInfographic />
    </Section>
  );
}

/* ---------------- WHY COGNIFY (bento) ---------------- */
function WhyCognify() {
  return (
    <Section
      id="why"
      eyebrow="WHY COGNIFY"
      title={<>Eight reasons <RotatingWord words={["students", "families", "parents", "teachers"]} /> <span className="text-navy">stay.</span></>}
      subtitle="A thinking institute, built for students who want to understand, not just survive, their syllabus."
    >
      <WhyCognifyBento />
    </Section>
  );
}

/* ---------------- TESTIMONIALS PREVIEW ---------------- */
function Testimonials() {
  const t = [
    { name: "Aarav Mehta", school: "DPS R.K. Puram · XII", quote: "Mathematics finally made sense. The triangle approach is why I score what I score." },
    { name: "Ira Sharma", school: "Sanskriti School · XI", quote: "A short check every two classes, my teachers actually know where I'm weak. That changed everything." },
    { name: "Kabir Singh", school: "Modern School · NYU '26", quote: "Cognify didn't just prep me for boards. They taught me how to think." },
  ];
  return (
    <Section eyebrow="WHAT STUDENTS SAY" title="Real students. Real progress." center>
      <div className="grid gap-6 md:grid-cols-3">
        {t.map((q, i) => (
          <Reveal key={q.name} delay={i * 0.08}>
            <div className="group relative h-full overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border border-border bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-orange/10 transition group-hover:scale-150" />
              <Quote className="relative h-8 w-8 text-orange" />
              <p className="relative mt-3 text-base leading-relaxed text-navy">"{q.quote}"</p>
              <div className="relative mt-6 border-t border-border pt-4">
                <div className="text-sm font-extrabold text-navy">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.school}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link to="/testimonials" className="inline-flex items-center gap-2 text-sm font-bold text-orange hover:underline">
          Read all stories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

/* ---------------- FIND US (map) ---------------- */
function FindUs() {
  return (
    <Section eyebrow="FIND US HERE" title={<>SDA Market, <span className="text-gradient-warm">South Delhi.</span></>} subtitle="Tucked into the corner where serious learning happens. Walk in, or book a free 45-minute trial class.">
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="h-full rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md bg-navy p-8 text-white shadow-soft">
            <h4 className="text-xs font-extrabold tracking-widest text-gold">VISIT</h4>
            <p className="mt-4 text-xl font-bold leading-snug">C9, First Floor<br />SDA Market<br />New Delhi 110016</p>
            <div className="mt-8 space-y-2 text-sm text-white/80">
              <div>Mon – Sat · 10:00 – 19:00</div>
              <div>+91 99710 77388 · +91 99580 46154</div>
              <div>thecognifyinstitute@gmail.com</div>
            </div>
            <CutLink to="/contact" variant="solid" className="mt-8">
              Book a Visit <ArrowRight className="h-4 w-4" />
            </CutLink>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border border-border shadow-soft">
            <iframe
              title="Cognify Institute, SDA Market"
              src="https://www.google.com/maps?q=SDA+Market+New+Delhi&output=embed"
              className="block h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  return (
    <section className="relative isolate mt-12 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-lg rounded-bl-lg bg-navy px-8 py-20 text-center md:px-16">
          <Rocket className="absolute -right-6 top-10 h-32 w-32 opacity-30" />
          <Astronaut className="absolute -left-6 bottom-4 h-32 w-32 opacity-25" />
          <Reveal>
            <LogoFull className="mx-auto h-32 w-auto md:h-40" />
            <h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold text-white md:text-5xl">
              Start your journey. <span className="text-gradient-warm">Book a free session.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              A session that maps where your child is, where they need to be, and how we'll close the gap.
            </p>
            <div className="mt-8 flex justify-center">
              <CutLink to="/contact" variant="solid">
                Book Your Free Trial Class <ArrowRight className="h-4 w-4" />
              </CutLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <Testimonials />
      <NotATuitionCentre />
      <StatsBar />
      <Approach />
      <Programs />
      <WhyCognify />
      <Faculty />
      <FindUs />
      <FinalCTA />
    </>
  );
}
