import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-only access for the AI Oral Viva flow.
 *
 * A student signs in with Supabase (email and password). This server function checks that
 * Supabase session and then issues the short-lived Viva token the FastAPI backend expects.
 *
 * The token is stateless: "<expiryMs>.<HMAC-SHA256(expiryMs)>", signed with VIVA_TOKEN_SECRET.
 * Any Worker, and the FastAPI backend (same secret), can verify it without shared storage.
 * Keep this format in sync with Oral_bot/backend/core/auth.py.
 */

// Read per request: on Cloudflare Workers process.env is empty at module load.
const tokenSecret = () => process.env.VIVA_TOKEN_SECRET ?? "";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours, fixed (no sliding extension)

const sign = (expiry: string, secret: string) =>
  createHmac("sha256", secret).update(expiry).digest("hex");

function issueToken(): string {
  const secret = tokenSecret();
  if (!secret) throw new Error("Viva token secret is not configured on the server");
  const expiry = String(Date.now() + TOKEN_TTL_MS);
  return `${expiry}.${sign(expiry, secret)}`;
}

function isValidToken(token: string): boolean {
  const secret = tokenSecret();
  if (!secret) return false;
  const [expiry, signature, ...rest] = token.split(".");
  if (!expiry || !signature || rest.length > 0 || !/^\d+$/.test(expiry)) return false;
  if (Number(expiry) <= Date.now()) return false;
  const expected = Buffer.from(sign(expiry, secret));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Only a signed-in student can get a token (requireSupabaseAuth rejects anyone else).
export const issueVivaToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({ token: issueToken(), expiresInSeconds: TOKEN_TTL_MS / 1000 }));

const CheckTokenSchema = z.object({
  token: z.string().max(256),
});

export const checkVivaAccess = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CheckTokenSchema.parse(data))
  .handler(async ({ data }) => ({ valid: isValidToken(data.token) }));
