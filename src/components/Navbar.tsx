import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogoFull } from "./Logo";
import { Menu, X, Mic2 } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

const links = [
  { to: "/", label: "Home", hash: "" },
  { to: "/", label: "Approach", hash: "approach" },
  { to: "/", label: "Programs", hash: "programs" },
  { to: "/", label: "Why Cognify", hash: "why" },
  { to: "/testimonials", label: "Testimonials", hash: "" },
  { to: "/contact", label: "Contact", hash: "" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const solid = scrolled || !isHome;

  return (
    <header
      className={`absolute inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "bg-[var(--cream)]/95 backdrop-blur border-b border-[var(--border)] dark:bg-[#0a1224]/95 dark:border-white/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Cognify">
          <LogoFull className="h-[46px] w-[46px] opacity-95 md:h-16 md:w-16 dark:brightness-0 dark:invert" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.to}
              hash={l.hash || undefined}
              className="group relative text-[0.82rem] font-semibold text-navy/75 transition hover:text-navy"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-orange transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/viva/gate"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-[0.78rem] font-bold text-white shadow-sm transition hover:bg-navy/90 dark:bg-cream dark:text-navy dark:hover:bg-cream/90"
          >
            <Mic2 className="h-3.5 w-3.5" />
            Start AI Viva
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-4 py-1.5 text-[0.78rem] font-bold text-white shadow-sm"
          >
            Login
          </Link>
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-navy/30 bg-transparent text-navy transition hover:border-navy lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-[var(--cream)]/98 px-5 py-4 lg:hidden dark:bg-[#0a1224]/98 dark:border-white/10">
          <div className="flex flex-col gap-3">
            {links.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                hash={l.hash || undefined}
                className="py-1 text-base font-semibold text-navy"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/viva/gate"
              className="inline-flex items-center gap-2 py-1 text-base font-semibold text-orange"
            >
              <Mic2 className="h-4 w-4" /> Start AI Viva
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
