import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Rise, surface } from "./ui";

/* The last word: one navy block, one button. */
export function Closing() {
  return (
    <section className="px-6 pb-8 md:px-10">
      <Rise className="mx-auto max-w-7xl">
        <div className={`bg-navy px-8 py-20 text-background md:px-16 md:py-28 ${surface}`}>
          <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Start your journey. Book a free session.
          </h2>
          <p className="mt-6 max-w-[55ch] text-lg leading-relaxed opacity-80">
            A session that maps where your child is, where they need to be, and how we'll close the gap.
          </p>
          <Link
            to="/contact"
            className="group mt-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-background px-8 py-4 text-base font-semibold text-navy transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Book a free trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Rise>
    </section>
  );
}
