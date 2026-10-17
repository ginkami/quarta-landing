# Proposal

## Why

The landing has no way for a visitor to actually submit a request — the single conversion goal of the site. Advertising in Instagram and Yandex spends money now, so the page must capture qualified requests (name, phone, intent) with reliable delivery into storage the manager reviews, and every lead must carry the advertising source that produced it.

## What Changes

- Adds a request form section (`id="request"`) between FAQ and contacts with fields: name, phone, interest (subscription / one-time order / question), comment — validated by one shared zod schema on both the client (react-hook-form) and the server (Server Action).
- Strict Belarusian phone validation (+375) with clear Russian error hints, input masking, and normalization to E.164 before storage.
- Idempotent submission: the same phone within 10 minutes — including double-click and retries — never creates a second lead; repeat submissions receive the original success outcome.
- Anti-spam on the public form: a hidden honeypot field plus a best-effort per-IP submission rate limit; Cloudflare Turnstile remains the escalation path only if spam persists (per project rules).
- Persists leads in Vercel Storage (Neon Postgres) behind an env-validated connection string; adds the `leads` schema migration. Local development access is resolved through the Vercel OIDC integration already present in `.env.local` (exact mechanism verified during apply).
- Self-made attribution stored as JSONB on each lead: first/last-touch campaign data (utm parameters, yclid/gclid/fbclid, referrer, landing page) from a first-party cookie, plus submission page and device captured from server headers. No third-party attribution products (region constraint: Neon Metrics is unavailable).
- Lead delivery is DB-only: the manager reviews leads in the Neon console; persistence failures surface a Russian error message with a retry path and no data loss.
- Retargets request-entry CTAs (header, hero, subscription) and header navigation to the form section instead of the contacts section.
- Fires a Vercel Analytics conversion event on successful submission.
- Tests: Vitest covers phone parsing/normalization, the dedup window and attribution logic; a Playwright smoke covers the lead-submission flow (introduced together with this feature code, per project rules).

## Capabilities

### New Capabilities

- `lead-capture`: request form behavior — field rendering and validation rules, phone acceptance, submission through a Server Action, idempotent duplicate handling, lead persistence and attribution capture, success/error UX, and the conversion event.

### Modified Capabilities

- `landing-content`: section composition gains the request form section (with its navigation entry), and the header/hero/subscription CTA requirements retarget the request entry point from the contacts section to the form section.

## Impact

- New runtime dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`, `@t3-oss/env-nextjs`, `@neondatabase/serverless`. Dev: `@playwright/test` with a browser download.
- New code: shared schemas (`src/lib/schemas/`), attribution library (`src/lib/attribution.ts`), env and DB modules, `submitLead` Server Action (`src/actions/`), form section component, attribution tracker leaf; edits to Header/Hero/Subscription anchors, `page.tsx`, and `src/content/landing.ts` (form section id, nav item).
- Database: new `leads` table in the Neon project (migration script); read access for the manager via the Neon/Vercel console.
- Configuration: `DATABASE_URL` availability per environment (Vercel scopes + `.env.local`); possible `vercel env pull`/link step during apply.
- Observable landing changes: new section between FAQ and contacts; CTA scroll targets change from `#contacts` to `#request`.
