import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { NOAH_VERSION } from "@/lib/noah-version";

// NOAH (the AI oral examiner) runs as its own app; this page shows it inside the
// site. ?embed= opens it straight to one role's sign-in (see NOAH's embed mode).
export const NOAH_URL = "https://cognify-noah.vercel.app";

export function NoahFrame({ role }: { role: "student" | "admin" }) {
  const back = role === "admin" ? "/admin" : "/";
  return (
    <div className="flex h-dvh flex-col bg-cream dark:bg-[#0a1224]">
      <div className="flex items-center gap-3 border-b border-navy/10 px-4 py-2 dark:border-white/10">
        <Link
          to={back}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-navy dark:text-cream"
        >
          <ArrowLeft className="h-4 w-4" />
          {role === "admin" ? "Admin dashboard" : "Cognify"}
        </Link>
        <span className="text-sm font-semibold text-navy/60 dark:text-cream/60">
          NOAH {role === "admin" ? "· Admin" : "· AI oral examiner"}
        </span>
      </div>
      <iframe
        title={role === "admin" ? "NOAH admin" : "NOAH"}
        src={`${NOAH_URL}/?embed=${role}&v=${NOAH_VERSION}`}
        allow="microphone; fullscreen"
        className="block w-full flex-1 border-0"
      />
    </div>
  );
}
