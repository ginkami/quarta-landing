# Design

## Context
See proposal.md — Why. The state that shapes the approach:
- Next.js 16 with `cacheComponents: true`: dynamic APIs (`cookies()`, `headers()`) are only allowed inside Server Actions; pages stay static/prerendered — a project-wide discipline (`.clinerules/project.md`).
- Lead persistence exists (Neon Postgres, `leads` table with `comment` and `attribution` JSONB); there is no workflow column yet.
- Server Action precedent: `src/actions/lead.ts` — zod re-validation, IP rate limit, typed result unions.
- UI stack: Tailwind CSS v4 + daisyUI 5 theme `quarta` (shadcn was removed in the daisyUI migration).
- Attribution payload shape is fixed by `src/lib/attribution.ts` (`LeadAttribution`: first/last touch, submission page, user agent).

## Goals / Non-Goals
**Goals:**
- A single-roaster, password-gated panel with a minimal dependency footprint.
- Every mutation authenticated, zod-validated, and answered with typed result unions.
- Fresh list data on page load and manual refresh, with no stale caches.

**Non-Goals:**
- Multi-user accounts, roles, password recovery, audit log.
- Notifications (email/Telegram), lead export, pagination or virtualization (lead volume is small by design).
- Editing of name, phone or interest; editing of attribution data.

## Decisions
1. **Signed expiring cookie, no session table.** Cookie value is `<expires>.<HMAC-SHA256(expires, key derived from ADMIN_PASSWORD)>`, verified with `crypto.timingSafeEqual`. Nothing to store or clean up, expiry is intrinsic, and changing the password revokes every session. Alternatives rejected: session table in Neon (schema + cleanup for one user); static no-expiry token (no revocation window); HTTP Basic via middleware (poor UX, no sensible rate-limit placement); Next.js Auth libraries (heavy for a single password).
2. **Login rate limiting reuses `createRateLimiter(5, 10 min)`** keyed by IP from `headers()` inside the action — the same primitive as lead anti-spam; per-instance memory is an accepted trade-off for this project.
3. **All dynamic access lives in `src/actions/admin.ts`.** `/admin` and `/admin/login` are static shells; the client `AdminPanel` calls `loadLeads(filter)` on mount and on «Обновить», and an `UNAUTHORIZED` outcome triggers `redirect('/admin/login')`. Both refresh paths are therefore identical. Alternative rejected: reading `cookies()` in a page/layout — violates the Cache Components discipline.
4. **Status is `processed boolean` (migration 0002).** The UI is a two-state toggle; queries stay trivial (`WHERE processed = $1`, `ORDER BY processed, created_at DESC` — unprocessed first, newest first within each group). A text enum is reserved for a future multi-state workflow and would migrate additively.
5. **zod schemas in `src/lib/schemas/admin.ts`** mirror the lead-form pattern: uuid lead id, comment (string ≤ 2000 chars, nullable), filter enum, password. The server re-validates everything.
6. **UI: adaptive lead cards + native `<dialog>` modals.** Cards beat a table between 320–768 px; `<dialog>` + daisyUI gives focus management and ESC for free. The status toggle updates optimistically and reverts on failure; lead deletion and comment clearing are separate dialogs — the comment modal's «Удалить комментарий» only clears the field.
7. **Attribution rendering is a pure formatter** (`summarizeTouch`): chips in order utm_source → medium → campaign → content/term → click id → referrer hostname → landing, «нет данных» for empty touches; the full pretty-printed JSON sits in an expandable view. Unit-testable without DOM, full fidelity kept.
8. **`ADMIN_PASSWORD` joins the lazy `getServerEnv()` schema** (min 8 chars). Validation stays off build time; the deployment step must set the variable before any runtime path calls `getServerEnv()`.

## Risks / Trade-offs
- [Single env password is a single point of failure] → minimum length, IP rate limit, signed expiring cookie, HTTPS-only cookie attribute; rotation = change the variable.
- [In-memory rate limiter resets per serverless instance] → acceptable for a single-roaster panel (same known trade-off as lead anti-spam); escalation path is Turnstile if abuse appears.
- [Optimistic toggle can desync on a flaky network] → revert with a visible error; «Обновить» re-syncs the whole list.
- [Hard delete is irreversible] → mandatory confirmation dialog; Neon point-in-time recovery remains the backstop, soft-delete is out of scope.
- [Admin routes are guessable by URL] → robots `disallow` + `noindex`, and every data action enforces the cookie server-side, so no lead data leaks without a valid session.

## Migration Plan
1. Set `ADMIN_PASSWORD` in `.env.local` (development) and Vercel environment (Production/Preview) — required before deploy, since env validation runs on the first `getServerEnv()` call at runtime.
2. Run `npm run db:migrate` against the target Neon branch; `0002_add_lead_status.sql` is idempotent and defaults existing rows to unprocessed.
3. Deploy and smoke-test the panel: login, toggle, filter, comment, delete against production data.
4. Rollback: revert the release — the additive column is harmless to older code and destroys nothing.

## Open Questions
None blocking. Multi-state statuses, pagination, CSV export and multi-user accounts are deliberately deferred and would extend this capability later.

