import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Mic2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureVivaToken } from "@/lib/viva/guard";

export const Route = createFileRoute("/viva/gate")({
  head: () => ({ meta: [{ title: "Sign in, AI Oral Viva" }] }),
  component: VivaLogin,
});

type Mode = "signin" | "signup";

const field =
  "flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 focus-within:border-orange-400";

function VivaLogin() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6 pt-32 md:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-md w-full"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6">
            <Mic2 size={32} />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">AI Oral Viva</h2>
          <p className="text-center text-gray-500 mb-6">
            {mode === "signin"
              ? "Sign in to start your viva. Your answers are saved to your account."
              : "Create your student account. Your answers are saved to it."}
          </p>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm font-semibold" role="tablist">
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
                className={`rounded-lg py-2 transition ${mode === m ? "bg-white text-gray-900 shadow" : "text-gray-500"}`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className={field}>
                <User className="text-orange-500 shrink-0" size={20} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Full name"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                />
              </label>
            )}
            <label className={field}>
              <Mail className="text-orange-500 shrink-0" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Email"
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
              />
            </label>
            <label className={field}>
              <Lock className="text-orange-500 shrink-0" size={20} />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="Password"
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {info && <p className="text-green-600 text-sm text-center">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:pointer-events-none"
            >
              {busy ? "Please wait..." : mode === "signin" ? "Sign in and start" : "Create account and start"}
              <ArrowRight size={20} />
            </button>
          </form>

          {mode === "signin" && (
            <p className="mt-6 text-center text-sm text-gray-500">
              <button type="button" onClick={forgotPassword} className="text-orange-500 font-medium hover:underline">
                Forgot your password?
              </button>
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
