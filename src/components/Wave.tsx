import { motion } from "framer-motion";

type Props = { className?: string; flip?: boolean; opacity?: number };

/**
 * Hand-drawn ribbon wave, designed to be the *boundary* between sections.
 * Thick warm orange line + a thinner echo + a tiny crossover loop where the
 * two waves meet (matches the mood-board sketch). Drifts left → right
 * forever via a 3× wide tile group.
 *
 * Render this as a normal block element (not absolutely positioned) and the
 * surrounding sections will sit flush against it, no white gap, no overlay.
 */
export function Wave({ className = "", flip = false, opacity = 1 }: Props) {
  return (
    <div
      className={`pointer-events-none relative w-full overflow-hidden ${className}`}
      style={{ transform: flip ? "scaleY(-1)" : undefined, opacity }}
      aria-hidden
    >
      <motion.svg
        className="block h-full"
        style={{ width: "300%" }}
        viewBox="0 0 4320 220"
        preserveAspectRatio="none"
        initial={{ x: 0 }}
        animate={{ x: ["0%", "-33.3333%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1440, 2880].map((dx) => (
          <g key={dx} transform={`translate(${dx} 0)`}>
            {/* echo, thinner amber line that rides slightly below */}
            <path
              d="M0,140 C260,90 520,200 760,150 C1000,100 1220,200 1440,140"
              fill="none"
              stroke="#E8721C"
              strokeOpacity="0.55"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* main thick orange ribbon with a crossover loop in the middle */}
            <path
              d="
                M0,110
                C220,40 420,170 600,100
                C720,55 760,55 800,90
                C840,125 820,160 770,135
                C720,108 760,80 820,95
                C1000,140 1220,170 1440,110
              "
              fill="none"
              stroke="#E8721C"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* dot accents like the moodboard */}
            <circle cx="320" cy="60" r="5" fill="#E8721C" opacity="0.85" />
            <circle cx="1180" cy="180" r="4" fill="#E8721C" opacity="0.7" />
            <circle cx="900" cy="40" r="3" fill="#F5B800" opacity="0.7" />
          </g>
        ))}
      </motion.svg>
    </div>
  );
}
