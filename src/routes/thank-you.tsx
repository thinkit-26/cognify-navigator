import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { CutLink } from "@/components/CutButton";
import { z } from "zod";

const searchSchema = z.object({
  name: z.string().optional(),
});

export const Route = createFileRoute("/thank-you")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Thank You, Cognify Institute" },
      { name: "description", content: "Your enquiry has been received. A Cognify faculty member will call you within 24 hours." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Thank You, Cognify Institute" },
      { property: "og:description", content: "Your enquiry has been received." },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { name } = useSearch({ from: "/thank-you" });
  const firstName = (name || "").split(" ")[0] || "there";
  const [redirectIn, setRedirectIn] = useState(6);

  // Fire Meta Pixel Lead event once on this dedicated URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("track", "Lead");
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setRedirectIn((n) => (n > 0 ? n - 1 : 0)), 1000);
    const go = setTimeout(() => {
      window.location.href = "/";
    }, 6000);
    return () => {
      clearInterval(tick);
      clearTimeout(go);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-28 pb-16 maze-bg">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto w-full max-w-xl rounded-[2rem] border border-border bg-white p-10 text-center shadow-soft"
      >
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-500/15 text-green-600">
          <Check className="h-10 w-10" />
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
          <span className="h-px w-8 bg-orange" /> ENQUIRY RECEIVED
        </div>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-navy md:text-5xl">
          Thank you, <span className="text-gradient-warm">{firstName}.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          We've received your enquiry. A Cognify faculty member will call you within 24 hours to confirm your free trial class.
        </p>
        <p className="mt-6 text-sm text-navy/60">
          Taking you back to the home page in {redirectIn}s…
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <CutLink to="/" variant="solid">
            Back to home <ArrowRight className="h-4 w-4" />
          </CutLink>
        </div>
      </motion.div>
    </section>
  );
}
