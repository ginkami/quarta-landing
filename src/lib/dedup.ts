/** Leads for the same phone inside this window are treated as duplicates. */
export const DEDUP_WINDOW_MS = 10 * 60 * 1000;

/**
 * Returns true when the latest lead for a phone still falls inside the
 * 10-minute idempotency window (spec: no second lead within 10 minutes).
 * An unparseable timestamp is treated as "outside" so a data anomaly can
 * never silently block a real request.
 */
export function isDuplicateWindow(existingCreatedAt: Date | string, now: Date): boolean {
  const created = new Date(existingCreatedAt).getTime();
  if (Number.isNaN(created)) {
    return false;
  }
  return now.getTime() - created < DEDUP_WINDOW_MS;
}
