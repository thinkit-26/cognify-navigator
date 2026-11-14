import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Band, Heading, Rise, hair, ink, sub } from "./ui";

const quotes = [
  { name: "Kabir Singh", school: "Modern School, NYU '26", quote: "Cognify didn't just prep me for boards. They taught me how to think." },
  { name: "Aarav Mehta", school: "DPS R.K. Puram, Class XII", quote: "Mathematics finally made sense. The triangle approach is why I score what I score." },
  { name: "Ira Sharma", school: "Sanskriti School, Class XI", quote: "A short check every two classes, my teachers actually know where I'm weak. That changed everything." },
];

/* One featured quote, two quieter ones beside it. */
export function Voices() {
  const [lead, ...rest] = quotes;
  return (
    <Band>
      <Rise>
        <Heading>Real students. Real progress.</Heading>
      </Rise>
      <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-16">
        <Rise className="md:col-span-7">
          <blockquote>
            <p className={`text-balance text-3xl font-medium leading-[1.2] tracking-[-0.025em] md:text-5xl ${ink}`}>“{lead.quote}”</p>
            <footer className="mt-8">
              <div className={`text-lg font-semibold ${ink}`}>{lead.name}</div>
              <div className={sub}>{lead.school}</div>
            </footer>
          </blockquote>
        </Rise>
        <div className="md:col-span-5">
          {rest.map((q, i) => (
            <Rise key={q.name} delay={0.08 * (i + 1)} className={`border-t py-8 first:pt-0 md:first:border-t-0 ${hair}`}>
              <blockquote>
                <p className={`text-xl leading-snug ${ink}`}>“{q.quote}”</p>
                <footer className="mt-4 text-sm">
                  <span className={`font-semibold ${ink}`}>{q.name}</span>
                  <span className={`block ${sub}`}>{q.school}</span>
                </footer>
              </blockquote>
            </Rise>
          ))}
        </div>
      </div>
      <Rise className="mt-12">
        <Link to="/testimonials" className="group inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline">
          Read all stories <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Rise>
    </Band>
  );
}
