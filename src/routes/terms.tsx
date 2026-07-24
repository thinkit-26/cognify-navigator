import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Cognify Institute" },
      { name: "description", content: "Terms and conditions for using the Cognify Institute website and services." },
      { property: "og:title", content: "Terms of Service — Cognify Institute" },
      { property: "og:description", content: "Terms and conditions for using the Cognify Institute website and services." },
    ],
  }),
  component: Terms,
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

function Terms() {
  const updated = "12 June 2026";
  return (
    <div className="bg-background">
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-orange">
            <span className="h-px w-8 bg-orange" /> LEGAL <span className="h-px w-8 bg-orange" />
          </div>
          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] text-navy md:text-6xl">
            Terms of <span className="text-gradient-warm">Service</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated}</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-white px-6 py-10 shadow-soft md:px-12 md:py-14 dark:bg-white/5 dark:border-white/10">
          <P>
            These Terms of Service ("Terms") govern your access to and use of the <strong>Cognify Institute</strong>{" "}
            website and related services. By using our website, you agree to be bound by these Terms.
          </P>

          <H2>Use of the Website</H2>
          <P>You agree to use this website only for lawful purposes. You must not:</P>
          <UL>
            <li>Submit false, misleading, or fraudulent information.</li>
            <li>Attempt to disrupt, interfere with, or gain unauthorised access to the website or its systems.</li>
            <li>Use the website to transmit spam, malware, or any harmful content.</li>
            <li>Copy, reproduce, or redistribute any content without prior written permission.</li>
          </UL>

          <H2>Enquiries & Communications</H2>
          <P>
            When you submit an enquiry or contact form, you authorise Cognify Institute to contact you by phone,
            email, SMS, or WhatsApp regarding your request, our courses, programs, counselling sessions, and
            related educational opportunities.
          </P>

          <H2>Educational Services</H2>
          <P>
            All course details, schedules, faculty allocations, and fee structures are subject to change at the
            discretion of Cognify Institute. Admission to any program is at our sole discretion and may require
            additional eligibility checks.
          </P>

          <H2>Intellectual Property</H2>
          <P>
            All content on this website — including text, graphics, logos, images, and study material — is the
            property of Cognify Institute and is protected by applicable intellectual property laws. You may not
            reproduce or distribute any content without express written permission.
          </P>

          <H2>Third-Party Links</H2>
          <P>
            Our website may contain links to external sites. Cognify Institute is not responsible for the content,
            accuracy, or practices of any third-party websites.
          </P>

          <H2>Disclaimer</H2>
          <P>
            The website and its content are provided on an "as is" and "as available" basis. While we strive for
            accuracy, Cognify Institute makes no warranties regarding the completeness, reliability, or suitability
            of the information presented.
          </P>

          <H2>Limitation of Liability</H2>
          <P>
            To the maximum extent permitted by law, Cognify Institute shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of, or inability to use, this website.
          </P>

          <H2>Privacy</H2>
          <P>
            Your use of the website is also governed by our{" "}
            <Link to="/privacy" className="font-bold text-orange underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            , which explains how we collect and use your information.
          </P>

          <H2>Changes to These Terms</H2>
          <P>
            Cognify Institute reserves the right to modify these Terms at any time. Updated Terms will be posted
            on this page with a new effective date. Continued use of the website after changes constitutes
            acceptance of the revised Terms.
          </P>

          <H2>Governing Law</H2>
          <P>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of the courts at New Delhi.
          </P>

          <H2>Contact</H2>
          <P>
            For any questions regarding these Terms, please contact us at{" "}
            <a href="mailto:thecognifyinstitute@gmail.com" className="font-bold text-orange underline-offset-4 hover:underline">
              thecognifyinstitute@gmail.com
            </a>{" "}
            or call +91 99710 77388 / +91 99580 46154.
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
