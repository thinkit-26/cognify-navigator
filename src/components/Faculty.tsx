import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Calculator, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Section, Reveal } from "@/components/Section";
import cleanSrc from "@/assets/faculty-aseem-clean.png";
import teachingSrc from "@/assets/faculty-aseem-teaching.png";
import physicsManSrc from "@/assets/physics-man.png";
import sheshTeachSrc from "@/assets/faculty-shesh-teaching.png";
import sheshPortraitSrc from "@/assets/faculty-shesh-portrait.png";
import classroom1 from "@/assets/classroom-1.png";
import classroom2 from "@/assets/classroom-2.png";

const carousel = [
  { src: teachingSrc, label: "A regular Tuesday · SDA Market", tag: "Inside the classroom" },
  { src: classroom2, label: "Doubt session · Caps on, heads down", tag: "Mr. Aseem with his students" },
  { src: classroom1, label: "Outside The Equator Line", tag: "Alumni drop-ins" },
];

function ClassroomCarousel() {
  const [i, setI] = useState(0);
  const next = () => setI((p) => (p + 1) % carousel.length);
  const prev = () => setI((p) => (p - 1 + carousel.length) % carousel.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, []);

  const cur = carousel[i];

  return (
    <figure className="relative overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border border-border bg-navy shadow-soft">
      <div className="relative h-[420px] w-full overflow-hidden bg-navy">
        <AnimatePresence mode="wait">
          <motion.img
            key={i}
            src={cur.src}
            alt={cur.label}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </AnimatePresence>

        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-lg backdrop-blur transition hover:scale-110 hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-lg backdrop-blur transition hover:scale-110 hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {carousel.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Slide ${k + 1}`}
              className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-orange" : "w-4 bg-white/60"}`}
            />
          ))}
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-4 bg-navy px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
        <span>{cur.label}</span>
        <span className="text-gold">{cur.tag}</span>
      </figcaption>
    </figure>
  );
}


