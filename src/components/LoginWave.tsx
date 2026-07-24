import { motion } from "framer-motion";

/**
 * Lush dual-layer wave for the login backdrop. Soft gradient fills + a
 * crisp orange ribbon riding on top. Drifts slowly from right to left.
 */
export function LoginWave({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="block h-48 w-full md:h-64">
        <defs>
          <linearGradient id="lw-fill-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8721C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8721C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lw-fill-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5B800" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F5B800" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* back gold wash */}
        <motion.path
          fill="url(#lw-fill-2)"
          initial={{ x: 0 }}
          animate={{ x: [-40, 0, -40] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          d="M0,200 C240,120 480,260 720,200 C960,140 1200,260 1440,180 L1440,320 L0,320 Z"
        />
        {/* mid orange wash */}
        <motion.path
          fill="url(#lw-fill-1)"
          initial={{ x: 0 }}
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          d="M0,230 C200,170 460,290 720,230 C980,170 1240,290 1440,220 L1440,320 L0,320 Z"
        />
        {/* crisp ribbon line */}
        <motion.path
          fill="none"
          stroke="#E8721C"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ x: 0 }}
          animate={{ x: [0, -22, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          d="M0,210 C220,150 440,270 720,210 C1000,150 1220,270 1440,200"
        />
        {/* dotted accent ribbon */}
        <motion.path
          fill="none"
          stroke="#F5B800"
          strokeWidth="2"
          strokeDasharray="2 8"
          strokeLinecap="round"
          initial={{ x: 0 }}
          animate={{ x: [0, 24, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          d="M0,240 C220,190 440,300 720,240 C1000,190 1220,300 1440,230"
          opacity="0.7"
        />
        {/* floating dots */}
        <circle cx="280" cy="160" r="4" fill="#E8721C" opacity="0.7" />
        <circle cx="780" cy="180" r="3" fill="#F5B800" />
        <circle cx="1180" cy="150" r="5" fill="#E8721C" opacity="0.55" />
      </svg>
    </div>
  );
}
