import { describe, expect, it } from "vitest";
import { DEDUP_WINDOW_MS, isDuplicateWindow } from "./dedup";

const NOW = new Date("2026-10-16T12:00:00.000Z");

describe("isDuplicateWindow", () => {
  it("treats a lead from 9 minutes ago as a duplicate", () => {
    const existing = new Date(NOW.getTime() - 9 * 60 * 1000);
    expect(isDuplicateWindow(existing, NOW)).toBe(true);
  });

  it("allows a new lead11 minutes after the previous one", () => {
    const existing = new Date(NOW.getTime() - 11 * 60 * 1000);
    expect(isDuplicateWindow(existing, NOW)).toBe(false);
  });

  it("keeps the boundary at exactly ten minutes outside the window", () => {
    const existing = new Date(NOW.getTime() - DEDUP_WINDOW_MS);
    expect(isDuplicateWindow(existing, NOW)).toBe(false);
  });

  it("accepts ISO strings from the database", () => {
    const existing = new Date(NOW.getTime() - 60 * 1000).toISOString();
    expect(isDuplicateWindow(existing, NOW)).toBe(true);
  });

  it("treats an unparseable timestamp as outside the window", () => {
    expect(isDuplicateWindow("not-a-date", NOW)).toBe(false);
  });
});
