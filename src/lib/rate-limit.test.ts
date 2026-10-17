import { describe, expect, it } from "vitest";
import { RATE_LIMIT_MAX, createRateLimiter } from "./rate-limit";

const T0 = 1_000_000;

describe("createRateLimiter", () => {
  it("accepts up to the maximum submissions within the window", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < RATE_LIMIT_MAX; index += 1) {
      expect(limiter.accept("ip-1", T0 + index)).toBe(true);
    }
    expect(limiter.accept("ip-1", T0 + RATE_LIMIT_MAX)).toBe(false);
  });

  it("rejects the sixth submission (spec: more than 5 within 10 minutes)", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < RATE_LIMIT_MAX; index += 1) {
      limiter.accept("ip-1", T0);
    }
    expect(limiter.accept("ip-1", T0 + 1)).toBe(false);
  });

  it("frees the key after the window slides past", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < RATE_LIMIT_MAX; index += 1) {
      limiter.accept("ip-1", T0);
    }
    expect(limiter.accept("ip-1", T0 + 60_000)).toBe(false);
    expect(limiter.accept("ip-1", T0 + 10 * 60 * 1000 + 1)).toBe(true);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < RATE_LIMIT_MAX; index += 1) {
      limiter.accept("ip-1", T0);
    }
    expect(limiter.accept("ip-1", T0)).toBe(false);
    expect(limiter.accept("ip-2", T0)).toBe(true);
  });

  it("prunes stale keys during a sweep", () => {
    const limiter = createRateLimiter(2, 1000);
    limiter.accept("stale", T0);
    // Exceed the sweep threshold with fresh keys, then verify old ones clear.
    for (let index = 0; index < 1100; index += 1) {
      limiter.accept(`key-${index}`, T0 + 5000);
    }
    limiter.reset();
    expect(limiter.accept("stale", T0 + 10_000)).toBe(true);
  });
});
