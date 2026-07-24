import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

/**
 * Mood-board buttons. The default "solid" CTA is a warm cream pill with
 * navy label and an amber arrow + animated underline (matches the
 * Cognify mood-board mockup). Variants:
 *   - solid: cream pill, navy text, amber arrow
 *   - filled: solid amber → CTA emphasis (rare, used for hero "Book a Trial")
 *   - ghost:  transparent pill, navy text
 *   - dark:   navy pill, cream text
 */

const base =
  "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.8rem] font-bold tracking-wide transition-colors duration-200";

type Variant = "solid" | "filled" | "ghost" | "dark";

const variants: Record<Variant, string> = {
  solid:
    "bg-gradient-to-r from-[#E2740A] to-[#FBBF24] text-white hover:from-[#D26A05] hover:to-[#F5B400]",
  filled:
    "bg-gradient-to-r from-[#E2740A] to-[#FBBF24] text-white hover:from-[#D26A05] hover:to-[#F5B400]",
  ghost:
    "border border-navy/25 bg-transparent text-navy hover:bg-navy/[0.04] dark:text-cream dark:border-cream/25 dark:hover:bg-cream/[0.06]",
  dark:
    "bg-navy text-[var(--cream)] hover:bg-navy/90",
};

function Inner({ variant, children }: { variant: Variant; children: ReactNode }) {
  // Filled/solid orange CTAs get a subtle arrow nudge on hover, white arrow.
  if (variant === "solid" || variant === "filled") {
    const arr = Array.isArray(children) ? children : [children];
    const label = arr.find((c) => typeof c === "string");
    const rest = arr.filter((c) => typeof c !== "string");
    return (
      <>
        <span>{label ?? children}</span>
        <span className="text-white/90 transition-transform duration-200 group-hover:translate-x-0.5">
          {rest}
        </span>
      </>
    );
  }
  return <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;
}

type LinkProps = { to: string } & Omit<ComponentProps<typeof Link>, "to" | "className"> & {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export function CutLink({ variant = "solid", className = "", children, ...rest }: LinkProps) {
  return (
    <Link {...rest} className={`${base} ${variants[variant]} ${className}`}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; children: ReactNode };

export function CutButton({ variant = "solid", className = "", children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      <Inner variant={variant}>{children}</Inner>
    </button>
  );
}
