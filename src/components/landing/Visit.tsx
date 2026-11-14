import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Band, Heading, Rise, buttonPrimary, hair, ink, sub, surface } from "./ui";

/* Address and hours on the left, the map on the right. */
export function Visit() {
  return (
    <Band>
      <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:gap-16">
        <Rise>
          <Heading intro="Tucked into the corner where serious learning happens. Walk in, or book a free 45-minute trial class.">SDA Market, South Delhi.</Heading>
          <address className={`mt-10 space-y-6 border-t pt-8 not-italic ${hair}`}>
            <p className={`text-xl font-medium leading-snug ${ink}`}>
              C9, First Floor<br />SDA Market<br />New Delhi 110016
            </p>
            <div className={`space-y-1.5 ${sub}`}>
              <p>Mon - Sat, 10:00 - 19:00</p>
              <p>+91 99710 77388, +91 99580 46154</p>
              <p>thecognifyinstitute@gmail.com</p>
            </div>
          </address>
          <Link to="/contact" className={`${buttonPrimary} mt-10`}>
            Book a free trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Rise>
        <Rise delay={0.08}>
          <div className={`overflow-hidden border ${surface} ${hair}`}>
            <iframe
              title="Cognify Institute, SDA Market"
              src="https://www.google.com/maps?q=SDA+Market+New+Delhi&output=embed"
              className="block h-[420px] w-full md:h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Rise>
      </div>
    </Band>
  );
}
