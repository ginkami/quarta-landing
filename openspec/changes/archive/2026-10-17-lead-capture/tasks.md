# Tasks

## 1. Local database access

- [x] 1.1 Refresh `.env.local` via `vercel env pull` (OIDC is already configured) and verify a usable `DATABASE_URL` by opening a connection with `@neondatabase/serverless` and running `SELECT 1`; if the variable is missing or unusable, stop and report the blocker for user input (design → Open Questions)

## 2. Dependencies and configuration

- [x] 2.1 Install runtime dependencies `zod`, `react-hook-form`, `@hookform/resolvers`, `@t3-oss/env-nextjs`, `@neondatabase/serverless`; verify `npm ls --depth=0` lists them and `npm run typecheck` exits 0
- [x] 2.2 Add shadcn/ui primitives `input`, `label`, `textarea`, `radio-group`; verify `npm run typecheck` passes with the generated components
- [x] 2.3 Create `src/lib/env.ts` (server-only `DATABASE_URL` validated by `@t3-oss/env-nextjs`) and `src/lib/db.ts` (Pool factory); verify `npm run typecheck` passes

## 3. Shared schemas, helpers and their tests

- [x] 3.1 Create the shared zod schema `src/lib/schemas/lead.ts` (name, interest enum, optional comment, phone with normalization to `+375XXXXXXXXX` and Russian messages) exporting the RHF-compatible types; verify `npm run typecheck`
- [x] 3.2 Add Vitest coverage for phone acceptance per spec: `+375 (29) 123-45-67` normalizes to `+375291234567`; `80…`, `+7…` and short codes are rejected; verify `npm test` passes
- [x] 3.3 Create `src/lib/attribution.ts` (parse and merge first/last-touch cookie payloads) with Vitest tests for campaign capture, first/last refresh, and the direct-visit case; verify `npm test` passes
- [x] 3.4 Create `src/lib/dedup.ts` (10-minute window helper) and `src/lib/rate-limit.ts` (sliding window with an injectable clock) with Vitest tests covering 9-minute duplicate, 11-minute new lead, and the 6th-submission rejection; verify `npm test` passes
- [x] 3.5 Document the lead data contract (fields, phone rules, dedup window, attribution sources, honeypot/rate limits) in `docs/lead-capture.md` and add `npm run db:migrate` to the README commands; verify every documented command runs as written

## 4. Database schema

- [x] 4.1 Write `db/migrations/0001_create_leads.sql` (leads table with `IF NOT EXISTS`, index on `(phone, created_at DESC)`) and `scripts/migrate.ts` wired as the `db:migrate` npm script; verify `npm run db:migrate` succeeds against the local `DATABASE_URL` and a follow-up query shows the table
- [x] 4.2 Verify migration idempotency: run `npm run db:migrate` a second time and verify it exits 0 without errors

## 5. Server Action (submitLead)

- [x] 5.1 Implement `src/actions/lead.ts` with `"use server"`: zod re-validation, honeypot silent discard, per-IP rate limit, transactional advisory-lock dedup, insert with merged attribution; typed result union (`ok` / `duplicate` / `invalid` / `error`); verify `npm run typecheck`
- [x] 5.2 Verify integration behavior against the local DB in dev: one valid submission creates a row, an immediate resubmission of the same phone returns success without a second row (query `leads` to confirm); record the observed result

## 6. Attribution capture

- [x] 6.1 Create the client leaf `src/components/tracking/AttributionTracker.tsx` writing the 30-day `q_attr` cookie (first-touch once, last-touch per visit) and mount it in the root layout; verify `npm run build` still reports the landing as static/prerendered

## 7. Form section UI

- [x] 7.1 Add `sections.request` and a «Заявка» nav item to `src/content/landing.ts`, and retarget header/hero/subscription CTA anchors to `#request`; verify the built HTML contains `id="request"` and all CTA hrefs pointing to it
- [x] 7.2 Implement the server wrapper `RequestFormSection` (`id="request"` with heading/copy) and the client `RequestForm` (RHF + zodResolver, phone mask, interest radios, optional comment, hidden honeypot, submitting/success/error states, retry-preserves-values); verify `npm run typecheck`
- [x] 7.3 Insert `RequestFormSection` into `page.tsx` between FAQ and contacts; verify the built HTML shows the section order required by the `landing-content` delta (FAQ → request form → contacts)
- [x] 7.4 Add RTL tests: an invalid phone shows the Russian hint without invoking the action; a mocked successful submission shows the Russian confirmation and emits the `lead-submitted` conversion event exactly once; verify `npm test` passes

## 8. Playwright smoke

- [x] 8.1 Install `@playwright/test`, download Chromium, and add `playwright.config.ts` with a webServer entry; verify `npx playwright test --list` enumerates the suite
- [x] 8.2 Write `tests/e2e/lead-submission.spec.ts`: open the landing, follow the CTA to the form, fill a valid lead with the reserved phone `+375290000000`, submit, and expect the Russian success confirmation; verify `npx playwright test` passes against the dev server with the local DB

## 9. Integration checks

- [x] 9.1 Run all gates — `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — and verify every command exits 0 with the landing reported as static/prerendered
- [x] 9.2 Verify Cache Components discipline: grep `src/app` and `src/components` for `cookies(`/`headers(` and confirm zero matches (runtime access lives only in `src/actions`)
- [x] 9.3 Serve the production build and verify `/` returns 200 with the form fields present, and `/sitemap.xml` + `/robots.txt` still return 200
- [x] 9.4 Manual acceptance with the user: submit a real lead and confirm the row with attribution in the Neon console, confirm a duplicate within 10 minutes adds no row, check the invalid-phone hint on a 320 px viewport, and confirm the `lead-submitted` event in Vercel Analytics; record the results
