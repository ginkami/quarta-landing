# Proposal

## Why
Leads accumulate in Neon but have no working interface: the roaster triages them through the raw Neon console, which is clumsy on a phone and unsafe to hand to staff. A minimal password-protected admin panel turns captured leads into a daily workflow — status, notes, filtering — without exposing the database.

## What Changes
- Add a password-protected admin area: `/admin/login` (single password field) and `/admin` (lead list).
- Authenticate against a new `ADMIN_PASSWORD` environment variable with constant-time comparison and a rate limit; issue an expiring HttpOnly signed cookie; redirect unauthenticated requests to the login page; provide logout.
- Add a `processed` boolean to the leads table (idempotent migration 0002) with a toggle «Обработана»/«Не обработана», a status filter (Все / Не обработана / Обработана), and list ordering: unprocessed first, newest first within each group.
- Support lead deletion behind a confirmation dialog and editing of the optional free-text comment in a modal with «Принять», «Отмена», «Удалить комментарий».
- Refresh the list on every page load and via an explicit «Обновить» button (both re-run the same read action).
- Render each lead's `attribution` JSONB as a human-readable first/last-touch summary (UTM / click-id / referrer chips, submission page) plus an expandable raw JSON view.
- Disallow crawling of `/admin` in `robots.ts` and serve admin pages with `noindex`.

## Capabilities

### New Capabilities
- `lead-management`: the authenticated admin panel for working captured leads — authorization and session handling, lead list retrieval with ordering/filtering, processing status, deletion, comments, and attribution display.

### Modified Capabilities
- `landing-seo`: robots directives additionally disallow the `/admin` routes (admin panel must not be crawled).

## Impact
- **DB**: `db/migrations/0002_add_lead_status.sql` — additive `processed boolean NOT NULL DEFAULT false` column; existing rows default to unprocessed.
- **Env**: `ADMIN_PASSWORD` becomes a required server variable in `src/lib/env.ts`; must be set in `.env.local` and Vercel before deploy (validation is lazy, so builds keep working).
- **Server**: new `src/actions/admin.ts` (all `cookies()`/DB access per the Cache Components discipline), `src/lib/admin-auth.ts` (token sign/verify), `src/lib/leads-admin.ts` (queries), `src/lib/schemas/admin.ts` (zod).
- **UI**: new routes `/admin`, `/admin/login`, client components under `src/components/admin/`; same daisyUI `quarta` theme.
- **SEO**: `src/app/robots.ts` gains a disallow rule; admin pages add `robots: { index: false }`.
- **Tests**: unit tests (auth token, attribution summary, schemas), component tests (login form, comment modal), new Playwright smoke `tests/e2e/admin.spec.ts`.
- **Deployment**: run `npm run db:migrate` against the target Neon branch and set `ADMIN_PASSWORD` before shipping.
