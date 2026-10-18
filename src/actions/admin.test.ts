import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import * as leadsAdmin from "@/lib/leads-admin";
import { adminLogin, adminLogout, deleteLead, loadLeads, saveComment, setLeadProcessed, verifyAdmin } from "./admin";

const PASSWORD = "quarta-roast-dev-2026";
const cookieJar = new Map<string, string>();
const requestState = { ip: "10.0.0.1" };

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string) => {
      cookieJar.set(name, value);
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  }),
  headers: async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? requestState.ip : null),
  }),
}));

vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({ DATABASE_URL: "postgresql://test", ADMIN_PASSWORD: PASSWORD }),
}));

vi.mock("@/lib/leads-admin", () => ({
  listLeads: vi.fn(),
  setLeadProcessed: vi.fn(),
  deleteLead: vi.fn(),
  setLeadComment: vi.fn(),
}));

let ipCounter = 0;

beforeEach(() => {
  cookieJar.clear();
  // Rotate the IP so the in-memory login rate limiter never bleeds across tests.
  ipCounter += 1;
  requestState.ip = `198.51.100.${ipCounter}`;
  vi.clearAllMocks();
});

describe("adminLogin", () => {
  it("rejects a wrong password without issuing a cookie", async () => {
    const result = await adminLogin({ password: "not-the-password" });
    expect(result).toEqual({ status: "invalid" });
    expect(cookieJar.has(ADMIN_COOKIE)).toBe(false);
  });

  it("rejects an empty password", async () => {
    expect(await adminLogin({ password: "" })).toEqual({ status: "invalid" });
  });

  it("accepts the correct password and sets a verifiable cookie", async () => {
    const result = await adminLogin({ password: PASSWORD });
    expect(result).toEqual({ status: "ok" });
    const cookie = cookieJar.get(ADMIN_COOKIE);
    expect(cookie).toBeDefined();
    expect(verifyAdminToken(PASSWORD, cookie)).toBe(true);
  });

  it("rate-limits the 6th attempt from the same IP within the window", async () => {
    requestState.ip = "10.0.0.42";
    const attempts = [];
    for (let index = 0; index < 6; index += 1) {
      attempts.push(await adminLogin({ password: `attempt-${index}` }));
    }
    expect(attempts.slice(0, 5).every((attempt) => attempt.status === "invalid")).toBe(true);
    expect(attempts[5]).toEqual({ status: "rate-limited" });
  });
});

describe("verifyAdmin and adminLogout", () => {
  it("reports unauthorized without a cookie", async () => {
    expect(await verifyAdmin()).toEqual({ status: "unauthorized" });
  });

  it("reports ok with a valid session cookie", async () => {
    expect(await adminLogin({ password: PASSWORD })).toEqual({ status: "ok" });
    expect(await verifyAdmin()).toEqual({ status: "ok" });
  });

  it("clears the cookie on logout", async () => {
    await adminLogin({ password: PASSWORD });
    await adminLogout();
    expect(cookieJar.has(ADMIN_COOKIE)).toBe(false);
    expect(await verifyAdmin()).toEqual({ status: "unauthorized" });
  });
});

describe("lead data actions", () => {
  const UUID = "3f6a2f6e-1f2b-4c9d-8a1b-9d8c7e6f5a4b";
  const lead = {
    id: UUID,
    createdAt: "2026-10-18T10:00:00.000Z",
    name: "Тест",
    phone: "+375290000000",
    interest: "подписка",
    comment: null,
    processed: false,
    attribution: {},
  };

  it("loadLeads rejects without a session and never touches the database", async () => {
    expect(await loadLeads("all")).toEqual({ status: "unauthorized" });
    expect(leadsAdmin.listLeads).not.toHaveBeenCalled();
  });

  it("loadLeads validates the filter before querying", async () => {
    await adminLogin({ password: PASSWORD });
    expect(await loadLeads("bogus")).toEqual({ status: "invalid" });
    expect(leadsAdmin.listLeads).not.toHaveBeenCalled();
  });

  it("loadLeads returns leads for a valid session", async () => {
    vi.mocked(leadsAdmin.listLeads).mockResolvedValue([lead]);
    await adminLogin({ password: PASSWORD });
    expect(await loadLeads("all")).toEqual({ status: "ok", leads: [lead] });
    expect(leadsAdmin.listLeads).toHaveBeenCalledWith("all");
  });

  it("setLeadProcessed requires a session, a uuid and a boolean", async () => {
    expect(await setLeadProcessed(UUID, true)).toEqual({ status: "unauthorized" });

    await adminLogin({ password: PASSWORD });
    expect(await setLeadProcessed("nope", true)).toEqual({ status: "invalid" });
    expect(await setLeadProcessed(UUID, "yes")).toEqual({ status: "invalid" });
    expect(leadsAdmin.setLeadProcessed).not.toHaveBeenCalled();

    vi.mocked(leadsAdmin.setLeadProcessed).mockResolvedValue(true);
    expect(await setLeadProcessed(UUID, true)).toEqual({ status: "ok", found: true });
    expect(leadsAdmin.setLeadProcessed).toHaveBeenCalledWith(UUID, true);
  });

  it("deleteLead runs only with a session and a valid uuid", async () => {
    expect(await deleteLead(UUID)).toEqual({ status: "unauthorized" });

    await adminLogin({ password: PASSWORD });
    vi.mocked(leadsAdmin.deleteLead).mockResolvedValue(true);
    expect(await deleteLead(UUID)).toEqual({ status: "ok", found: true });

    vi.mocked(leadsAdmin.deleteLead).mockResolvedValue(false);
    expect(await deleteLead(UUID)).toEqual({ status: "ok", found: false });
  });

  it("saveComment stores text or clears it with null", async () => {
    await adminLogin({ password: PASSWORD });
    expect(await saveComment(UUID, "x".repeat(2001))).toEqual({ status: "invalid" });
    expect(leadsAdmin.setLeadComment).not.toHaveBeenCalled();

    vi.mocked(leadsAdmin.setLeadComment).mockResolvedValue(true);
    expect(await saveComment(UUID, "свежий контакт")).toEqual({ status: "ok", found: true });
    expect(leadsAdmin.setLeadComment).toHaveBeenCalledWith(UUID, "свежий контакт");

    expect(await saveComment(UUID, null)).toEqual({ status: "ok", found: true });
    expect(leadsAdmin.setLeadComment).toHaveBeenLastCalledWith(UUID, null);
  });
});
