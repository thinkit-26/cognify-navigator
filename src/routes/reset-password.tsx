import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Reset password, Cognify Institute" }] }),
});

function ResetPassword() {
  const navigate = useNavigate();
  // the recovery link signs the user in; the form only shows once that session exists
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => s && setReady(true));
    supabase.auth.getSession().then(({ data }) => data.session && setReady(true));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");
    setBusy(true);
    const { data, error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error || !data.user) return setMsg(error?.message ?? "Could not update the password.");
    const { data: admin } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    navigate({ to: admin ? "/admin" : "/dashboard" });
  };

  return (
    <div className="bg-background">
      <section className="px-6 pb-24 pt-36">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-extrabold text-navy dark:text-cream">Set a new password</h1>
          {ready ? (
            <form onSubmit={submit} className="mt-8 space-y-4 text-left">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream"
              />
              <button
                disabled={busy}
                className="h-12 w-full rounded-full bg-gradient-to-r from-[#E2740A] to-[#FBBF24] text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save password"}
              </button>
              {msg && <p className="text-sm font-semibold text-red-600">{msg}</p>}
            </form>
          ) : (
            <p className="mt-6 text-muted-foreground">
              Open this page from the reset link in your email. If the link has expired, request a new one from the sign-in page.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
