import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function WhatsAppButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#0F172A] text-white shadow-xl ring-2 ring-orange/40 transition-all duration-300 hover:scale-110 hover:bg-orange dark:bg-orange dark:text-[#112D57] dark:ring-orange-glow/60 dark:hover:bg-orange-glow ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
