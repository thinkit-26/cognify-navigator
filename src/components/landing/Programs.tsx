import { Band, Heading, Rise, hair, ink, sub, surface } from "./ui";

const subjects = "Maths, Physics, Chemistry, Economics";

const jumpStats = [
  { big: "3.2×", small: "more chapters per subject vs. Class X" },
  { big: "5×", small: "conceptual depth: calculus, mechanics, mole concept" },
  { big: "2×", small: "self-study hours expected per week" },
  { big: "60%", small: "of XI students drop a grade band in term 1" },
];

function Track({ cls, title, body }: { cls: string; title: string; body: string }) {
  return (
    <div className={`border p-7 md:p-8 ${surface} ${hair}`}>
      <div className={`text-sm font-medium ${sub}`}>Class {cls}</div>
      <h3 className={`mt-2 text-2xl font-semibold tracking-[-0.02em] ${ink}`}>{title}</h3>
      <p className={`mt-3 ${sub}`}>{body}</p>
      <p className={`mt-5 text-sm font-medium ${ink}`}>{subjects}</p>
    </div>
  );
}

/* Asymmetric: two quieter tracks on the left, the Transition Year as the featured tile. */
export function Programs() {
  return (
    <Band id="programs">
      <Rise>
        <Heading intro="Small batches. In sync with school. Faculty who know each student by name.">Built for the formative years that matter most.</Heading>
      </Rise>
      <div className="mt-14 grid gap-6 md:grid-cols-[1fr_1.35fr]">
        <div className="flex flex-col gap-6">
          <Rise>
            <Track cls="IX-X" title="Foundation" body="Build the structural understanding that turns Class XI into a forward step, not a cliff." />
          </Rise>
          <Rise delay={0.08} className="flex-1">
            <Track cls="XII" title="Boards & Beyond" body="Board mastery plus the conceptual depth that holds up in JEE, NEET, SAT and undergrad abroad." />
          </Rise>
        </div>
        <Rise delay={0.04}>
          <div className={`h-full bg-navy p-8 text-background md:p-10 ${surface}`}>
            <div className="text-sm font-medium opacity-70">Class XI, the jump from Class X</div>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.025em] md:text-4xl">The Transition Year</h3>
            <p className="mt-3 max-w-[52ch] text-lg leading-relaxed opacity-90">
              Class XI is the single largest jump in school. We slow it down, layer it, and rebuild fluency. It isn't the next step, it's a different staircase: new abstractions, faster pace, exams that don't reward memory.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6">
              {jumpStats.map((s) => (
                <div key={s.big}>
                  <dt className="text-4xl font-semibold tracking-[-0.03em]">{s.big}</dt>
                  <dd className="mt-1 text-sm leading-snug opacity-80">{s.small}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 border-t border-background/20 pt-6 opacity-90">
              Cognify's Transition Year rebuilds the slope: slower start, deeper layering, fortnightly check-ins.
            </p>
            <p className="mt-4 text-sm font-medium opacity-80">{subjects}</p>
          </div>
        </Rise>
      </div>
    </Band>
  );
}
