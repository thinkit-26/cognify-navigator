import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  title,
  subtitle,
  icon,
  accent,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative border-2 ${
        accent ? "border-orange/60" : "border-navy/15 dark:border-white/15"
      } bg-white/85 p-4 shadow-[6px_6px_0_0_rgba(17,45,87,0.08)] dark:bg-white/[0.04] dark:shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] sm:p-5 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {title && (
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-navy dark:text-cream">
                {icon}
                <span className="truncate">{title}</span>
              </div>
            )}
            {subtitle && (
              <div className="mt-0.5 text-xs font-bold text-navy/50 dark:text-cream/50">{subtitle}</div>
            )}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
