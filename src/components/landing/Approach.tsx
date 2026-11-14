import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Band, Heading, Rise, hair, ink, sub, surface } from "./ui";

/* Retention: the original numbers, drawn as two lines. Rote fades, the Cognify method holds. */
const weeks = [1, 2, 3, 4, 6, 8, 12];
const rote = [95, 60, 40, 28, 18, 12, 8];
const cognify = [95, 88, 84, 82, 80, 78, 76];

const X0 = 28, X1 = 372, Y0 = 20, Y1 = 188;
const x = (w: number) => X0 + ((w - 1) / 11) * (X1 - X0);
const y = (v: number) => Y1 - (v / 100) * (Y1 - Y0);
const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(weeks[i]).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

function Line({ d, className, delay }: { d: string; className: string; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={reduce ? false : { pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

function Retention() {
  return (
    <div className={`border p-7 md:p-9 ${surface} ${hair}`}>
      <h3 className={`text-2xl font-semibold tracking-[-0.02em] md:text-3xl ${ink}`}>How much kids actually remember 3 months later.</h3>
      <p className={`mt-3 max-w-[60ch] ${sub}`}>Cramming fades fast. When you keep coming back to a topic in small doses, it sticks.</p>
      <svg viewBox="0 0 400 220" role="img" aria-label="Retention over 12 weeks: rote learning falls to 8 percent, the Cognify method holds at 76 percent" className="mt-8 h-auto w-full">
        {[0, 50, 100].map((g) => (
          <line key={g} x1={X0} x2={X1} y1={y(g)} y2={y(g)} className="stroke-zinc-200 dark:stroke-white/10" strokeWidth={1} />
        ))}
        <Line d={path(rote)} className="stroke-zinc-400" delay={0} />
        <Line d={path(cognify)} className="stroke-navy" delay={0.15} />
        <text x={X1} y={y(76) - 10} textAnchor="end" className="fill-navy text-[13px] font-semibold">76%</text>
        <text x={X1} y={y(8) - 10} textAnchor="end" className="fill-zinc-500 text-[13px] font-semibold">8%</text>
        {[1, 4, 8, 12].map((w) => (
          <text key={w} x={x(w)} y={210} textAnchor="middle" className="fill-zinc-500 text-[11px]">Week {w}</text>
        ))}
      </svg>
      <div className={`mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm ${sub}`}>
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 rounded bg-zinc-400" /> Rote learning</span>
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 rounded bg-navy" /> Cognify method</span>
      </div>
    </div>
  );
}

const ladder = [
  { c: "IX", t: "Numbers & Algebra" },
  { c: "X", t: "Trigonometry & Mensuration" },
  { c: "XI", t: "Calculus, Mechanics" },
  { c: "XII", t: "Integration, Fields, Equilibria" },
];

function Compounding() {
  return (
    <div>
      <h3 className={`text-2xl font-semibold tracking-[-0.02em] ${ink}`}>Every year builds on the last.</h3>
      <p className={`mt-3 ${sub}`}>Class 12 sits on top of Class 11, which sits on top of Class 10. Miss a step early and the whole tower gets shaky.</p>
      <ol className="mt-6 space-y-2">
        {ladder.map((l, i) => (
          <li key={l.c} style={{ marginLeft: `${i * 1.25}rem` }} className={`flex items-baseline gap-4 rounded-xl border px-4 py-3 ${hair} ${i === ladder.length - 1 ? "bg-navy text-background border-navy" : ""}`}>
            <span className="w-8 text-sm font-semibold opacity-70">{l.c}</span>
            <span className="font-medium">{l.t}</span>
          </li>
        ))}
      </ol>
      <p className={`mt-4 text-sm ${sub}`}>Boards, JEE, NEET, SAT, all built on the same base.</p>
    </div>
  );
}

function Loop() {
  const steps = ["Teach", "Check", "Adjust", "Repeat"];
  return (
    <div>
      <h3 className={`text-2xl font-semibold tracking-[-0.02em] ${ink}`}>A quick check every two classes.</h3>
      <p className={`mt-3 ${sub}`}>We don't wait for a test to find out what's wrong. Every two classes, teachers know exactly where each kid is stuck.</p>
      <ol className={`mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-lg font-semibold ${ink}`}>
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            {s}
            {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-zinc-400" />}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Approach() {
  return (
    <Band id="approach">
      <Rise>
        <Heading intro="Apply, Associate, Continue: concepts that compound across years instead of disappearing after the test.">Three pillars. One way of thinking.</Heading>
      </Rise>
      <div className="mt-14 grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <Rise>
          <Retention />
        </Rise>
        <div className="space-y-12">
          <Rise delay={0.08}>
            <Compounding />
          </Rise>
          <Rise delay={0.16}>
            <Loop />
          </Rise>
        </div>
      </div>
    </Band>
  );
}
