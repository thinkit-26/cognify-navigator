import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileText, Mic2 } from "lucide-react";
import heroWall from "@/assets/hero-wall.jpg";
import { buttonPrimary, ink, spring } from "./ui";

/* Hero from the wireframe: a staggered mosaic of tiles on the left, heading and one CTA on the right.
 * Three tiles are the product links. Phones: heading first, tiles below in a two-column grid. */

const enter = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, delay: 0.1 + i * 0.08 },
});

function LinkTile({ to, label, note, Icon, i, className }: { to: string; label: string; note: string; Icon: typeof BrainCircuit; i: number; className: string }) {
  return (
    <motion.div {...enter(i)} className={className}>
      <Link
        to={to}
        className="group flex h-full w-full flex-col justify-between rounded-[inherit] bg-navy p-5 text-background transition duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex items-start justify-between">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
        <span>
          <span className="block text-lg font-semibold tracking-[0.04em]">{label}</span>
          <span className="mt-1 block text-sm leading-snug text-background/80">{note}</span>
        </span>
      </Link>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section data-hero className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-24 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-10">
        <div className="order-2 grid grid-cols-2 gap-3 md:order-1 md:flex md:items-start">
          <div className="contents md:flex md:flex-1 md:flex-col md:gap-3">
            <LinkTile i={0} to="/noah" label="NOAH" note="Our learning platform" Icon={BrainCircuit} className="aspect-[4/5] rounded-3xl rounded-bl-md md:aspect-[3/4]" />
          </div>
          <div className="contents md:mt-20 md:flex md:flex-1 md:flex-col md:gap-3">
            <motion.div {...enter(1)} className="aspect-[4/5] overflow-hidden rounded-3xl rounded-tr-md bg-zinc-100 dark:bg-white/5 md:aspect-square">
              <img src={heroWall} alt="Line drawing of a physics teacher on the classroom wall" decoding="async" className="h-full w-full object-cover" />
            </motion.div>
            <LinkTile i={2} to="/viva/gate" label="VIVA BOT" note="Practise your oral viva with AI" Icon={Mic2} className="aspect-square rounded-3xl rounded-br-md md:aspect-[5/4]" />
          </div>
          <div className="contents md:mt-8 md:flex md:flex-1 md:flex-col md:gap-3">
            <LinkTile i={3} to="/pyqs" label="PYQ's" note="Previous year papers, Classes 9-12" Icon={FileText} className="aspect-square rounded-3xl rounded-tl-md md:aspect-[3/4]" />
          </div>
        </div>

        <div className="order-1 flex flex-col items-center text-center md:order-2">
          <h1 className={`text-balance text-[15vw] font-semibold leading-[1] tracking-[-0.035em] sm:text-[11vw] md:text-[4.25rem] lg:text-[5.5rem] ${ink}`}>
            {["Clarity.", "Confidence.", "Cognify."].map((word, i) => (
              <motion.span key={word} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.05 + i * 0.12 }} className="block">
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.5 }} className="mt-10">
            <Link to="/contact" className={buttonPrimary}>
              Book a free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
