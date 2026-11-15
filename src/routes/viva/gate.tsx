import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, AudioLines, ClipboardCheck, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureVivaToken } from "@/lib/viva/guard";
import Button from "@/components/viva/Button";
import { LogoFull } from "@/components/Logo";
import { Astronaut, Rocket, Star } from "@/components/Doodles";
import { LoginWave } from "@/components/LoginWave";

export const Route = createFileRoute("/viva/gate")({
  head: () => ({ meta: [{ title: "Sign in, AI Oral Viva" }] }),
  component: VivaLogin,
});

type Mode = "signin" | "signup";

const field =
  "flex items-center gap-3 rounded-2xl border-2 border-border bg-white px-4 py-3.5 transition focus-within:border-navy dark:bg-white/5";
const input = "w-full bg-transparent text-navy outline-none placeholder:text-navy/40 dark:text-cream";

function VivaLogin() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in: go straight to the test.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/viva/select" });
    });
  }, [navigate]);

  const enter = async () => {
    await ensureVivaToken();
    navigate({ to: "/viva/select" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || !password) return setError("Enter your email and password.");
    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your full name.");
      if (password.length < 6) return setError("Your password needs at least 6 characters.");
    }
    setBusy(true);
    try {
      const { data, error: authError } =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { data: { full_name: name.trim() } },
            })
          : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      if (!data.session) {
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
        setBusy(false);
        return;
      }
      await enter();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) return setError("Enter your email above first.");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (resetError) return setError(resetError.message);
    setInfo("If that email has an account, a reset link is on its way.");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-card shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative isolate hidden overflow-hidden bg-navy px-10 py-10 text-white lg:flex lg:flex-col">
          <Link to="/" className="inline-flex items-center" aria-label="Cognify home">
            <LogoFull white className="h-20 w-auto md:h-24" />
          </Link>
          <div className="mt-14 max-w-lg">
            <h1 className="text-5xl font-black leading-[1.02] text-white md:text-6xl">
              NOAH <span className="text-orange-glow">AI</span>
            </h1>
            <ul className="mt-10 space-y-4 text-white/85">
              {[
                { Icon: AudioLines, text: "Questions from the chapters you pick" },
                { Icon: ClipboardCheck, text: "Every answer scored and explained" },
                { Icon: LineChart, text: "Each attempt saved to your account" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-tl-xl rounded-br-xl bg-white/10 text-orange-glow">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-auto h-[240px]">
            <Rocket className="absolute right-[10%] top-2 h-20 w-20 text-orange-glow/90" delay={0.4} />
            <Star className="absolute left-[18%] top-10 h-5 w-5 text-orange-glow" delay={0.6} />
            <Astronaut interactive className="absolute bottom-0 right-[4%] h-48 w-48 text-white" />
          </div>
          <LoginWave className="opacity-90" />
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center bg-background px-6 py-10 md:px-12">
          <div className="w-full max-w-md">
            <p className="text-center text-xs font-bold tracking-[0.25em] text-orange">HELLO STUDENT</p>
            <div className="mt-5 grid grid-cols-2 rounded-full bg-secondary p-1 text-sm font-bold" role="tablist">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                    setInfo("");
                  }}
                  className={`relative rounded-full py-2.5 transition-colors duration-300 ${mode === m ? "text-cream" : "text-navy/60"}`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="viva-tab"
                      className="absolute inset-0 rounded-full bg-navy shadow"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{m === "signin" ? "Sign in" : "Create account"}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 [&>*:not(:last-child)]:mb-4">
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div
                    key="name"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="!mb-0 overflow-hidden pb-4"
                  >
                    <label className={field}>
                      <User className="shrink-0 text-orange" size={20} />
                      <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" className={input} />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
              <label className={field}>
                <Mail className="shrink-0 text-orange" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="Email" className={input} />
              </label>
              <label className={field}>
                <Lock className="shrink-0 text-orange" size={20} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="Password"
                  className={input}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="text-navy/50 hover:text-navy">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </label>

              {error && <p className="text-center text-sm font-semibold text-rose-600">{error}</p>}
              {info && <p className="text-center text-sm font-semibold text-emerald-700">{info}</p>}

              <Button type="submit" disabled={busy} className="w-full py-3.5">
                {busy ? "Please wait..." : mode === "signin" ? "Sign in and start" : "Create account and start"}
                <ArrowRight size={18} />
              </Button>
            </form>

            {mode === "signin" && (
              <p className="mt-6 text-center text-sm">
                <button type="button" onClick={forgotPassword} className="font-bold text-orange hover:underline">
                  Forgot your password?
                </button>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
