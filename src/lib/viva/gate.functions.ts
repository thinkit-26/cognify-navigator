import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * Server-only verification gate for the AI Oral Viva flow.
 *
 * The access code is read from the server environment (VIVA_ACCESS_CODE) and
 * NEVER shipped to the client, so it is invisible in DevTools. Failed attempts
 * are rate-limited per client IP to prevent brute forcing.
 */

const ACCESS_CODE = process.env.VIVA_ACCESS_CODE ?? "";
const GATE_ENABLED = ACCESS_CODE.length > 0;

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

type AttemptRecord = { count: number; lockedUntil: number };
const attemptMap = new Map<string, AttemptRecord>();

// session token -> expiry timestamp
const tokenStore = new Map<string, number>();

function clientKey(): string {
  const request = getRequest();
  const fwd = request?.headers?.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return request?.headers?.get("cf-connecting-ip") ?? request?.headers?.get("x-real-ip") ?? "unknown";
}

function sweep() {
  const now = Date.now();
  for (const [token, expiry] of tokenStore) {
    if (expiry <= now) tokenStore.delete(token);
  }
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
    if (!GATE_ENABLED) {
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

    sweep();
    const token = randomBytes(32).toString("hex");
    tokenStore.set(token, Date.now() + TOKEN_TTL_MS);

    return { token, expiresInSeconds: TOKEN_TTL_MS / 1000 };
  });

const CheckTokenSchema = z.object({
  token: z.string().max(256),
});

export const checkVivaAccess = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CheckTokenSchema.parse(data))
  .handler(async ({ data }) => {
    sweep();
    const expiry = tokenStore.get(data.token);
    if (!expiry || expiry <= Date.now()) {
      return { valid: false };
    }
    // Slide the expiry on each successful check.
    tokenStore.set(data.token, Date.now() + TOKEN_TTL_MS);
    return { valid: true };
  });
