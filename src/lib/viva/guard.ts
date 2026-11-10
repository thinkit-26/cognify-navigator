import { redirect } from "@tanstack/react-router";
import { VIVA_TOKEN_KEY } from "@/lib/viva/api";
import { checkVivaAccess } from "@/lib/viva/gate.functions";

// beforeLoad for every Viva page after the gate. Browser-only: sessionStorage does not exist
// during SSR, and the backend rejects calls without a valid token anyway.
export async function requireVivaAccess() {
  if (typeof window === "undefined") return;
  const token = sessionStorage.getItem(VIVA_TOKEN_KEY);
  const valid = token ? (await checkVivaAccess({ data: { token } })).valid : false;
  if (!valid) throw redirect({ to: "/viva/gate" });
}
