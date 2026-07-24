import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * One-off seed for the two demo accounts (Abhay student, Aseembaj admin).
 * Idempotent: re-running returns existing users instead of erroring.
 * POST /api/public/seed
 */
export const Route = createFileRoute("/api/public/seed")({
  server: {
    handlers: {
      GET: async () => handler(),
      POST: async () => handler(),
    },
  },
});

async function ensureUser(opts: {
  email: string;
  password: string;
  full_name: string;
  class_level?: string;
  school?: string;
  role: "admin" | "student";
}) {
  // Try create
  let userId: string | undefined;
  const created = await supabaseAdmin.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: {
      full_name: opts.full_name,
      class_level: opts.class_level ?? null,
      school: opts.school ?? null,
    },
  });

  if (created.data?.user) {
    userId = created.data.user.id;
  } else {
    // Likely already exists, look it up
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = list.data?.users?.find((u) => u.email?.toLowerCase() === opts.email.toLowerCase());
    if (!found) throw new Error(`Could not create or find user ${opts.email}: ${created.error?.message ?? "unknown"}`);
    userId = found.id;
    // Update password to keep it deterministic for the demo
    await supabaseAdmin.auth.admin.updateUserById(userId, { password: opts.password });
  }

  // Ensure profile fields (trigger may have set blanks if signup happened before)
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: opts.full_name,
    class_level: opts.class_level ?? null,
    school: opts.school ?? null,
  });

  // Ensure correct role(s)
  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: opts.role }, { onConflict: "user_id,role" });

  return { email: opts.email, id: userId, role: opts.role };
}

async function handler() {
  try {
    const student = await ensureUser({
      email: "abhay@cognify.test",
      password: "abhay7488",
      full_name: "Abhay Sharma",
      class_level: "Class 11, PCM",
      school: "Delhi Public School, RK Puram",
      role: "student",
    });

    const admin = await ensureUser({
      email: "aseembaj@cognify.test",
      password: "shesh7488",
      full_name: "Aseem Bajaj",
      school: "Cognify Institute",
      role: "admin",
    });

    return new Response(
      JSON.stringify({ ok: true, student, admin }, null, 2),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
