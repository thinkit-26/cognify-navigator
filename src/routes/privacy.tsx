import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Cognify Institute" },
      { name: "description", content: "How Cognify Institute collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Cognify Institute" },
      { property: "og:description", content: "How Cognify Institute collects, uses, and protects your personal information." },
    ],
  }),
  component: Privacy,
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-center text-2xl font-extrabold text-navy dark:text-cream">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-center text-[15px] leading-relaxed text-navy/80 dark:text-cream/80">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mx-auto mt-4 max-w-xl list-none space-y-2 text-center text-[15px] leading-relaxed text-navy/80 dark:text-cream/80">
      {children}
    </ul>
  );
}

function Privacy() {
  const updated = "12 June 2026";
  return (
    <div className="bg-background">
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> LEGAL <span className="h-px w-8 bg-orange" />
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            Privacy <span className="text-gradient-warm">Policy</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated}</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-white px-6 py-10 shadow-soft md:px-12 md:py-14 dark:bg-white/5 dark:border-white/10">
          <P>
            At <strong>Cognify Institute</strong>, we respect your privacy and are committed to protecting any
            personal information you provide through our website.
          </P>

          <H2>Information We Collect</H2>
          <P>When you contact us through our website, we may collect the following information:</P>
          <UL>
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Academic Details (if voluntarily provided)</li>
            <li>Any information you choose to include in your message or inquiry</li>
          </UL>

          <H2>How We Use Your Information</H2>
          <P>The information collected may be used to:</P>
          <UL>
            <li>Respond to your inquiries and requests.</li>
            <li>Provide information about our courses, programs, and services.</li>
            <li>Contact you regarding admissions, counselling sessions, or educational opportunities.</li>
            <li>Improve our website and user experience.</li>
            <li>Maintain records of communications for administrative purposes.</li>
          </UL>

          <H2>Information Sharing</H2>
          <P>Cognify Institute does not sell, rent, or trade your personal information to third parties.</P>
          <P>We may disclose information only:</P>
          <UL>
            <li>When required by applicable law or legal process.</li>
            <li>To protect the rights, safety, and security of Cognify Institute and its users.</li>
            <li>To trusted service providers assisting us in operating our website, subject to confidentiality obligations.</li>
          </UL>

          <H2>Data Security</H2>
          <P>
            We take reasonable administrative, technical, and physical measures to safeguard your personal
            information against unauthorized access, disclosure, alteration, or destruction.
          </P>
          <P>
            While we strive to protect your information, no method of internet transmission or electronic storage
            is completely secure.
          </P>

          <H2>Cookies and Analytics</H2>
          <P>
            Our website may use cookies and analytics tools to understand website usage and improve user
            experience. These technologies do not collect personally identifiable information unless voluntarily
            submitted by you.
          </P>
          <P>
            You may choose to disable cookies through your browser settings, though some website features may not
            function properly.
          </P>

          <H2>Third-Party Websites</H2>
          <P>
            Our website may contain links to third-party websites for your convenience. Cognify Institute is not
            responsible for the privacy practices, policies, or content of external websites.
          </P>

          <H2>Your Rights</H2>
          <P>
            You may request access to, correction of, or deletion of the personal information you have shared with
            us by contacting us using the details provided below.
          </P>

          <H2>Contact Us</H2>
          <P>
            If you have any questions regarding this Privacy Policy or the handling of your personal information,
            please contact:
          </P>
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-border bg-cream-deep/40 px-6 py-5 text-center dark:bg-white/5 dark:border-white/10">
            <p className="font-extrabold text-navy dark:text-cream">Cognify Institute</p>
            <ul className="mt-3 space-y-2 text-[15px] text-navy/85 dark:text-cream/85">
              <li className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4 text-orange" /><span>C9 First Floor, SDA Market, New Delhi 110016</span></li>
              <li className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-orange" /><span>thecognifyinstitute@gmail.com</span></li>
              <li className="flex items-center justify-center gap-2"><Phone className="h-4 w-4 text-orange" /><span>+91 99710 77388 · +91 99580 46154</span></li>
            </ul>
          </div>

          <H2>Consent</H2>
          <P>
            By submitting your information through this website, you consent to the collection, storage, and use
            of your information as described in this Privacy Policy.
          </P>

          <H2>Changes to This Privacy Policy</H2>
          <P>
            Cognify Institute reserves the right to modify or update this Privacy Policy at any time. Any changes
            will be posted on this page along with the updated effective date.
          </P>

          <div className="mt-12 text-center">
            <Link to="/contact" className="text-sm font-bold text-orange underline-offset-4 hover:underline">
              ← Back to Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
