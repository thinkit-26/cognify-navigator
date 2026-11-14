import cleanSrc from "@/assets/faculty-aseem-clean.png";
import teachingSrc from "@/assets/faculty-aseem-teaching.png";
import sheshTeachSrc from "@/assets/faculty-shesh-teaching.png";
import classroom1 from "@/assets/classroom-1.png";
import { Band, Heading, Rise, hair, ink, sub, surface } from "./ui";

const mentors = [
  {
    name: "Mr. Aseem Bajpai",
    aka: "a.k.a. “Physics Man”",
    role: "Physics, Classes 9-12",
    img: cleanSrc,
    alt: "Mr. Aseem Bajpai",
    pos: "object-center",
    bio: "You'll usually find Aseem Sir in a cap, scribbling free-body diagrams faster than students can copy them. For over a decade, Sir has been making mechanics, waves and electromagnetism feel obvious.",
    topics: ["Mechanics", "Waves & Optics", "Electromagnetism", "JEE Physics"],
  },
  {
    name: "Mr. Shesh Narayan Jaiswal",
    aka: "a.k.a. “The Proof”",
    role: "Mathematics, Classes 9-12",
    img: sheshTeachSrc,
    alt: "Mr. Shesh Narayan Jaiswal teaching at the board",
    pos: "object-top",
    bio: "Calm at the board, ruthless about reasoning. Shesh Sir believes every Maths problem has a why, and he won't let a student write a step they can't defend. With Sir, calculus finally clicks and geometry stops feeling like guesswork.",
    topics: ["Algebra", "Calculus", "Coordinate Geometry", "JEE Maths", "Boards"],
    line: "“Derive it. Don't memorise it.”",
  },
];

export function Mentors() {
  return (
    <Band id="faculty">
      <Rise>
        <Heading intro="The people who'll actually know your child by name, and by handwriting.">Not lecturers. Mentors.</Heading>
      </Rise>

      <div className="mt-16 space-y-20 md:space-y-28">
        {mentors.map((m, i) => (
          <Rise key={m.name} className="grid items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16">
            <div className={`relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-white/5 ${surface} ${i % 2 ? "md:order-2" : ""}`}>
              <img src={m.img} alt={m.alt} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${m.pos}`} />
            </div>
            <div className={i % 2 ? "md:order-1" : ""}>
              <div className={`text-sm font-medium ${sub}`}>{m.role}</div>
              <h3 className={`mt-2 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl ${ink}`}>{m.name}</h3>
              <div className={`mt-2 text-lg ${sub}`}>{m.aka}</div>
              <p className={`mt-6 max-w-[55ch] text-lg leading-relaxed ${sub}`}>{m.bio}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {m.topics.map((t) => (
                  <li key={t} className={`rounded-full border px-3.5 py-1.5 text-sm ${hair} ${ink}`}>{t}</li>
                ))}
              </ul>
              {m.line && <p className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-navy">{m.line}</p>}
            </div>
          </Rise>
        ))}
      </div>

      <div className="mt-24 grid gap-6 md:grid-cols-[1fr_1.5fr]">
        {[
          { src: teachingSrc, cap: "Doubt session at SDA Market. Caps on, heads down.", pos: "object-center" },
          { src: classroom1, cap: "Outside The Equator Line, with alumni dropping in.", pos: "object-[35%_center]" },
        ].map((g, i) => (
          <Rise key={g.cap} delay={i * 0.08}>
            <figure>
              <div className={`aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-white/5 ${surface}`}>
                <img src={g.src} alt={g.cap} loading="lazy" decoding="async" className={`h-full w-full object-cover ${g.pos}`} />
              </div>
              <figcaption className={`mt-3 text-sm ${sub}`}>{g.cap}</figcaption>
            </figure>
          </Rise>
        ))}
      </div>
    </Band>
  );
}
