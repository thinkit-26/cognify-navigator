/* Hand-drawn line-art space doodles. Astronaut now interactive, follows mouse. */
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const stroke = "currentColor";

export function Astronaut({ className = "", delay = 0, interactive = false }: { className?: string; delay?: number; interactive?: boolean }) {
  // Mouse-tracked tilt + drift
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const rotate = useTransform(sx, [-1, 1], [-10, 10]);
  const tx = useTransform(sx, [-1, 1], [-22, 22]);
  const ty = useTransform(sy, [-1, 1], [-18, 18]);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      mx.set((e.clientX / w) * 2 - 1);
      my.set((e.clientY / h) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, mx, my]);

  if (interactive) {
    return (
      <motion.div
        className={className}
        style={{ x: tx, y: ty, rotate }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.svg
          viewBox="0 0 120 140"
          className="h-full w-full"
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
          aria-hidden
        >
          <AstronautPaths />
        </motion.svg>
      </motion.div>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 120 140"
      className={className}
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{
        y: [-4, 4, -2, 5, -4],
        x: [-3, 2, -2, 3, -3],
        rotate: [-1.5, 1.5, -0.5, 2, -1.5],
      }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      <AstronautPaths />
    </motion.svg>
  );
}


function AstronautPaths() {
  return (
    <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="40" r="22" />
      {/* visor, soft amber in light mode, vivid orange glow in dark mode */}
      <path
        d="M44 38 q16 -14 32 0 q-4 10 -16 10 q-12 0 -16 -10z"
        className="fill-[#F5B800]/30 dark:fill-[#FF7A18] dark:[fill-opacity:0.95]"
      />
      <rect x="42" y="60" width="36" height="38" rx="8" />
      <path d="M42 78 h36" />
      <circle cx="60" cy="78" r="3" />
      <path d="M42 70 l-12 8 v18 l10 4" />
      <path d="M78 70 l14 6 v18 l-10 6" />
      <path d="M50 98 l-6 28 M70 98 l6 28" />
      <path d="M44 126 l10 4 M76 126 l-10 4" />
    </g>
  );
}

export function Rocket({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 100 140" className={className}
      initial={{ y: 0, rotate: -8 }} animate={{ y: [0, -21, 0], rotate: [-10, -2, -10] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 10 q22 28 22 60 q0 18 -22 30 q-22 -12 -22 -30 q0 -32 22 -60z" />
        <circle cx="50" cy="52" r="8" fill="#E8721C" opacity=".25" />
        <path d="M28 80 l-14 18 l16 -4 z" fill="#F5B800" opacity=".3" />
        <path d="M72 80 l14 18 l-16 -4 z" fill="#F5B800" opacity=".3" />
        <path d="M44 104 q6 14 12 0" />
      </g>
    </motion.svg>
  );
}

export function Planet({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 140 100" className={className}
      initial={{ rotate: 0, y: 0 }} animate={{ rotate: [0, 8, 0], y: [-6, 6, -6] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay }} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <circle cx="70" cy="50" r="24" fill="#F5B800" fillOpacity=".25" />
        <ellipse cx="70" cy="50" rx="58" ry="14" transform="rotate(-15 70 50)" />
        <circle cx="58" cy="44" r="2" fill={stroke} />
        <circle cx="78" cy="56" r="2" fill={stroke} />
      </g>
    </motion.svg>
  );
}

export function Satellite({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 120 100" className={className}
      initial={{ y: 0 }} animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="50" y="40" width="20" height="20" />
        <rect x="20" y="42" width="26" height="16" />
        <rect x="74" y="42" width="26" height="16" />
        <path d="M20 42 l26 16 M46 42 l-26 16 M74 42 l26 16 M100 42 l-26 16" />
        <path d="M60 40 v-12" />
        <circle cx="60" cy="24" r="4" fill="#E8721C" fillOpacity=".4" />
      </g>
    </motion.svg>
  );
}

export function Comet({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 120 60" className={className}
      initial={{ x: 0, y: 0 }} animate={{ x: [-6, 6, -6], y: [-4, 4, -4] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <circle cx="96" cy="30" r="10" fill="#F5B800" fillOpacity=".35" />
        <path d="M86 30 l-70 -16 M86 36 l-66 -4 M86 24 l-60 -22" opacity=".7" />
      </g>
    </motion.svg>
  );
}

export function UFO({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 140 90" className={className}
      initial={{ y: 0, x: 0 }} animate={{ y: [-9, 9, -9], x: [-5, 5, -5] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="70" cy="48" rx="50" ry="10" fill="#E8721C" fillOpacity=".18" />
        <path d="M40 44 q30 -30 60 0" />
        <circle cx="55" cy="34" r="3" fill={stroke} />
        <circle cx="70" cy="30" r="3" fill={stroke} />
        <circle cx="85" cy="34" r="3" fill={stroke} />
        <path d="M30 58 l8 14 M50 60 l4 18 M70 62 l0 22 M90 60 l-4 18 M110 58 l-8 14" opacity=".6" />
      </g>
    </motion.svg>
  );
}

export function Star({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 60 60" className={className}
      initial={{ rotate: 0, scale: 1 }} animate={{ rotate: [0, 360], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear", delay }} aria-hidden>
      <g fill="#F5B800" fillOpacity=".55" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M30 4 L36 24 L56 30 L36 36 L30 56 L24 36 L4 30 L24 24 Z" />
      </g>
    </motion.svg>
  );
}

export function Moon({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 80 80" className={className}
      initial={{ y: 0, rotate: -10 }} animate={{ y: [-7, 7, -7], rotate: [-12, -4, -12] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay }} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <path d="M50 10 a30 30 0 1 0 20 50 a22 22 0 1 1 -20 -50z" fill="#F5B800" fillOpacity=".3" />
        <circle cx="38" cy="40" r="3" fill={stroke} fillOpacity=".6" />
        <circle cx="48" cy="56" r="2" fill={stroke} fillOpacity=".5" />
        <circle cx="30" cy="54" r="1.5" fill={stroke} fillOpacity=".5" />
      </g>
    </motion.svg>
  );
}
