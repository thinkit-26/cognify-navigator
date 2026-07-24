// Dev cheat-code login. Typed digits "7488" -> student, "2368" -> admin.
// Bypasses Supabase auth so the dashboards are reachable without credentials.
export type CheatRole = "student" | "admin";
const KEY = "cognify_cheat_role";

export function getCheatRole(): CheatRole | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "student" || v === "admin" ? v : null;
  } catch {
    return null;
  }
}

export function setCheatRole(role: CheatRole) {
  try {
    window.localStorage.setItem(KEY, role);
  } catch {
    // ignore
  }
}

export function clearCheatRole() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
