import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/withTimeout";

const field =
  "h-12 w-full rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy focus:border-navy focus:outline-none dark:bg-white/5 dark:text-cream";

// Admin tools write through Supabase row level security, so they need a real Supabase admin session
// (not the cheat-code login). Shows a sign-in form until there is one, then renders the children.
// The check reads the saved session locally and gives up after 10s, so it can never sit on "Checking access".
export function AdminGate({ reason, children }: { reason: string; children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setAuthMsg(error.message);
    checkAdmin();
  };

  if (isAdmin === null) return <p className="text-navy/60 dark:text-cream/60">Checking access…</p>;
  if (!isAdmin) {
    return (
      <form onSubmit={signIn} className="max-w-sm space-y-3">
        <p className="text-navy dark:text-cream">Sign in with your Supabase admin account to {reason}.</p>
        <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white dark:bg-cream dark:text-navy">Sign in</button>
        {authMsg && <p className="text-sm font-semibold text-rose-500">{authMsg}</p>}
      </form>
    );
  }
  return <>{children}</>;
}
