# Lead capture data contract

How a request from the landing becomes a stored lead (`lead-capture` capability).

## Form fields

| Field     | Rules                                                                 | Storage                     |
| --------- | --------------------------------------------------------------------- | --------------------------- |
| `name`    | required, trimmed, 2–100 characters                                    | `leads.name`                |
| `phone`   | required, Belarusian `+375` number, normalized to `+375XXXXXXXXX`      | `leads.phone`               |
| `interest`| required enum: `subscription` \| `single_order` \| `question`          | `leads.interest`            |
| `comment` | optional, trimmed, ≤ 500 characters, empty becomes `NULL`             | `leads.comment`             |
| `website` | honeypot (hidden); when filled the submission is silently discarded   | never stored                |

One shared zod schema (`src/lib/schemas/lead.ts`) validates on the client
(react-hook-form) and again inside the Server Action — the client copy is UX,
the server copy is the security boundary.

## Phone acceptance

- Criterion: `+375` + exactly nine digits of any value (any subscriber number).
- Spaces, parentheses and dashes are accepted on input and stripped on save.
- Rejected: domestic `8…` numbers, `+7…` numbers, wrong lengths.
- Error hints are Russian and rendered under the field.

## Idempotency (dedup window)

The same normalized phone within **10 minutes** of its latest accepted lead
never creates a second row: the Server Action takes a transaction-scoped
advisory lock on the phone, checks the newest `created_at`, and returns the
original success outcome for duplicates. After 10 minutes the phone may submit
again. Double-click is additionally blocked in the UI by the submitting state.

## Storage

- Table: `leads` (migration `db/migrations/0001_create_leads.sql`,
  applied with `npm run db:migrate`).
- The manager reviews leads in the Neon console (DB-only delivery — no email
  or Telegram by product decision).
- Application code reads the connection string exclusively through
  `src/lib/env.ts` (`@t3-oss/env-nextjs`).

## Attribution

- First-party cookie `q_attr` (30 days, `SameSite=Lax`) written client-side by
  `AttributionTracker`: **first touch** captured once, **last touch** refreshed
  per visit.
- Captured from the URL: `utm_source`, `utm_medium`, `utm_campaign`,
  `utm_content`, `utm_term`, `yclid`, `gclid`, `fbclid`; plus `referrer` and
  the landing page URL.
- The Server Action adds `submission_page` (Referer header) and `user_agent`,
  then stores the whole object as JSONB in `leads.attribution`.
- No third-party attribution services (Neon Metrics is unavailable in this
  region).

## Anti-spam

- Honeypot field `website` — silently dropped, normal-looking success.
- In-memory rate limit: **5 accepted submissions per IP per 10 minutes**
  (best-effort per serverless instance); over-limit requests get the standard
  error/retry UX with no row written.
- Escalation path if spam persists: Cloudflare Turnstile (per project rules).

## Verification

- Unit tests: `npm test` (phone, dedup window, rate limiter, attribution).
- DB connectivity check: `node scripts/check-db.ts`.
- Migration: `npm run db:migrate` (see README).
