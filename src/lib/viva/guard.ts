import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { VIVA_TOKEN_KEY } from "@/lib/viva/api";
import { checkVivaAccess, issueVivaToken } from "@/lib/viva/gate.functions";

// Make sure a valid Viva token is in sessionStorage for the signed-in student, issuing a fresh one
// when it is missing or expired. Only works with a Supabase session (the server function checks it).
export async function ensureVivaToken() {
  const token = sessionStorage.getItem(VIVA_TOKEN_KEY);
  if (token && (await checkVivaAccess({ data: { token } })).valid) return;
  const { token: fresh } = await issueVivaToken();
  sessionStorage.setItem(VIVA_TOKEN_KEY, fresh);
}

// beforeLoad for every Viva page after the login. Browser-only: the Supabase session and
// sessionStorage do not exist during SSR, and the backend rejects calls without a valid token anyway.
export async function requireVivaAccess() {
  if (typeof window === "undefined") return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw redirect({ to: "/viva/gate" });
  try {
    await ensureVivaToken();
  } catch {
    throw redirect({ to: "/viva/gate" });
  }
}
