import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { LogoFull } from "@/components/Logo";
import { Rocket, Star } from "@/components/Doodles";

/* Shared look for every Viva page: the site's cream canvas and dot grid, navy and orange, notched cards. */

export const vivaCard =
  "rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border border-border bg-white shadow-soft dark:bg-white/[0.04]";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange ${className}`}>
      <span className="h-px w-8 bg-orange" /> {children}
    </div>
  );
}

/** Small outlined pill for header actions (Dashboard, Sign out, ...). */
export const vivaPill =
  "rounded-full border border-navy/25 bg-white/70 px-4 py-1.5 text-sm font-bold text-navy transition hover:border-navy hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-cream";

const STEPS = ["Chapters", "Topics", "Instructions", "Viva"];

function Steps({ current }: { current: number }) {
  return (
    <ol className="hidden items-center gap-2 md:flex" aria-label="Progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={label} className="flex items-center gap-2" aria-current={now ? "step" : undefined}>
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${
                done ? "bg-orange text-white" : now ? "bg-navy text-cream" : "border-2 border-navy/20 text-navy/50"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`text-sm font-bold ${now ? "text-navy dark:text-cream" : "text-navy/50 dark:text-cream/50"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-navy/20" />}
          </li>
        );
      })}
    </ol>
  );
}

export function VivaShell({
  children,
  step,
  actions,
  wide = false,
  full = false,
  back,
}: {
  children: ReactNode;
  step?: number;
  actions?: ReactNode;
  wide?: boolean;
  full?: boolean;
  /** Where the Back pill goes. Left off on the live question page, so a test is not left by accident. */
  back?: { to: "/" | "/viva/select" | "/viva/select-topic" | "/viva/history"; label?: string };
}) {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <div className="maze-bg absolute inset-0 -z-10 opacity-50" />
      <Rocket className="pointer-events-none absolute right-[4%] top-28 -z-10 hidden h-24 w-24 opacity-40 lg:block" delay={1} />
      <Star className="pointer-events-none absolute left-[6%] top-40 -z-10 hidden h-6 w-6 opacity-60 lg:block" delay={0.4} />

      <header className="relative z-10 border-b border-border/60 bg-white/80 backdrop-blur dark:bg-[#0a1224]/80">
        <div className={`mx-auto flex items-center justify-between gap-4 px-5 py-3 md:px-8 ${full ? "max-w-none" : "max-w-6xl"}`}>
          <div className="flex shrink-0 items-center gap-4">
            <Link to="/" aria-label="Cognify home" className="flex items-center">
              <LogoFull className="h-14 w-14" />
            </Link>
            {back && (
              <Link to={back.to} className={`${vivaPill} inline-flex items-center gap-1.5`}>
                <ArrowLeft className="h-4 w-4" />
                {back.label ?? "Back"}
              </Link>
            )}
          </div>
          {step !== undefined && <Steps current={step} />}
          <div className="flex items-center gap-4 text-sm font-bold">{actions}</div>
        </div>
      </header>

      <main className={`mx-auto w-full px-5 py-10 md:px-8 md:py-14 ${full ? "max-w-none md:px-6" : wide ? "max-w-6xl" : "max-w-4xl"}`}>{children}</main>
    </div>
  );
}
