import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getCheatRole, clearCheatRole } from "@/lib/cheat";

type Role = "admin" | "student";

type Profile = {
  id: string;
  full_name: string;
  class_level: string | null;
  school: string | null;
  photo_url: string | null;
  streak_days: number;
  target_score: number;
  subjects: string[];
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: Role[];
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFor = async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [{ data: prof }, { data: rs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as Profile) ?? null);
    setRoles(((rs ?? []) as { role: Role }[]).map((r) => r.role));
  };

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // Defer DB calls to avoid deadlock inside the callback
      setTimeout(() => {
        void loadFor(s?.user?.id);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadFor(data.session?.user?.id).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    await loadFor(session?.user?.id);
  };

  const signOut = async () => {
    clearCheatRole();
    await supabase.auth.signOut();
  };

  const cheat = getCheatRole();
  const cheatProfile: Profile | null = cheat
    ? {
        id: "cheat-" + cheat,
        full_name: cheat === "admin" ? "Aseem Bajaj" : "Abhay Sharma",
        class_level: cheat === "admin" ? "Administrator" : "Class 11, PCM",
        school: "Cognify Institute",
        photo_url: null,
        streak_days: 12,
        target_score: 95,
        subjects: ["Maths", "Physics", "Chemistry"],
      }
    : profile;
  const cheatRoles: Role[] = cheat ? [cheat] : roles;

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile: cheatProfile,
    roles: cheatRoles,
    isAdmin: cheatRoles.includes("admin"),
    isStudent: cheatRoles.includes("student"),
    loading: cheat ? false : loading,
    refresh,
    signOut,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
