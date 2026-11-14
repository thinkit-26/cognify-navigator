import { Counter } from "@/components/Counter";
import { Rise, hair, ink, sub } from "./ui";

const stats = [
  { n: 500, s: "+", l: "Students taught" },
  { n: 12, s: "+", l: "Years running" },
  { n: 100, s: "%", l: "Board pass rate" },
  { n: 40, s: "+", l: "Top university admits" },
];

/* Hairlines between cells: vertical on desktop, a cross on the 2x2 phone grid. */
const cell = [
  "pr-6 md:pr-8",
  "border-l pl-6 md:pl-8 md:pr-8",
  "border-t pr-6 md:border-l md:border-t-0 md:pl-8 md:pr-8",
  "border-l border-t pl-6 md:border-t-0 md:pl-8",
];

/* One quiet band of numbers: no cards, hairlines between. */
export function Stats() {
  return (
    <section className={`border-y ${hair}`}>
      <Rise className="mx-auto grid max-w-7xl grid-cols-2 px-6 md:grid-cols-4 md:px-10">
        {stats.map((s, i) => (
          <div key={s.l} className={`py-12 md:py-16 ${cell[i]} ${hair}`}>
            <div className={`text-5xl font-semibold tracking-[-0.03em] md:text-6xl ${ink}`}>
              <Counter to={s.n} suffix={s.s} />
            </div>
            <div className={`mt-2 text-base ${sub}`}>{s.l}</div>
          </div>
        ))}
      </Rise>
    </section>
  );
}
