"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_MS,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/admin-auth";
import {
  deleteLead as deleteLeadRow,
  listLeads,
  setLeadComment as setLeadCommentRow,
  setLeadProcessed as setLeadProcessedRow,
} from "@/lib/leads-admin";
import type { AdminLead } from "@/lib/leads-admin";
import { getServerEnv } from "@/lib/env";
import { createRateLimiter } from "@/lib/rate-limit";
import {
  commentSchema,
  leadIdSchema,
  loginSchema,
  processedSchema,
  statusFilterSchema,
} from "@/lib/schemas/admin";

/** Login attempts per IP: 5 per 10 minutes (the lead anti-spam window). */
const loginRateLimiter = createRateLimiter(5, 10 * 60 * 1000);

export type AdminLoginResult =
  | { status: "ok" }
  | { status: "invalid" }
  | { status: "rate-limited" };

export type AdminGuardResult = { status: "ok" } | { status: "unauthorized" };

/** Length-independent constant-time password comparison. */
function passwordsMatch(provided: string, expected: string): boolean {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

/**
 * Verifies the admin session cookie. Every admin data action must call this
 * before touching the database (Cache Components discipline: cookies live
 * here, never in pages).
 */
export async function verifyAdmin(): Promise<AdminGuardResult> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE)?.value;
  const { ADMIN_PASSWORD: password } = getServerEnv();
  return verifyAdminToken(password, raw) ? { status: "ok" } : { status: "unauthorized" };
}

/** Password check with IP rate limiting; sets the signed session cookie. */
export async function adminLogin(input: unknown): Promise<AdminLoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid" };
  }

  const headerStore = await headers();
  const ip =
    headerStore
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ?? "unknown";
  if (!loginRateLimiter.accept(`admin-login:${ip}`, Date.now())) {
    return { status: "rate-limited" };
  }

  const { ADMIN_PASSWORD: password } = getServerEnv();
  if (!passwordsMatch(parsed.data.password, password)) {
    return { status: "invalid" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, signAdminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
    path: "/",
  });
  return { status: "ok" };
}

/** Clears the admin session cookie. */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

// ---------------------------------------------------------------------------
// Lead data actions — every one of them starts with `verifyAdmin`.
// ---------------------------------------------------------------------------

export type LoadLeadsResult =
  | { status: "ok"; leads: AdminLead[] }
  | { status: "unauthorized" }
  | { status: "invalid" }
  | { status: "error" };

export type MutationResult =
  | { status: "ok"; found: boolean }
  | { status: "unauthorized" }
  | { status: "invalid" }
  | { status: "error" };

/** Loads leads for the given status filter; requires a valid session. */
export async function loadLeads(filter: unknown): Promise<LoadLeadsResult> {
  if ((await verifyAdmin()).status !== "ok") {
    return { status: "unauthorized" };
  }
  const parsed = statusFilterSchema.safeParse(filter);
  if (!parsed.success) {
    return { status: "invalid" };
  }
  try {
    return { status: "ok", leads: await listLeads(parsed.data) };
  } catch (error: unknown) {
    console.error("loadLeads failed:", error);
    return { status: "error" };
  }
}

/** Persists the processing-status toggle. */
export async function setLeadProcessed(id: unknown, processed: unknown): Promise<MutationResult> {
  if ((await verifyAdmin()).status !== "ok") {
    return { status: "unauthorized" };
  }
  const parsedId = leadIdSchema.safeParse(id);
  const parsedStatus = processedSchema.safeParse(processed);
  if (!parsedId.success || !parsedStatus.success) {
    return { status: "invalid" };
  }
  try {
    return {
      status: "ok",
      found: await setLeadProcessedRow(parsedId.data, parsedStatus.data),
    };
  } catch (error: unknown) {
    console.error("setLeadProcessed failed:", error);
    return { status: "error" };
  }
}

/** Permanently deletes a lead. */
export async function deleteLead(id: unknown): Promise<MutationResult> {
  if ((await verifyAdmin()).status !== "ok") {
    return { status: "unauthorized" };
  }
  const parsedId = leadIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "invalid" };
  }
  try {
    return { status: "ok", found: await deleteLeadRow(parsedId.data) };
  } catch (error: unknown) {
    console.error("deleteLead failed:", error);
    return { status: "error" };
  }
}

/** Saves the comment text, or clears it when passed null. */
export async function saveComment(id: unknown, comment: unknown): Promise<MutationResult> {
  if ((await verifyAdmin()).status !== "ok") {
    return { status: "unauthorized" };
  }
  const parsedId = leadIdSchema.safeParse(id);
  const parsedComment = commentSchema.safeParse(comment);
  if (!parsedId.success || !parsedComment.success) {
    return { status: "invalid" };
  }
  try {
    return {
      status: "ok",
      found: await setLeadCommentRow(parsedId.data, parsedComment.data),
    };
  } catch (error: unknown) {
    console.error("saveComment failed:", error);
    return { status: "error" };
  }
}
