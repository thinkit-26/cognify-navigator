import { createFileRoute } from "@tanstack/react-router";
import { Section, Reveal } from "@/components/Section";
import { Quote, Star } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Results & Testimonials, Cognify Institute" },
      { name: "description", content: "Student journeys, board results and admissions to top universities, including abroad." },
      { property: "og:title", content: "Testimonials, Cognify" },
      { property: "og:description", content: "Student journeys and admissions to top universities." },
    ],
  }),
  component: Results,
});

const students = [
  { name: "Aarav Mehta", school: "DPS R.K. Puram · XII", into: "IIT Delhi · CSE",
    story: "Mathematics finally made sense. The triangle approach is why I score what I score." },
  { name: "Kabir Singh", school: "Modern School · Alum", into: "NYU · '26",
    story: "Cognify didn't just prep me for boards. They taught me how to think, that's what got me into NYU." },
  { name: "Ira Sharma", school: "Sanskriti School · XI", into: "Top 1% in school",
    story: "The trial class after every two classes is a game-changer. My teachers actually know where I'm weak." },
  { name: "Vihaan Kapoor", school: "Vasant Valley · XII", into: "University of Toronto",
    story: "I never thought I'd study Physics abroad. Cognify made it feel possible, and then made it real." },
  { name: "Anya Bhatia", school: "Shri Ram · X", into: "98.4% Boards",
    story: "The clarity I built in Class 9 carried me right through boards. Nothing felt surprising." },
  { name: "Rehaan Khan", school: "Bluebells · XII", into: "Imperial College London",
    story: "PCM felt huge. Then it didn't. The teachers here see the whole map, not just one chapter." },
];

const parents = [
  { name: "Mrs. Mehta", role: "Parent · Class XII", q: "What I love most: they tell me the truth. Every two weeks, a trial class. No surprises in March." },
  { name: "Mr. Sharma", role: "Parent · Class XI", q: "We tried larger institutes first. The difference here is that someone actually knows my daughter." },
];

function Results() {
  return (
    <>
      <section className="relative pt-36 pb-12 maze-bg">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> RESULTS & STORIES
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            Numbers matter. <span className="text-gradient-warm">Journeys matter more.</span>
          </h1>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-orange/10 transition group-hover:scale-150" />
                <Quote className="relative h-8 w-8 text-orange" />
                <p className="relative mt-3 text-base leading-relaxed text-navy">"{s.story}"</p>
                <div className="relative mt-6 border-t border-border pt-4">
                  <div className="text-sm font-extrabold text-navy">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.school}</div>
                  <div className="mt-2 inline-flex rounded-full bg-navy px-3 py-1 text-[10px] font-extrabold tracking-widest text-gold">
                    → {s.into.toUpperCase()}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        className="bg-secondary"
        eyebrow="ABROAD ADMISSIONS"
        title={<>Cognify alumni at <span className="text-gradient-warm">top universities worldwide.</span></>}
        center
      >
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xl font-extrabold tracking-wide text-navy/60 md:text-2xl">
          {["Duke", "NYU", "Imperial College", "U of Toronto", "UCL", "Edinburgh", "Purdue", "NTU Singapore"].map((u) => (
            <Reveal key={u}>
              <span className="transition hover:text-navy">{u}</span>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="WHAT PARENTS SAY" title="Real conversations. Real trust.">
        <div className="grid gap-6 md:grid-cols-2">
          {parents.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div className="relative rounded-3xl bg-navy p-8 text-white shadow-soft">
                <div className="absolute -top-3 left-8 rounded-full bg-orange px-3 py-1 text-[10px] font-extrabold tracking-widest text-white">
                  PARENT VOICE
                </div>
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-lg leading-relaxed text-white/90">"{p.q}"</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="text-sm font-extrabold text-gold">{p.name}</div>
                  <div className="text-xs text-white/60">{p.role}</div>
                </div>
                {/* speech tail */}
                <div className="absolute -bottom-3 left-12 h-6 w-6 rotate-45 bg-navy" />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

    </>
  );
}
