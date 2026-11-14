import { Band, Heading, Rise, hair, ink } from "./ui";

const pairs = [
  { old: "Memorise the formula", now: "Derive the formula" },
  { old: "Finish the syllabus", now: "Understand the syllabus" },
  { old: "Solve for the answer", now: "Solve for the why" },
  { old: "Cram before the exam", now: "Compound across the year" },
];

/* Left: the argument, pinned on desktop. Right: four old-way / Cognify-way pairs. */
export function Contrast() {
  return (
    <Band>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <Rise className="md:sticky md:top-28 md:col-span-5 md:self-start">
          <Heading intro="No drilling. No cramming. No ranks for sale. We teach the formative years that shape how a child thinks. Small batches, real attention, and room to get things wrong before getting them right.">
            Not your conventional coaching centre.
          </Heading>
        </Rise>
        <ul className="md:col-span-7">
          {pairs.map((p, i) => (
            <li key={p.old} className={`border-t py-8 md:py-10 ${hair}`}>
              <Rise delay={i * 0.06}>
                <div className="text-xl text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600 md:text-2xl">{p.old}</div>
                <div className={`mt-2 text-3xl font-semibold tracking-[-0.02em] md:text-4xl ${ink}`}>{p.now}</div>
              </Rise>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
