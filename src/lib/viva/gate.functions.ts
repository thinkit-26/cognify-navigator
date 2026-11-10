import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * Server-only verification gate for the AI Oral Viva flow.
 *
 * The access code is read from the server environment (VIVA_ACCESS_CODE) and
 * NEVER shipped to the client, so it is invisible in DevTools. Failed attempts
 * are rate-limited per client IP to prevent brute forcing.
 *
 * The session token is stateless: "<expiryMs>.<HMAC-SHA256(expiryMs)>", signed with
 * VIVA_TOKEN_SECRET. Any Worker, and the FastAPI backend (same secret), can verify it
 * without shared storage. Keep this format in sync with Oral_bot/backend/core/auth.py.
 */

// Read per request: on Cloudflare Workers process.env is empty at module load.
const accessCode = () => process.env.VIVA_ACCESS_CODE ?? "";
const tokenSecret = () => process.env.VIVA_TOKEN_SECRET ?? "";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours, fixed (no sliding extension)

type AttemptRecord = { count: number; lockedUntil: number };
// shortcut: per-Worker memory, so the lockout is per instance, upgrade to a Cloudflare rate-limit rule.
const attemptMap = new Map<string, AttemptRecord>();

function clientKey(): string {
  // x-forwarded-for is client-controlled, so only trust the headers Cloudflare sets.
  const request = getRequest();
  return (
    request?.headers?.get("cf-connecting-ip") ?? request?.headers?.get("x-real-ip") ?? "unknown"
  );
}

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

function isLocked(key: string): { locked: boolean; retryInMs: number } {
  const rec = attemptMap.get(key);
  if (!rec) return { locked: false, retryInMs: 0 };
  const remaining = rec.lockedUntil - Date.now();
  if (remaining > 0) return { locked: true, retryInMs: remaining };
  attemptMap.delete(key);
  return { locked: false, retryInMs: 0 };
}

function recordFailure(key: string) {
  const rec = attemptMap.get(key) ?? { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS;
    rec.count = 0;
  }
  attemptMap.set(key, rec);
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

const VerifyCodeSchema = z.object({
  code: z.string().max(200),
});

export const verifyVivaCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => VerifyCodeSchema.parse(data))
  .handler(async ({ data }) => {
    const ACCESS_CODE = accessCode();
    if (ACCESS_CODE.length === 0) {
      throw new Error("Viva access code is not configured on the server");
    }

    const key = clientKey();
    const { locked, retryInMs } = isLocked(key);
    if (locked) {
      throw new Error(`Too many attempts. Try again in ${Math.ceil(retryInMs / 1000)} seconds.`);
    }

    if (!safeEqual(data.code.trim(), ACCESS_CODE)) {
      recordFailure(key);
      throw new Error("That code is incorrect. Please try again.");
    }

    return { token: issueToken(), expiresInSeconds: TOKEN_TTL_MS / 1000 };
  });

const CheckTokenSchema = z.object({
  token: z.string().max(256),
});

export const checkVivaAccess = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CheckTokenSchema.parse(data))
  .handler(async ({ data }) => ({ valid: isValidToken(data.token) }));
