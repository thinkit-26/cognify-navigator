import { Link } from "@tanstack/react-router";
import { LogoFull } from "./Logo";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-navy text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <LogoFull className="h-28 w-auto opacity-95 md:h-32" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-background/70">
            A thinking institute for Classes 9-12. Maths, Physics, Chemistry & Economics, taught for clarity,
            built for confidence.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-full border border-background/20 transition hover:bg-background hover:text-navy"
                aria-label="Social"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-background">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/testimonials", "Testimonials"],
              ["/contact", "Contact"],
              ["/privacy", "Privacy Policy"],
              ["/terms", "Terms of Service"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-background/70 transition hover:text-background">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-background">Visit</h4>
          <ul className="mt-4 space-y-3 text-sm text-background/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-background/60" />
              <span>C9 First Floor, SDA Market, New Delhi</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-background/60" />
              <span>9971077388 · 9958046154</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-background/60" />
              <span>thecognifyinstitute@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/15 py-5 text-center text-xs text-background/60">
        © {year} Cognify Institute. Clarity. Confidence. Cognify.
        <span className="mx-1.5">·</span>
        Crafted by Abhay Kapoor / Briar
      </div>
    </footer>
  );
}