export function Faculty() {
  

  return (
    <Section
      id="faculty"
      eyebrow="MEET THE FACULTY"
      title={<>Not lecturers. <span className="text-gradient-warm">Mentors.</span></>}
      subtitle="The people who'll actually know your child by name, and by handwriting."
    >
      {/* TEACHER 1, ASEEM */}
      <Reveal>
        <div className="grid gap-8 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-md rounded-bl-md border border-orange/20 bg-[var(--cream-soft)] dark:bg-[#0F172A] shadow-soft ring-1 ring-orange/10 md:grid-cols-[1.05fr_1fr]">
          <div className="relative aspect-[4/5] bg-navy md:aspect-auto md:min-h-[560px]">
            <img
              src={cleanSrc}
              alt="Mr. Aseem Bajpai"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <motion.img
              src={physicsManSrc}
              alt=""
              aria-hidden
              initial={{ rotate: -6, opacity: 0, scale: 0.9 }}
              whileInView={{ rotate: -6, opacity: 0.95, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ amount: 0.3 }}
              className="pointer-events-none absolute -right-6 -bottom-8 hidden h-60 w-48 object-contain drop-shadow-xl md:block"
            />
          </div>

          <div className="relative flex flex-col justify-center gap-5 p-8 md:p-12">
            <div className="flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.3em] text-orange">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-orange/10 text-orange">
                <Atom className="h-4 w-4" />
              </span>
              PHYSICS · CLASSES IX – XII
            </div>

            <h3 className="text-4xl font-black leading-[1.05] text-navy md:text-5xl">
              Mr. Aseem Bajpai
              <span className="ml-2 align-middle text-base font-bold text-muted-foreground italic">
                a.k.a. "Physics Man"
              </span>
            </h3>

            <p className="text-base leading-relaxed text-muted-foreground">
              You'll usually find Aseem Sir in a cap, scribbling free-body diagrams faster than students can copy them.
              For over a decade, Sir has been making mechanics, waves and electromagnetism feel <em className="text-navy not-italic font-semibold">obvious</em>.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {["Mechanics", "Waves & Optics", "Electromagnetism", "JEE Physics"].map((t) => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-navy/70">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* candid classroom carousel */}
      <Reveal delay={0.1}>
        <div className="mt-10">
          <ClassroomCarousel />
        </div>
      </Reveal>

      {/* TEACHER 2, SHESH (reversed layout) */}
      <Reveal>
        <div className="mt-16 grid gap-8 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-md rounded-bl-md border border-orange/20 bg-[var(--cream-soft)] dark:bg-[#0F172A] shadow-soft ring-1 ring-orange/10 md:grid-cols-[1fr_1.05fr]">
          <div className="relative order-2 flex flex-col justify-center gap-5 p-8 md:order-1 md:p-12">
            <div className="flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.3em] text-orange">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-orange/10 text-orange">
                <Calculator className="h-4 w-4" />
              </span>
              MATHEMATICS · CLASSES IX – XII
            </div>

            <h3 className="text-4xl font-black leading-[1.05] text-navy md:text-5xl">
              Mr. Shesh Narayan Jaiswal
              <span className="ml-2 align-middle text-base font-bold text-muted-foreground italic">
                a.k.a. "The Proof"
              </span>
            </h3>

            <p className="text-base leading-relaxed text-muted-foreground">
              Calm at the board, ruthless about reasoning. Shesh Sir believes every Maths problem has
              a <em className="text-navy not-italic font-semibold">why</em>, and he won't let a student write a step
              they can't defend. With Sir, calculus finally clicks and geometry stops feeling like guesswork.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {["Algebra", "Calculus", "Coordinate Geometry", "JEE Maths", "Boards"].map((t) => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-navy/70">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-2 inline-flex items-center gap-3 self-start rounded-tl-xl rounded-br-xl border-l-4 border-orange bg-orange/5 px-4 py-3 text-xs font-bold text-navy/80">
              <span className="text-gradient-warm text-base font-black">"Derive it. Don't memorise it."</span>
            </div>
          </div>

          <div className="relative order-1 aspect-[4/5] overflow-hidden bg-navy md:order-2 md:aspect-auto md:min-h-[560px]">
            <img
              src={sheshTeachSrc}
              alt="Mr. Shesh Narayan Jaiswal teaching at the board"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            {/* small inset portrait */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 4 }}
              whileInView={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ duration: 0.6 }}
              viewport={{ amount: 0.3 }}
              className="absolute bottom-5 right-5 hidden h-44 w-32 overflow-hidden rounded-tl-xl rounded-br-xl border-4 border-white shadow-glow md:block"
            >
              <img src={sheshPortraitSrc} alt="" className="h-full w-full object-cover" />
            </motion.div>
            <div className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold tracking-[0.25em] text-navy shadow">
              AT THE BOARD
            </div>
          </div>
        </div>
      </Reveal>

      {/* duo block removed */}

      {/* Video testimonial placeholders */}
      <Reveal delay={0.05}>
        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-[0.65rem] font-bold tracking-[0.3em] text-orange">- IN THEIR OWN WORDS</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-navy md:text-3xl">
                Video testimonials <span className="text-fluid italic">coming soon.</span>
              </h3>
            </div>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:block">
              Students · Parents · Alumni
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { tag: "STUDENT · CLASS XII", name: "Coming soon" },
              { tag: "PARENT", name: "Coming soon" },
              { tag: "ALUMNUS · IIT", name: "Coming soon" },
            ].map((v, i) => (
              <div
                key={i}
                className="group relative aspect-[9/12] overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-md rounded-bl-md border border-orange/20 bg-[var(--cream-soft)] dark:bg-[#0F172A] shadow-soft ring-1 ring-orange/10 transition hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-orange/10" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white/70 text-navy shadow-lg backdrop-blur transition group-hover:scale-110 group-hover:bg-orange group-hover:text-white">
                    <Play className="h-6 w-6 fill-current" />
                  </div>
                </div>
                <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-extrabold tracking-[0.25em] text-navy backdrop-blur">
                  {v.tag}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.22em] text-navy/80">
                  <span>{v.name}</span>
                  <span className="text-orange">▶ 0:00</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

    </Section>
  );
}
