import { describe, expect, it } from "vitest";
import { ADMIN_SESSION_TTL_MS, signAdminToken, verifyAdminToken } from "./admin-auth";

const PASSWORD = "quarta-roast-dev-2026";
const NOW = 1_700_000_000_000;

describe("admin session tokens", () => {
  it("accepts a freshly signed token", () => {
    const token = signAdminToken(PASSWORD, NOW);
    expect(verifyAdminToken(PASSWORD, token, NOW + 1000)).toBe(true);
  });

  it("rejects an expired token", () => {
    const token = signAdminToken(PASSWORD, NOW);
    expect(verifyAdminToken(PASSWORD, token, NOW + ADMIN_SESSION_TTL_MS + 1)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = signAdminToken(PASSWORD, NOW);
    const last = token.endsWith("0") ? "1" : "0";
    const tampered = `${token.slice(0, -1)}${last}`;
    expect(verifyAdminToken(PASSWORD, tampered, NOW)).toBe(false);
  });

  it("rejects an extended expiry that was not signed", () => {
    const token = signAdminToken(PASSWORD, NOW);
    const signature = token.slice(token.indexOf(".") + 1);
    const forged = `${NOW + ADMIN_SESSION_TTL_MS * 2}.${signature}`;
    expect(verifyAdminToken(PASSWORD, forged, NOW)).toBe(false);
  });

  it("rejects a token signed with another password", () => {
    const token = signAdminToken("some-other-password", NOW);
    expect(verifyAdminToken(PASSWORD, token, NOW)).toBe(false);
  });

  it("rejects empty or malformed input", () => {
    expect(verifyAdminToken(PASSWORD, undefined, NOW)).toBe(false);
    expect(verifyAdminToken(PASSWORD, "", NOW)).toBe(false);
    expect(verifyAdminToken(PASSWORD, "garbage", NOW)).toBe(false);
    expect(verifyAdminToken(PASSWORD, ".abc", NOW)).toBe(false);
    expect(verifyAdminToken(PASSWORD, "notanumber.abc", NOW)).toBe(false);
  });
});
