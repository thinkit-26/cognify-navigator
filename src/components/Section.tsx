import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  children?: ReactNode;
  className?: string;
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {(eyebrow || title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className={`mb-12 max-w-3xl ${center ? "mx-auto text-center" : ""}`}
          >
            {eyebrow && (
              <div className={`mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange ${center ? "justify-center" : ""}`}>
                <span className="h-px w-8 bg-orange" /> {eyebrow}
              </div>
            )}
            {title && <h2 className="text-balance text-4xl font-extrabold leading-[1.05] text-navy md:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
