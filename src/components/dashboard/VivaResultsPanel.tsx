import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/withTimeout";
import { VivaReportDashboard } from "@/components/viva-report/VivaReportDashboard";

const input =
  "h-11 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";

// Shows every student's viva report. The database only returns other students' rows to a real
// Supabase admin session (row level security), so this panel signs in like the PYQ upload panel.
export function VivaResultsPanel() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  // Reads the saved session locally (no network round trip) and gives up after 10s, so this can never sit on "Checking access".
  const checkAdmin = async () => {
    try {
      const { data } = await withTimeout(supabase.auth.getSession(), 10000, "timeout");
      const user = data.session?.user;
      if (!user) return setIsAdmin(false);
      const { data: row } = await withTimeout(
        supabase.from("user_roles").select("id").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
        10000,
        "timeout",
      );
      setIsAdmin(!!row);
      if (!row) setAuthMsg("This account is not an admin.");
    } catch {
      setIsAdmin(false);
      setAuthMsg("Couldn't reach the server. Check your connection and sign in again.");
    }
  };
  useEffect(() => {
    checkAdmin();
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) return setAuthMsg(err.message);
    checkAdmin();
  };

  if (isAdmin === null) return <p className="text-navy/60 dark:text-cream/60">Checking access…</p>;
  if (!isAdmin) {
    return (
      <form onSubmit={signIn} className="max-w-sm space-y-3">
        <p className="text-navy dark:text-cream">Sign in with your Supabase admin account to see viva results.</p>
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white dark:bg-cream dark:text-navy">Sign in</button>
        {authMsg && <p className="text-sm font-semibold text-rose-500">{authMsg}</p>}
      </form>
    );
  }

  return <VivaReportDashboard mode="admin" />;
}
