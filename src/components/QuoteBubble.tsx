import { motion } from "framer-motion";

/**
 * Quote bubble card with a chat-tail. Editorial, warm, art-directed -
 * not the standard testimonial card. Pass `tone` to alternate cream / navy
 * / orange variants down a column.
 */
export function QuoteBubble({
  quote,
  name,
  meta,
  tone = "cream",
  index = 0,
}: {
  quote: string;
  name: string;
  meta: string;
  tone?: "cream" | "navy" | "orange";
  index?: number;
}) {
  const styles = {
    cream: {
      card: "bg-[var(--cream-soft)] border-navy/85 text-navy",
      sub: "text-navy/60",
      mark: "text-orange",
      tail: "fill-[var(--cream-soft)] stroke-[#112D57]",
    },
    navy: {
      card: "bg-navy border-navy text-[var(--cream)]",
      sub: "text-[var(--cream)]/60",
      mark: "text-gold",
      tail: "fill-[#112D57] stroke-[#112D57]",
    },
    orange: {
      card: "bg-[var(--orange)] border-navy/85 text-white",
      sub: "text-white/70",
      mark: "text-white",
      tail: "fill-[#E8721C] stroke-[#112D57]",
    },
  }[tone];

  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.3, once: true }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${index % 2 === 1 ? "md:translate-y-6" : ""}`}
    >
      <div
        className={`relative rounded-[2.25rem] rounded-bl-md border-2 px-7 py-7 shadow-[4px_5px_0_rgba(15,23,42,0.85)] md:px-8 md:py-8 ${styles.card}`}
      >
        <span className={`block font-serif text-6xl leading-none ${styles.mark}`}>“</span>
        <blockquote className="mt-1 text-[1.05rem] font-medium leading-[1.55] md:text-[1.1rem]">
          {quote}
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3">
          <span
            className={`grid h-9 w-9 place-items-center rounded-full font-extrabold ${
              tone === "navy" ? "bg-gold/20 text-gold" : tone === "orange" ? "bg-white/20 text-white" : "bg-orange/15 text-orange"
            }`}
          >
            {name.charAt(0)}
          </span>
          <div>
            <div className="text-sm font-extrabold">{name}</div>
            <div className={`text-[11px] font-semibold ${styles.sub}`}>{meta}</div>
          </div>
        </figcaption>

        {/* chat-tail */}
        <svg
          viewBox="0 0 40 28"
          className={`absolute -bottom-4 left-8 h-5 w-7 ${styles.tail}`}
          strokeWidth="2"
          aria-hidden
        >
          <path d="M2,2 C12,12 22,18 36,24 C24,22 12,18 4,12 Z" />
        </svg>
      </div>
    </motion.figure>
  );
}
