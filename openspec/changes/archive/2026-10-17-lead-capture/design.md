# Design

## Context

The landing ships as a fully static Cache Components shell with shadcn/ui primitives (Base UI preset `base-nova`), design tokens (`primary`, `line`, `muted`, promo), and content constants in `src/content/landing.ts`. Vercel's native Neon integration provides `DATABASE_URL` and related secrets for Preview/Production; `.env.local` currently holds only `VERCEL_OIDC_TOKEN`. No database code, forms, or server actions exist yet. See proposal.md for motivation; specs define required behavior. Project rules: one shared zod schema per form, leads behind a single `submitLead()` Server Action, honeypot + rate limiting on every public form, env via `@t3-oss/env-nextjs`, Playwright smoke with the first feature code.

## Goals / Non-Goals

**Goals:**
- One battle-tested path from visitor input to a durable, attributed lead row; duplicate-proof within the 10-minute window.
- Preserve the static shell: all dynamic access (`cookies()`, `headers()`, DB) happens only inside the Server Action.
- Local development and automated verification against a real database.

**Non-Goals:**
- Email/Telegram notifications (DB-only delivery was an explicit product decision), admin UI, payments/cart, Turnstile (escalation path only), multi-region rate-limit infrastructure.

## Decisions

1. **Shared zod schema in `src/lib/schemas/lead.ts`** — one source consumed by the RHF resolver and the Server Action; includes phone normalization to `+375XXXXXXXXX` and Russian messages. Alternative: parallel client/server rules (drift risk, rejected by project rules).
2. **Phone input: custom RHF `Controller` formatter** (mask `+375 (XX) XXX-XX-XX`, digits-only extraction) — zero new dependencies, exact BY-format control. Alternatives: `libphonenumber-js` (heavy for one country), raw input (poor UX).
3. **`submitLead()` Server Action (`src/actions/lead.ts`)** returning a typed result union (`ok` / `duplicate` / `invalid` + field errors / `error` + rate-limited). Steps: zod parse → honeypot discard → per-IP rate limit → transactional dedup → insert. Alternative: Route Handler (loses rules alignment and RHF ergonomics).
4. **DB driver: `@neondatabase/serverless`** — `neon()` HTTP cannot run transactions, so persistence uses the `Pool` (pg-over-WebSocket) API: `BEGIN; pg_advisory_xact_lock(hashtext(phone)); SELECT latest; helper decides; INSERT or reuse; COMMIT`. Advisory lock is transaction-scoped, which is safe behind Neon's pooled connection. Alternative: single `INSERT … WHERE NOT EXISTS` (races under double-click — rejected by the race-safe requirement).
5. **Migration: plain SQL `db/migrations/0001_create_leads.sql` + `scripts/migrate.ts` executed with Node's native TS support** (`npm run db:migrate`); additive only. Table: `id uuid pk`, `created_at timestamptz`, `name`, `phone` (looked up per window via an index on `(phone, created_at DESC)`), `interest`, `comment`, `attribution jsonb`.
6. **Env: `@t3-oss/env-nextjs` in `src/lib/env.ts`** exposing `DATABASE_URL` server-side only; `src/lib/db.ts` owns the Pool. Alternative: raw `process.env` (forbidden by rules).
7. **Local database access is an explicit first-class task**: run `vercel env pull` (the OIDC token is already present), validate the pulled `DATABASE_URL` with a `SELECT 1`; known upstream bugs make this uncertain — if missing or unusable, stop and ask the user for the pooled connection string (Vercel Development scope or Neon console). Vercel Preview/Production already have the variables.
8. **Attribution: first-party cookie `q_attr` (30 days) written by a tiny client leaf** (`AttributionTracker` mounted in the layout): first-touch captured once, last-touch refreshed per visit from `location.search`/referrer. The Server Action reads the cookie plus `referer`/`user-agent` headers and merges into `attribution` JSONB. Alternative: payload-side passing (works too; the cookie keeps the action authoritative and covers reloads).
9. **Rate limiting: in-memory sliding window per IP** (module-scope `Map`, 5 accepted / 10 min) — best-effort on serverless, documented as a baseline; the honeypot covers naive bots; Turnstile only if spam persists (project rules). Alternative: Upstash/Redis (new infra — deferred).
10. **Form composition: server `RequestFormSection` wrapper (`id="request"`, heading/copy) + client `RequestForm` leaf** using shadcn `input/label/textarea/radio-group` (added via CLI) with `zodResolver`. Success replaces the form with a confirmation panel and emits `track("lead-submitted")` exactly once; errors render an inline retry alert that preserves entered values.
11. **Tests**: Vitest unit suites for the phone schema/normalization, the dedup-window helper, attribution merging, and the rate limiter (injected clock); RTL for the form's hint/success flows with the action mocked; Playwright smoke (`@playwright/test`, Chromium) driving the real form against dev + the local DB.

## Risks / Trade-offs

- [Local `DATABASE_URL` unobtainable via `vercel env pull` (known upstream issues)] → resolved first with an explicit blocker report to the user; Preview/Production are unaffected.
- [In-memory rate limit is per-instance on serverless] → acceptable baseline paired with the honeypot; documented escalation to Turnstile.
- [Advisory locks behind pgbouncer transaction pooling] → transaction-scoped lock only; verified live during migration and the smoke run.
- [Rate limit on shared office IPs (NAT)] → 5/10 min is generous for humans; the failure UX allows retrying after the window.
- [Playwright adds a large browser download] → mandated by project rules for the lead flow; Chromium only.
- [The smoke test writes rows into the shared dev database] → uses the reserved test phone `+375290000000`, left as recognizable test data (assumption).

## Migration Plan

Deploy order: resolve local env → run `db:migrate` against the production branch (via Vercel env) → deploy the app so the form only goes live against an existing table. Additive schema; rollback = revert the release (no data destruction).

## Open Questions

- Which exact path yields a usable local `DATABASE_URL` (`vercel env pull` vs. pasting the pooled URL from the Neon console) — answered by the first apply task; if both fail, apply pauses for user input.
- Whether the manager wants smoke-test rows cleaned from the dev database (default: kept, identifiable by the reserved test phone).
