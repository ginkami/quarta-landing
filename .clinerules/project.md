# Project Rules — quarta-landing

## 1. Project Context

- Lead-generation landing page. Primary conversion goal: a visitor submits a request form
  (subscription or one-time order).
- After submission, a manager calls the visitor back to arrange the order — no self-service checkout.
- Explicitly out of scope: shopping cart, online payments, user accounts, admin panel —
  unless an agreed OpenSpec change explicitly requires one of them.
- Conversion-critical UI (forms, CTAs, contacts) must be mobile-first, accessible and fast.

## 2. Stack

### Core (agreed)
- Next.js (App Router) + React with TypeScript in strict mode. `any` is categorically forbidden —
  use `unknown` + type narrowing or proper generics.
- Tailwind CSS + shadcn/ui for UI primitives.
- React Server Components by default; mark interactive leaves with `'use client'`.
  Never make a page or layout a Client Component without a clear reason.
- Forms: react-hook-form + zod (`@hookform/resolvers`).
- Deployment: Vercel. Keep Next.js / React / Tailwind at current stable versions and pin the
  Node version in `engines`.

### Forms & lead submission
- One shared zod schema per form (in `src/lib/schemas/`), used both client-side (RHF resolver)
  and server-side (Server Action). Client validation is UX; server validation is security —
  never rely on client validation alone.
- Submit leads via Server Actions (`src/actions/`), never via ad-hoc client-only handlers.
- Lead delivery sits behind a single `submitLead()` interface: email to the manager
  (Resend + React Email), optionally mirrored to a CRM/Telegram. Delivery failure must be logged
  and surfaced to the user with a retry path — a lost lead is a lost sale.
- Anti-spam on every public form: honeypot field + rate limiting. Escalate to Cloudflare
  Turnstile only if spam persists.

### Config & quality
- Validate environment variables with `@t3-oss/env-nextjs` + zod. Never read `process.env`
  directly in application code.
- ESLint (flat config) with `eslint-config-next` + `typescript-eslint` strict-type-checked:
  `@typescript-eslint/no-explicit-any: error`, `no-unsafe-*` rules enabled.
  Prettier + `prettier-plugin-tailwindcss`.
- `tsconfig.json`: `strict: true` plus `noUncheckedIndexedAccess`, `verbatimModuleSyntax`,
  `isolatedModules`. `tsc --noEmit`, lint and build must pass before any commit.
- Tests: Vitest + React Testing Library for form/validation logic; Playwright smoke for the
  lead-submission flow. Introduce them together with the first feature code.

### Landing-as-a-product
- SEO is mandatory, not optional: Metadata API, `sitemap.ts`, `robots.ts`, Open Graph images,
  JSON-LD structured data (schema.org), `next/font`, `next/image`.
- Accessibility (labels, aria, keyboard focus) and Core Web Vitals (LCP/CLS) are acceptance
  criteria for UI work.
- Analytics: Vercel Analytics; track a conversion event on every successful form submission.

## 3. Methodology — SDD with OpenSpec

- All feature work follows Spec-Driven Development via OpenSpec:
  explore -> propose -> apply -> update -> sync -> archive (skills in `.cline/skills/`).
- OpenSpec artifacts (proposals, specs, tasks, archive notes) and all documentation are written in English.
- Specs live in `openspec/specs/`; active changes in `openspec/changes/`;
  archived in `openspec/changes/archive/`.
- Do not start implementation before the change proposal is agreed with the user.
- Keep one change = one coherent capability; sync specs after applying a change.

## 4. Communication & Git

- Talk to the user in Russian.
- Documentation, code comments and commit messages are written in English.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
