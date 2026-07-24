import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const nodes = [
  { label: "Curiosity", color: "#F5B800" },
  { label: "Conceptual Clarity", color: "#E8721C" },
  { label: "Academic Excellence", color: "#1B2A4A" },
];

export function AIPath() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <div ref={ref} className="relative w-full">
      <svg viewBox="0 0 800 120" className="w-full">
        <defs>
          <linearGradient id="aip" x1="0" x2="1">
            <stop offset="0%" stopColor="#F5B800" />
            <stop offset="100%" stopColor="#1B2A4A" />
          </linearGradient>
        </defs>
        <motion.path
          d="M80 60 Q 250 0 400 60 T 720 60"
          stroke="url(#aip)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        {nodes.map((n, i) => {
          const x = 80 + i * 320;
          return (
            <motion.g
              key={n.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.4, type: "spring" }}
            >
              <circle cx={x} cy="60" r="18" fill={n.color} />
              <circle cx={x} cy="60" r="28" fill="none" stroke={n.color} strokeOpacity=".3" />
              <text x={x} y="108" textAnchor="middle" fontWeight="800" fontSize="14" fill="#1B2A4A">
                {n.label}
              </text>
            </motion.g>
          );
        })}
        {/* traveling dot */}
        <motion.circle
          r="6"
          fill="#E8721C"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: [0, 1, 1, 0] } : {}}
          transition={{ duration: 2.4, delay: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
        >
          <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.5s"
            path="M80 60 Q 250 0 400 60 T 720 60" />
        </motion.circle>
      </svg>
    </div>
  );
}
