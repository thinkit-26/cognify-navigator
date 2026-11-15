"use client";

import { ComponentProps } from "react";
import { motion } from "framer-motion";

type ButtonProps = ComponentProps<typeof motion.button> & {
  variant?: "primary" | "secondary" | "outline";
};

// Same pill buttons as the rest of the site: warm orange for the main action, navy outline otherwise.
export default function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold tracking-wide transition-all duration-200";
  const variants = {
    primary: "bg-gradient-to-r from-[#E2740A] to-[#FBBF24] text-white shadow-glow hover:from-[#D26A05] hover:to-[#F5B400]",
    secondary: "bg-secondary text-navy hover:bg-secondary/70",
    outline: "border-2 border-navy/25 bg-transparent text-navy hover:border-navy hover:bg-navy/[0.04] dark:text-cream dark:border-cream/25",
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className} disabled:pointer-events-none disabled:opacity-50`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
