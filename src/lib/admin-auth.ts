/**
 * Admin session primitives: an expiring `<expires>.<HMAC>` cookie value signed
 * with a key derived from ADMIN_PASSWORD. Nothing is stored server-side;
 * changing the password revokes every outstanding session.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "q_admin";
export const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function deriveKey(password: string): Buffer {
  return createHmac("sha256", "quarta-admin-session").update(password).digest();
}

function signExpiry(password: string, expires: number): string {
  return createHmac("sha256", deriveKey(password))
    .update(String(expires))
    .digest("hex");
}

/** Signs a session token that expires at `now + ADMIN_SESSION_TTL_MS`. */
export function signAdminToken(password: string, now: number = Date.now()): string {
  const expires = now + ADMIN_SESSION_TTL_MS;
  return `${expires}.${signExpiry(password, expires)}`;
}

/**
 * Verifies signature and expiry in constant time. Malformed, expired or
 * tampered tokens return false; a wrong password invalidates the token too.
 */
export function verifyAdminToken(
  password: string,
  raw: string | undefined,
  now: number = Date.now(),
): boolean {
  if (!raw) {
    return false;
  }
  const separator = raw.indexOf(".");
  if (separator <= 0) {
    return false;
  }
  const expiresPart = raw.slice(0, separator);
  const signaturePart = raw.slice(separator + 1);
  if (!/^\d+$/.test(expiresPart)) {
    return false;
  }
  const expires = Number(expiresPart);
  if (!Number.isSafeInteger(expires) || expires <= now) {
    return false;
  }
  const expected = Buffer.from(signExpiry(password, expires), "hex");
  const provided = Buffer.from(signaturePart, "hex");
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(provided, expected);
}
