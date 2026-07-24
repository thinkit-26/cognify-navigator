import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Reveal } from "@/components/Section";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CutButton, CutLink } from "@/components/CutButton";
import { sendContactEnquiry } from "@/lib/contact.functions";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact, Cognify Institute" },
      { name: "description", content: "Book a free trial class. C9 First Floor, SDA Market, New Delhi." },
      { property: "og:title", content: "Contact Cognify" },
      { property: "og:description", content: "Book a free trial class at C9 SDA Market, Delhi." },
    ],
  }),
  component: Contact,
});

const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  "9": ["Maths", "Science"],
  "10": ["Maths", "Science"],
  "11": ["Physics", "Chemistry", "Maths", "Economics"],
  "12": ["Physics", "Chemistry", "Maths", "Economics"],
};

const RECIPIENTS = ["thinkitedu@gmail.com", "thecognifyinstitute@gmail.com"];

function Contact() {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cls: "9",
    subjects: [] as string[],
    message: "",
  });

  const submit = useServerFn(sendContactEnquiry);

  const subjectOptions = useMemo(() => SUBJECTS_BY_CLASS[form.cls] ?? [], [form.cls]);

  const toggle = (s: string) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }));

  const setClass = (cls: string) =>
    setForm((f) => ({
      ...f,
      cls,
      subjects: f.subjects.filter((s) => (SUBJECTS_BY_CLASS[cls] ?? []).includes(s)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submit({ data: form });
      navigate({ to: "/thank-you", search: { name: form.name } });
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't send your enquiry. Please call us at +91 99710 77388.");
      setSubmitting(false);
    }
  };



  return (
    <>
      <section className="relative pt-36 pb-12 maze-bg">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> GET IN TOUCH
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            Book a free <span className="text-gradient-warm">trial class.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            No pressure. A clear picture of where your child stands.
          </p>
        </div>
      </section>


      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-[2rem] border border-border bg-white p-8 shadow-soft md:p-10 dark:bg-white/5 dark:border-white/10">
              <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-navy/70 dark:text-cream/70">NAME</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-2 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-navy outline-none transition focus:border-orange dark:bg-white/5 dark:text-cream"
                        placeholder="Student or parent name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-navy/70 dark:text-cream/70">PHONE</label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-2 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-navy outline-none transition focus:border-orange dark:bg-white/5 dark:text-cream"
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-navy/70 dark:text-cream/70">EMAIL (OPTIONAL)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-2 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-navy outline-none transition focus:border-orange dark:bg-white/5 dark:text-cream"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-navy/70 dark:text-cream/70">CLASS</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { v: "9", l: "Class 9" },
                        { v: "10", l: "Class 10" },
                        { v: "11", l: "Class XI" },
                        { v: "12", l: "Class XII" },
                      ].map((c) => (
                        <button
                          key={c.v}
                          type="button"
                          onClick={() => setClass(c.v)}
                          className={`rounded-full border-2 px-5 py-2 text-sm font-bold transition ${
                            form.cls === c.v
                              ? "border-navy bg-navy text-white"
                              : "border-border bg-white text-navy hover:border-navy/40 dark:bg-white/5 dark:text-cream"
                          }`}
                        >
                          {c.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-navy/70 dark:text-cream/70">
                      SUBJECT INTEREST <span className="font-normal normal-case tracking-normal text-navy/40">(select one or more)</span>
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subjectOptions.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggle(s)}
                          className={`rounded-full border-2 px-5 py-2 text-sm font-bold transition ${
                            form.subjects.includes(s)
                              ? "border-orange bg-orange text-white"
                              : "border-border bg-white text-navy hover:border-orange/40 dark:bg-white/5 dark:text-cream"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-navy/70 dark:text-cream/70">MESSAGE (OPTIONAL)</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={3}
                      className="mt-2 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-navy outline-none transition focus:border-orange dark:bg-white/5 dark:text-cream"
                      placeholder="Anything specific we should know?"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-cream/40 p-4 text-sm text-navy/80 dark:bg-white/5 dark:border-white/10 dark:text-cream/80">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-orange"
                    />
                    <span>
                      By submitting this form, you agree to be contacted by Cognify Institute regarding your inquiry
                      and consent to the processing of your information in accordance with our{" "}
                      <Link to="/privacy" className="font-bold text-orange underline-offset-4 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {error && (
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                  )}

                  <div className="pt-2">
                    <CutButton type="submit" variant="solid" disabled={submitting}>
                      {submitting ? "Sending…" : "Book My Free Trial Class"} <ArrowRight className="h-4 w-4" />
                    </CutButton>
                  </div>

                </form>

            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-5">
              {/* Glassy translucent contact card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/30 p-8 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-orange/20 blur-3xl" />
                <h3 className="relative text-xs font-extrabold tracking-widest text-orange">VISIT US</h3>
                <ul className="relative mt-5 space-y-4 text-sm text-navy/85 dark:text-cream/85">
                  <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-orange" /><span>C9 First Floor, SDA Market, New Delhi 110016</span></li>
                  <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-orange" /><span>+91 99710 77388 · +91 99580 46154</span></li>
                  <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-orange" /><span>thecognifyinstitute@gmail.com</span></li>
                </ul>
                <div className="relative mt-6">
                  <CutLink
                    to="/contact"
                    variant="solid"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open("https://wa.me/919971077388", "_blank", "noreferrer");
                    }}
                  >
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </CutLink>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
                <iframe
                  title="Cognify Map"
                  src="https://www.google.com/maps?q=SDA+Market+Delhi&output=embed"
                  className="h-72 w-full"
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
