"use server";

import { cookies, headers } from "next/headers";
import {
  ATTRIBUTION_COOKIE,
  buildLeadAttribution,
  parseAttributionCookie,
} from "@/lib/attribution";
import { isDuplicateWindow } from "@/lib/dedup";
import { getPool } from "@/lib/db";
import { ipRateLimiter } from "@/lib/rate-limit";
import { leadSchema, type LeadFormValues } from "@/lib/schemas/lead";

export interface LeadPayload extends LeadFormValues {
  /** Honeypot value — a filled honeypot is silently discarded. */
  website: string;
}

export type SubmitLeadResult =
  | { status: "ok"; duplicate: boolean }
  | { status: "invalid"; fieldErrors: Record<string, string> }
  | { status: "error"; message: string; rateLimited: boolean };

const FAILURE_MESSAGE = "Не удалось сохранить заявку. Попробуйте отправить ещё раз.";
const RATE_LIMIT_MESSAGE =
  "Слишком много заявок с вашего адреса. Попробуйте позже — данные формы сохранены.";

function parseCookieValue(raw: string | undefined): ReturnType<typeof parseAttributionCookie> {
  if (!raw) {
    return undefined;
  }
  const direct = parseAttributionCookie(raw);
  if (direct) {
    return direct;
  }
  try {
    return parseAttributionCookie(decodeURIComponent(raw));
  } catch {
    return undefined;
  }
}

/**
 * The single lead submission interface (`submitLead`): honeypot →
 * validation → per-IP rate limit → transactional dedup → insert.
 */
export async function submitLead(payload: LeadPayload): Promise<SubmitLeadResult> {
  if (payload.website.trim() !== "") {
    return { status: "ok", duplicate: false };
  }

  const parsed = leadSchema.safeParse({
    name: payload.name,
    phone: payload.phone,
    interest: payload.interest,
    comment: payload.comment,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!(key in fieldErrors)) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "invalid", fieldErrors };
  }
  const input = parsed.data;

  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  if (!ipRateLimiter.accept(ip, Date.now())) {
    return { status: "error", message: RATE_LIMIT_MESSAGE, rateLimited: true };
  }

  const cookieStore = await cookies();
  const attribution = buildLeadAttribution(
    parseCookieValue(cookieStore.get(ATTRIBUTION_COOKIE)?.value),
    {
      submissionPage: headerStore.get("referer") ?? undefined,
      userAgent: headerStore.get("user-agent") ?? undefined,
    },
  );

  const pool = getPool();
  const client = await pool.connect();
  let inTransaction = false;
  try {
    await client.query("BEGIN");
    inTransaction = true;
    // Transaction-scoped advisory lock serializes duplicate checks per phone.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [input.phone]);
    const latest = await client.query<{ created_at: Date }>(
      "SELECT created_at FROM leads WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
      [input.phone],
    );
    const existing = latest.rows[0];
    if (existing && isDuplicateWindow(existing.created_at, new Date())) {
      await client.query("COMMIT");
      inTransaction = false;
      return { status: "ok", duplicate: true };
    }

    await client.query(
      "INSERT INTO leads (name, phone, interest, comment, attribution) VALUES ($1, $2, $3, $4, $5)",
      [input.name, input.phone, input.interest, input.comment ?? null, attribution],
    );
    await client.query("COMMIT");
    inTransaction = false;
    return { status: "ok", duplicate: false };
  } catch (error: unknown) {
    if (inTransaction) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // The connection may already be broken; surfaced below.
      }
    }
    console.error("submitLead persistence failed:", error);
    return { status: "error", message: FAILURE_MESSAGE, rateLimited: false };
  } finally {
    client.release();
  }
}
