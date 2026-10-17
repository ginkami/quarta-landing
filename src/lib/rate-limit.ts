/**
 * Best-effort, in-memory sliding-window rate limiter used by the lead
 * Server Action. Per-instance on serverless — paired with the honeypot
 * field it forms the anti-spam baseline (Turnstile only if spam persists).
 */

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export interface RateLimiter {
  /** Records an accepted submission; returns false while over the limit. */
  accept(key: string, now: number): boolean;
  reset(): void;
}

export function createRateLimiter(
  max: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): RateLimiter {
  const hits = new Map<string, number[]>();

  const isStale = (timestamp: number, now: number): boolean => now - timestamp >= windowMs;

  return {
    accept(key, now) {
      const fresh = (hits.get(key) ?? []).filter((timestamp) => !isStale(timestamp, now));

      // Opportunistic sweep so abandoned keys cannot grow without bound.
      if (hits.size > 1000) {
        for (const [existingKey, timestamps] of hits) {
          const kept = timestamps.filter((timestamp) => !isStale(timestamp, now));
          if (kept.length === 0) {
            hits.delete(existingKey);
          } else {
            hits.set(existingKey, kept);
          }
        }
      }

      if (fresh.length >= max) {
        hits.set(key, fresh);
        return false;
      }

      fresh.push(now);
      hits.set(key, fresh);
      return true;
    },
    reset() {
      hits.clear();
    },
  };
}

/** Shared limiter instance used by the Server Action. */
export const ipRateLimiter = createRateLimiter();
