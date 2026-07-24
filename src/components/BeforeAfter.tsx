import { useRef, useState, useCallback, useEffect } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
  className?: string;
};

/**
 * Drag-the-handle before/after image comparison slider.
 * Mouse, touch, and keyboard accessible.
 */
export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  alt = "",
  className = "",
}: Props) {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => dragging.current && update(e.clientX);
    const onUp = () => (dragging.current = false);
    const onTouch = (e: TouchEvent) => dragging.current && e.touches[0] && update(e.touches[0].clientX);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, [update]);

  return (
    <div
      ref={wrapRef}
      className={`group relative select-none overflow-hidden ${className}`}
      onMouseDown={(e) => {
        dragging.current = true;
        update(e.clientX);
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        if (e.touches[0]) update(e.touches[0].clientX);
      }}
    >
      {/* AFTER (full) */}
      <img src={afterSrc} alt={alt} className="block h-full w-full object-cover" draggable={false} />

      {/* BEFORE clipped */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={beforeSrc} alt={alt} className="block h-full w-full object-cover" draggable={false} />
      </div>

      {/* labels */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-navy/85 px-3 py-1 text-[10px] font-extrabold tracking-[0.2em] text-white backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-orange/95 px-3 py-1 text-[10px] font-extrabold tracking-[0.2em] text-white backdrop-blur">
        {afterLabel}
      </span>

      {/* divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[3px] bg-white shadow-[0_0_18px_rgba(0,0,0,0.45)]"
        style={{ left: `calc(${pos}% - 1.5px)` }}
      >
        <div
          role="slider"
          aria-label="Compare images"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="pointer-events-auto absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-navy shadow-xl ring-2 ring-orange transition group-hover:scale-110"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 6 L4 12 L9 18 M15 6 L20 12 L15 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
