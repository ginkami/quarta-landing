# КВАРТА — landing for a Minsk coffee roastery

Lead-generation landing page for a small coffee roastery in Minsk. Visitors
submit a request (subscription or one-time order) and a manager calls back to
arrange the order. There is no cart and no online payment.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19, TypeScript in strict mode
- Tailwind CSS v4 + shadcn/ui primitives
- Self-hosted fonts (`next/font/local`), Vercel Analytics
- Spec-driven development via OpenSpec: specs in `openspec/specs/`, active
  changes in `openspec/changes/`

## Commands

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest unit tests
npm run db:migrate # apply database migrations (requires DATABASE_URL)
```

## Environment variables

`.env.local` (development) and the Vercel environment (Production/Preview) must define:

- `DATABASE_URL` — Neon Postgres connection string (`vercel env pull` refreshes it).
- `ADMIN_PASSWORD` — password for the `/admin` lead panel (minimum 8 characters).
  It is validated lazily at runtime, so it must be set before the admin panel or
  the lead form serve traffic.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — bot credentials for lead
  notifications in the Telegram group. Optional: without them submissions still
  succeed and the notification is skipped with a server-side warning.

## Deployment notes

```bash
npm run db:migrate   # applies db/migrations/*.sql, including 0002_add_lead_status.sql
```

Run migrations against the target Neon branch **before** deploying a release that
depends on them. Migrations are idempotent and safe to re-run.

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in the Vercel environment to
enable Telegram lead notifications; leaving them unset keeps the form fully
functional with notifications disabled.

## Project rules

Agent-facing rules live in `.clinerules/project.md`. Documentation, code
comments and commit messages are written in English; chat replies are in
Russian.

