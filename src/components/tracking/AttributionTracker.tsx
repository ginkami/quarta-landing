"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
  buildTouch,
  mergeAttribution,
  parseAttributionCookie,
  serializeAttributionCookie,
} from "@/lib/attribution";

function readCookie(name: string): string | undefined {
  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  if (!entry) {
    return undefined;
  }
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return undefined;
  }
}

/**
 * Writes the first/last-touch attribution cookie (30 days) on every page
 * view. Purely client-side so the Cache Components static shell is not
 * affected; the Server Action reads the cookie on submission.
 */
export function AttributionTracker() {
  useEffect(() => {
    const existing = parseAttributionCookie(readCookie(ATTRIBUTION_COOKIE));
    const touch = buildTouch(window.location.href, document.referrer || undefined);
    const merged = mergeAttribution(existing, touch, Date.now());
    const value = encodeURIComponent(serializeAttributionCookie(merged));

    document.cookie = [
      `${ATTRIBUTION_COOKIE}=${value}`,
      `max-age=${ATTRIBUTION_MAX_AGE_SECONDS}`,
      "path=/",
      "SameSite=Lax",
    ].join("; ");
  }, []);

  return null;
}
