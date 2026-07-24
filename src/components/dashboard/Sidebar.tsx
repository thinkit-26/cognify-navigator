import { Link, useRouterState } from "@tanstack/react-router";
import { LogoFull } from "@/components/Logo";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  id?: string;
  label: string;
  to?: string;
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
};

export function DashboardSidebar({
  items,
  onLogout,
  subtitle = "INSTITUTE",
}: {
  items: SidebarItem[];
  onLogout: () => void;
  brand?: string;
  subtitle?: string;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const renderItem = (it: SidebarItem) => {
    const Icon = it.icon;
    const active = it.active ?? (it.to ? path === it.to : false);
    const cls = `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
      active
        ? "bg-gradient-to-r from-orange/25 to-orange/5 text-orange shadow-sm ring-1 ring-orange/40 dark:from-orange/30 dark:to-orange/5 dark:text-orange-glow"
        : "text-navy/70 hover:bg-navy/5 hover:text-navy dark:text-cream/70 dark:hover:bg-white/5 dark:hover:text-cream"
    }`;
    if (it.onClick) {
      return (
        <button
          key={it.label}
          onClick={() => {
            it.onClick?.();
            setOpen(false);
          }}
          className={cls}
        >
          <Icon className="h-4 w-4" />
          {it.label}
        </button>
      );
    }
    return (
      <Link key={it.label} to={it.to ?? path} className={cls} onClick={() => setOpen(false)}>
        <Icon className="h-4 w-4" />
        {it.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-navy/10 bg-cream/95 px-4 py-3 backdrop-blur md:hidden dark:border-orange/15 dark:bg-[#0a1224]/95">
        <Link to="/" className="flex items-center">
          <LogoFull className="h-9 w-auto dark:brightness-0 dark:invert" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-orange/30 bg-orange/10 text-orange dark:border-orange/40"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className="custom-scroll sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-navy/10 bg-gradient-to-b from-white/80 via-cream-soft/80 to-cream/70 p-5 backdrop-blur-2xl md:flex
          dark:border-orange/10 dark:from-[#0d1730] dark:via-[#0a1224] dark:to-[#0a1224]"
      >
        <Link to="/" className="mb-8 flex items-center justify-center">
          <LogoFull className="h-16 w-auto dark:brightness-0 dark:invert" />
        </Link>
        <nav className="flex-1 space-y-1">{items.map(renderItem)}</nav>
        <button
          onClick={onLogout}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-navy/10 bg-cream p-5 shadow-2xl dark:border-orange/15 dark:bg-[#0a1224]">
            <div className="mb-6 flex items-center justify-between">
              <LogoFull className="h-12 w-auto dark:brightness-0 dark:invert" />
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-navy/5 text-navy dark:bg-white/10 dark:text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 text-[10px] font-extrabold tracking-[0.3em] text-orange">
              {subtitle}
            </div>
            <nav className="flex-1 space-y-1">{items.map(renderItem)}</nav>
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
