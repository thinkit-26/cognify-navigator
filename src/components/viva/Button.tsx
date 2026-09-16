"use client";

import { ComponentProps } from "react";
import { motion } from "framer-motion";

type ButtonProps = ComponentProps<typeof motion.button> & {
  variant?: "primary" | "secondary" | "outline";
};

export default function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyle = "px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-500"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className} disabled:opacity-50 disabled:pointer-events-none`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
