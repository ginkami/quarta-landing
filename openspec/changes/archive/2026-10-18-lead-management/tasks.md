# Tasks

## 1. Database & environment
- [x] 1.1 Create idempotent migration `db/migrations/0002_add_lead_status.sql` adding `processed boolean NOT NULL DEFAULT false` and apply it locally via `npm run db:migrate`; verify the column exists on the local `leads` table and existing rows read `false`
- [x] 1.2 Add `ADMIN_PASSWORD: z.string().min(8)` to `getServerEnv()` in `src/lib/env.ts` and put a development value into `.env.local`; verify `npm run typecheck` passes and the landing still loads in `npm run dev` (lazy validation intact)
- [x] 1.3 Document the new environment variable and the 0002 migration step for deployments in README; verify the documented commands run as written

## 2. Server primitives
- [x] 2.1 Implement `src/lib/admin-auth.ts` (sign and verify an expiring `<expires>.<HMAC>` cookie value with `crypto.timingSafeEqual`, key derived from `ADMIN_PASSWORD`) and unit tests for valid, expired and tampered tokens; verify `npx vitest run src/lib/admin-auth.test.ts` passes
- [x] 2.2 Implement `src/lib/schemas/admin.ts` zod schemas (login password, uuid lead id, comment string ≤ 2000 nullable, status filter enum) with unit tests covering accept/reject cases; verify `npx vitest run src/lib/schemas/admin.test.ts` passes

## 3. Data access
- [x] 3.1 Implement `src/lib/leads-admin.ts`: `listLeads(filter)` with `ORDER BY processed ASC, created_at DESC`, `setLeadProcessed`, `deleteLead`, `setLeadComment`; verify against the local DB in dev that ordering puts unprocessed leads first (newest first inside each group), the filter returns only matching rows, and each mutation changes the row (record the observed results)

## 4. Server Actions
- [x] 4.1 Implement `src/actions/admin.ts`: `adminLogin` (IP rate limit 5/10 min → constant-time compare → set signed cookie), `adminLogout` (clear cookie), and the `verifyAdmin` guard; all returning typed result unions with zod re-validation; verify `npm run typecheck` passes and a manual dev check shows wrong password → Russian error without cookie, correct password → cookie set, 6th attempt within 10 minutes → rate-limit error
- [x] 4.2 Implement `loadLeads(filter)`, `setLeadProcessed(id, processed)`, `deleteLead(id)`, `saveComment(id, comment | null)` behind `verifyAdmin` with zod-validated inputs; verify `npm run typecheck` passes and an unauthenticated invocation of each returns the `UNAUTHORIZED` outcome without touching the database

## 5. Admin UI
- [x] 5.1 Build `/admin/login` (static page + `LoginForm` client component calling `adminLogin`, Russian error alert) with component tests for failure and success paths; verify `npx vitest run src/components/admin/LoginForm.test.tsx` passes
- [x] 5.2 Build `/admin` static shell with `robots: { index: false, follow: false }` metadata and the `AdminPanel` client component (loads `loadLeads` on mount, redirects to `/admin/login` on `UNAUTHORIZED`, «Обновить» button, status filter radios, «Выйти»); component tests cover list rendering from a mocked action, filter behavior and unauthorized redirect; verify `npx vitest run src/components/admin/AdminPanel.test.tsx` passes
- [x] 5.3 Build `LeadCard` (date/time, name, `tel:` phone link, interest, full comment text, status toggle with optimistic update and revert-on-error, delete button with confirmation dialog) with component tests for toggle revert and delete confirm/cancel; verify `npx vitest run src/components/admin/LeadCard.test.tsx` passes
- [x] 5.4 Build the comment modal (native `<dialog>`: textarea with current text, «Принять», «Отмена», «Удалить комментарий») with component tests for save, clear and cancel; verify `npx vitest run src/components/admin/CommentModal.test.tsx` passes
- [x] 5.5 Implement the pure `summarizeTouch` formatter and `AttributionSummary` component (first/last-touch chips, «нет данных» for empty touches, submission page, raw JSON in an expandable view) with unit tests for utm/click-id/referrer/empty cases; verify `npx vitest run src/lib/summarize-touch.test.ts` and the component test pass

## 6. SEO & indexing
- [x] 6.1 Add `disallow: "/admin"` to `src/app/robots.ts`; verify a `npm run build` produces `/robots.txt` output containing `Disallow: /admin` and the admin HTML carries a `noindex` robots meta tag

## 7. Playwright admin smoke
- [x] 7.1 Ensure the Playwright web server runs with `ADMIN_PASSWORD` available and create `tests/e2e/admin.spec.ts`: login (wrong password error, then success) and lead list loaded with a freshly submitted form lead visible; verify `npx playwright test tests/e2e/admin.spec.ts` passes locally
- [x] 7.2 Extend the smoke to cover mutations end to end: status toggle persists after reload, status filter narrows the list, comment save/clear, delete with confirmation, and «Обновить» reflecting current data; verify `npx playwright test tests/e2e/admin.spec.ts` passes against the local database

## 8. Integration checks
- [x] 8.1 Run the full gate suite — `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — and verify every command exits clean
- [x] 8.2 Run `openspec validate --specs` and `openspec status --change lead-management`; verify all validations pass and every task above is checked
- [x] 8.3 Manually review the spec scenarios for lead-management on `npm run dev` (login, ordering, toggle, filter, comment modal, delete confirm, attribution chips, refresh) and record any UI adjustments made
  - Adjustment (visual pass): the comment edit control moved to the «КОММЕНТАРИЙ» header row as an icon button (`SquarePenIcon`, aria-label/tooltip «Редактировать комментарий»); tests updated, typecheck/lint/vitest/Playwright green.
  - Adjustment (visual pass): status filter labels switched to plural — «Необработанные», «Обработанные» (toggle labels stay singular); spec delta and tests synced.
