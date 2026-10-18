# Design

## Context
See proposal.md — Why. The state that shapes the approach:
- `submitLead` in `src/actions/lead.ts` runs honeypot → zod → IP rate limit → advisory-lock dedup (10-minute window) → transactional INSERT, then returns a typed success union. Only the insert path represents a "new lead".
- `getServerEnv()` in `src/lib/env.ts` lazily validates server variables (DATABASE_URL, ADMIN_PASSWORD today); the project forbids direct `process.env` reads in application code.
- The lead row is the source of truth (DB-only delivery was the agreed baseline); Telegram is a mirror, and `.env.local` already carries `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`.
- Deployment runs on Vercel serverless functions.

## Goals / Non-Goals
**Goals:**
- One readable group message per genuinely new lead, with zero added dependencies.
- Lead capture stays more reliable than the notification: a Telegram outage must never cost a lead.
- Deterministic behavior under tests and repeats.

**Non-Goals:**
- Delivery status tracking, retries with backoff, queues or dead-lettering (the admin panel is the recovery path).
- Outbound replies, bot commands, or any Telegram feature beyond `sendMessage`.
- Email/CRM mirrors (project rule mentions them; none agreed yet).

## Decisions
1. **Await the send with a ~5 s timeout instead of fire-and-forget.** On Vercel the function freezes after the response, so a detached promise can vanish; a bounded await keeps delivery deterministic while capping visitor latency (the row is already committed — even a timeout still shows success). Alternative rejected: queue infrastructure (heavily out of proportion).
2. **Best-effort around the send.** All failures (missing config, non-2xx, network error, timeout) are caught, logged via `console.error`/`console.warn`, and swallowed. The visitor's success/duplicate outcome is decided before the notification runs. Alternative rejected: failing the action on notify errors — turns a mirror problem into a lost lead.
3. **Optional env variables.** `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` validate as `z.string().min(1).optional()`; if only one is set, warn and skip. Required variables would make any env drift break the public form. Alternative rejected: reading them through `process.env` directly (forbidden by project rules).
4. **Plain `fetch` against the Bot API, no SDK.** A single `sendMessage` JSON call with `parse_mode: "HTML"`, `disable_web_page_preview: true`, `AbortController` timeout — zero dependencies, fully mockable in unit tests.
5. **Pure formatter + thin client.** `formatLeadMessage(lead)` escapes `<`, `>`, `&` in every user-provided field, prints labels in `<b>`, the phone in `<code>` (tap-to-copy), omits an empty comment, truncates a long one (~1500 chars, under the 4096 message cap), and formats time via `Intl.DateTimeFormat` with `timeZone: "Europe/Minsk"`. The client owns transport only — keeps the format unit-testable without network.
6. **Test-phone suppression list.** The reserved automated-smoke phones live in one commented constant next to the client and are skipped before any network call, so E2E runs never spam the group; real leads are unaffected. Alternative accepted partially: letting smoke messages through (rejected — noise degrades trust in the channel).

## Risks / Trade-offs
- [Visitor waits for Telegram] → 5 s hard cap; normally +~300 ms; timeout still returns success.
- [Token leaked into logs] → never log the token or the request URL; log only outcome and chat id presence as a boolean.
- [Message exceeds 4096 chars] → comment truncation keeps the worst case far below the limit.
- [Duplicate message on action retry] → actions are idempotent per dedup window; a client retry after success hits the dedup path and sends nothing.
- [Config drift on deploy] → optional vars degrade to a warning; README lists them as required-for-notifications deployment steps.

## Migration Plan
1. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in the Vercel environment (Production/Preview) — `.env.local` already has local values.
2. Deploy; submit one real lead on production and confirm group delivery.
3. Rollback: remove the two variables — notifications stop, lead capture continues unchanged.

## Open Questions
None blocking. The message template was approved during planning.
