# Design

## Context

The repo ships a bare Next.js 16.4.1 scaffold (App Router, TypeScript strict, Tailwind v4, ESLint flat config) with Cache Components and Partial Prefetching enabled in `next.config.ts`. All required assets are in place: hero and product images in `public/images/`, four brand woff2 fonts in `src/fonts/` (Geist files pending removal). There are no existing specs, no CMS, and no API/storage usage yet. See proposal.md for motivation; specs define the required behavior. Project rules (.clinerules/project.md): RSC by default, `'use client'` only for interactive leaves, shadcn/ui for primitives, SEO/a11y/CWV as acceptance criteria.

## Goals / Non-Goals

**Goals:**
- Deliver the complete marketing landing as a fully static Cache Components shell (no runtime API reads in sections).
- Establish reusable design tokens (palette, typography) that later changes (lead form) reuse unchanged.
- Ship SEO baseline and analytics integration required by project rules.

**Non-Goals:**
- Request form behavior, server actions, lead storage and attribution — handled by the follow-up `lead-capture` change.
- CMS or any dynamic content source; multi-language support; admin tooling.

## Decisions

1. **Tokens in Tailwind v4 `@theme`** — palette and font families defined once in `globals.css` as theme variables, consumed as native utilities (`bg-background`, `text-foreground`, `font-heading`…). The brand accent `#4A5D4E` maps to the `primary` token (`bg-primary`) because shadcn/ui owns `accent` for hover states. Alternatives: JS theme objects (duplicated, no cascade), legacy `tailwind.config` (not the v4 model).
2. **Four fonts via `next/font/local`** — matches the project's proven self-hosting pattern (Google Fonts was removed after upstream instability); CSS variables `--font-heading`, `--font-body`, `--font-caption`, `--font-price` mapped to theme font utilities. Alternatives: system-font stack (loses identity), external fonts (rejected — build reliability).
3. **Server Components for all sections; client leaves only for carousel and accordion** — preserves the static shell; no `cookies()`/`headers()`/`searchParams` anywhere in sections. Future dynamic widgets (from DB) must follow `<Suspense>` + `'use cache'` fetcher with `cacheLife`/`cacheTag` per the Next 16 caching guide.
4. **Hero via `next/image` fill + priority + gradient scrim** — guarantees LCP with explicit geometry (no CLS) and WCAG AA contrast for light text over the photo (photo mean brightness 61). Alternative: CSS `background-image` — rejected: no optimization, no priority preload, poorer LCP control.
5. **Carousel and accordion from shadcn/ui** (embla + Base UI — preset `base-nova`) — project standard for primitives, accessible by default, tree-shaken. Alternatives: Swiper (heavier, non-shadcn), raw `<details>` (animation/a11y styling constraints).
6. **Content as typed constants in `src/content/landing.ts`** — single source for SKUs, prices, terms, steps, FAQ; plain objects keep the page statically renderable and make content diffs reviewable. Alternative: inline JSX literals (duplicated, hard to review); CMS (non-goal).
7. **OG image via `opengraph-image.tsx` (ImageResponse)** — built at build time from palette + «КВАРТА» wordmark, no manual asset editing, no extra runtime cost. Alternative: hand-crafted static file — rejected: tooling burden for the team.
8. **Vercel Analytics in the root layout** via `@vercel/analytics` — project rule; conversion events deferred to `lead-capture`.
9. **shadcn/ui initialized via CLI** (preset bound to our tokens) then `carousel`, `accordion`, `button` added — keeps primitives on the established stack without hand-rolled reimplementation.

## Risks / Trade-offs

- [Only Regular weight files exist for PT fonts; Yanone ships Bold only] → typography relies on size/color for hierarchy; additional weights can be dropped into `src/fonts/` later without spec changes.
- [Carousel/accordion must be client components] → kept as isolated leaves; everything else stays server-rendered; static shell unaffected.
- [Hero image is the LCP element (164 KB webp)] → `priority` + preload, `fill` layout inside a sized container; verified via build output and manual LCP check.
- [Content placeholders: contact phone/Instagram links and final FAQ wording are not yet supplied] → structure and specs are stable; texts arrive during apply and slot into `landing.ts` without design changes.
- [Manual palette extensions (hover/border shades) could drift] → derived shades documented next to tokens and limited to the approved hue family.

## Migration Plan

Single-page replacement of the scaffold's demo `page.tsx`; deploy is a normal Vercel build. Rollback = revert of the change's commits (no data or schema involved).

## Open Questions

- Exact contact channels (phone number, Instagram handle) and final FAQ wording — needed as content input during apply; does not affect structure, specs or task breakdown.
