import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { LogoFull } from "@/components/Logo";
import { Astronaut, Rocket, Star } from "@/components/Doodles";
import { LoginWave } from "@/components/LoginWave";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in, Cognify Institute" }] }),
});

type Mode = "signin" | "signup";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInWithGoogle = async () => {
    setErr("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) {
      setErr(error.message || "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
    // On success Supabase redirects the browser to Google, then back to redirectTo.
  };


  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) return setErr("Please enter your email and password.");
    if (mode === "signup") {
      if (!name) return setErr("Please enter your full name.");
      if (password.length < 6) return setErr("Password must be at least 6 characters.");
      if (password !== confirm) return setErr("Passwords do not match.");
      if (!agree) return setErr("Please accept the Terms of Service and Privacy Policy.");
    }
    setErr("Sign-in is not yet connected. Please contact the institute.");
  };


  return (
    <div className="min-h-screen bg-background px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-card shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative isolate hidden overflow-hidden bg-navy px-10 py-10 text-white lg:flex lg:flex-col">
          <Link to="/" className="inline-flex items-center">
            <LogoFull className="h-20 w-auto md:h-24" />
          </Link>

          <div className="mt-16 max-w-lg">
            <h1 className="text-5xl font-black leading-[1.02] text-white md:text-6xl">
              Welcome to <span className="text-orange-glow">Cognify</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
              your smart workspace for learning, collaboration and academic excellence.
            </p>
          </div>

          <div className="relative mt-auto h-[320px]">
            <Rocket className="absolute right-[10%] top-2 h-20 w-20 text-orange-glow/90" delay={0.4} />
            <Star className="absolute left-[18%] top-10 h-5 w-5 text-orange-glow" delay={0.6} />
            <Star className="absolute right-[34%] top-24 h-4 w-4 text-gold" delay={1.1} />
            <Astronaut interactive className="absolute bottom-0 right-[4%] h-56 w-56 text-white md:h-64 md:w-64" />
          </div>
          <LoginWave className="opacity-90" />
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center bg-background px-6 py-10 md:px-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center">
                <LogoFull className="h-12 w-auto" />
              </Link>
            </div>

            <>
                <div className="text-center">
                  <h2 className="text-3xl font-black text-navy md:text-4xl">
                    {mode === "signin" ? "Sign in to your account" : "Create your account"}
                  </h2>
                  <p className="mt-3 text-sm text-navy/60">
                    {mode === "signin"
                      ? "Welcome back. Enter your details to continue."
                      : "Join Cognify and unlock your learning journey."}
                  </p>
                </div>

                <form onSubmit={submit} className="mt-8 space-y-4">
                  {mode === "signup" && (
                    <Field icon={<User className="h-4 w-4" />}>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-navy/40"
                      />
                    </Field>
                  )}

                  <Field icon={<Mail className="h-4 w-4" />}>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-navy/40"
                    />
                  </Field>

                  <Field icon={<Lock className="h-4 w-4" />}>
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-navy/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="text-navy/50 hover:text-navy"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </Field>

                  {mode === "signup" && (
                    <>
                      <Field icon={<Lock className="h-4 w-4" />}>
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className="w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-navy/40"
                        />
                      </Field>

                      <label className="flex items-start gap-2.5 text-xs text-navy/65">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-navy/30 text-orange accent-orange"
                        />
                        <span>
                          I agree to the{" "}
                          <Link to="/terms" className="font-bold text-orange hover:underline">Terms of Service</Link> and{" "}
                          <Link to="/privacy" className="font-bold text-orange hover:underline">Privacy Policy</Link>.
                        </span>
                      </label>
                    </>
                  )}

                  {mode === "signin" && (
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-navy/65">
                        <input type="checkbox" className="h-4 w-4 rounded border-navy/30 accent-orange" />
                        Remember me
                      </label>
                      <a className="font-bold text-orange hover:underline cursor-pointer">Forgot password?</a>
                    </div>
                  )}

                  {err && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{err}</p>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-[1.03]"
                  >
                    {mode === "signin" ? "Sign in" : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="relative my-2 flex items-center">
                    <div className="h-px flex-1 bg-navy/10" />
                    <span className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-navy/40">
                      or continue with
                    </span>
                    <div className="h-px flex-1 bg-navy/10" />
                  </div>

                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={googleLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-navy/15 bg-white px-5 py-3 text-sm font-bold text-navy transition hover:bg-navy/[0.03] disabled:opacity-60"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    {googleLoading ? "Connecting…" : "Continue with Google"}
                  </button>

                  <p className="pt-2 text-center text-sm text-navy/65">
                    {mode === "signin" ? (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("signup");
                            setErr("");
                          }}
                          className="font-bold text-orange hover:underline"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("signin");
                            setErr("");
                          }}
                          className="font-bold text-orange hover:underline"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>

                  <p className="pt-1 text-center text-xs text-navy/50">
                    <Link to="/terms" className="hover:text-orange hover:underline">Terms of Service</Link>
                    <span className="mx-2">·</span>
                    <Link to="/privacy" className="hover:text-orange hover:underline">Privacy Policy</Link>
                  </p>

                </form>
              </>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-navy/15 bg-white px-4 py-3.5 transition focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/15">
      <span className="text-navy/50">{icon}</span>
      {children}
    </div>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
    </svg>
  );
}
