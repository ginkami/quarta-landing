/**
 * Self-made advertising attribution: a first-party cookie carries first-touch
 * and last-touch campaign data; the Server Action turns it (plus request
 * headers) into the JSONB `attribution` payload stored on a lead.
 * No third-party analytics services are involved (region constraint).
 */

export const ATTRIBUTION_COOKIE = "q_attr";
export const ATTRIBUTION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
  "gclid",
  "fbclid",
] as const;

export interface Touch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  yclid?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing?: string;
}

export interface AttributionCookie {
  v: 1;
  ts: number;
  first: Touch;
  last: Touch;
}

export interface LeadAttribution {
  first_touch: Touch;
  last_touch: Touch;
  submission_page?: string;
  user_agent?: string;
}

/** Extracts campaign data from a URL query and a document referrer. */
export function buildTouch(pageUrl: string, referrer: string | undefined): Touch {
  const url = new URL(pageUrl);
  const touch: Touch = {};

  for (const param of TRACKING_PARAMS) {
    const value = url.searchParams.get(param);
    if (value) {
      touch[param] = value;
    }
  }

  if (referrer) {
    touch.referrer = referrer;
  }
  touch.landing = url.href;

  return touch;
}

/** First touch is preserved; last touch refreshes on every visit. */
export function mergeAttribution(
  existing: AttributionCookie | undefined,
  current: Touch,
  now: number,
): AttributionCookie {
  if (!existing) {
    return { v: 1, ts: now, first: current, last: current };
  }
  return { ...existing, ts: now, last: current };
}

function isTouch(value: unknown): value is Touch {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.values(value).every(
    (item) => item === undefined || typeof item === "string",
  );
}

/** Parses the raw cookie defensively: malformed payloads are ignored. */
export function parseAttributionCookie(raw: string | undefined): AttributionCookie | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "first" in parsed &&
      "last" in parsed &&
      isTouch(parsed.first) &&
      isTouch(parsed.last)
    ) {
      const candidate = parsed as { v?: unknown; ts?: unknown; first: Touch; last: Touch };
      return {
        v: 1,
        ts: typeof candidate.ts === "number" ? candidate.ts : 0,
        first: candidate.first,
        last: candidate.last,
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function serializeAttributionCookie(value: AttributionCookie): string {
  return JSON.stringify(value);
}

/** Builds the JSONB attribution payload stored on a lead. */
export function buildLeadAttribution(
  cookie: AttributionCookie | undefined,
  context: { submissionPage?: string; userAgent?: string },
): LeadAttribution {
  return {
    first_touch: cookie?.first ?? {},
    last_touch: cookie?.last ?? {},
    ...(context.submissionPage ? { submission_page: context.submissionPage } : {}),
    ...(context.userAgent ? { user_agent: context.userAgent } : {}),
  };
}
