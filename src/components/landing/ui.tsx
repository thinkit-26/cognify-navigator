import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/* Shared pieces for the landing page.
 * Palette: one accent (brand navy) on off-white, charcoal ink, zinc greys.
 * Shape: surfaces are 24px with one tighter corner (the wireframe's notch); buttons are full pills. */

export const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export const ink = "text-zinc-950 dark:text-zinc-50";
export const sub = "text-zinc-600 dark:text-zinc-400";
export const hair = "border-zinc-200 dark:border-white/10";
export const surface = "rounded-3xl rounded-br-md";

export const buttonPrimary =
  "group inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-8 py-4 text-base font-semibold text-background transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Fade-and-rise on first scroll into view. Skipped for reduced motion. */
export function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Band({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 py-24 md:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">{children}</div>
    </section>
  );
}

export function Heading({ children, intro, className = "" }: { children: ReactNode; intro?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className={`text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl ${ink}`}>{children}</h2>
      {intro && <p className={`mt-5 max-w-[65ch] text-lg leading-relaxed ${sub}`}>{intro}</p>}
    </div>
  );
}
