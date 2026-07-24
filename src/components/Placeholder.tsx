import { ImageIcon } from "lucide-react";

/**
 * Visual placeholder slot for images that haven't been provided yet.
 * Dashed brand-coloured frame so it's obvious, but still on-brand.
 */
export function Placeholder({
  label = "Image goes here",
  ratio = "16/9",
  className = "",
  tone = "light",
}: {
  label?: string;
  ratio?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`group relative flex w-full items-center justify-center overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-sm rounded-bl-sm border-2 border-dashed ${
        dark ? "border-gold/40 bg-navy/40 text-gold" : "border-orange/40 bg-orange/5 text-orange"
      } ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* hatched bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 14px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <div className={`grid h-12 w-12 place-items-center rounded-full ${dark ? "bg-gold/20" : "bg-orange/15"}`}>
          <ImageIcon className="h-5 w-5" />
        </div>
        <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.3em]">
          {label}
        </div>
        <div className={`text-[10px] font-semibold ${dark ? "text-gold/60" : "text-orange/70"}`}>
          drop a photo here
        </div>
      </div>
    </div>
  );
}
