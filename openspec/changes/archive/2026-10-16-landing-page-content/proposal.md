# Proposal

## Why

The project currently ships a bare Next.js scaffold with no actual page. Quarta is a lead-generation landing: Instagram and Yandex ads will point here, and visitors must immediately learn who the roastery is, why freshness matters, what it costs, and how ordering works — before any lead form can make sense. Marketing content, visual identity and SEO baseline are the foundation every later capability (lead capture, attribution) builds on.

## What Changes

- Introduces the visual design system: palette tokens (`#FAF6EE` background, `#2C2623` text, `#D5C2AD` blocks, `#4A5D4E` primary accent, `#D08A4B` promo accent) and typography mapped to four local fonts; removes the default Geist fonts.
- Builds every section of the single-page landing: header with the «КВАРТА» text logo, hero with a full-bleed photographic background, assortment carousel (4 SKUs with prices), subscription offer, delivery & pickup terms, step-by-step process, FAQ accordion, contacts, footer.
- Keeps the whole page a fully static Cache Components shell: no runtime API reads in sections; future dynamic widgets follow the Suspense + `use cache` pattern (design-level decision).
- Adds the SEO baseline: Russian metadata, Open Graph image, `sitemap.ts`, `robots.ts`, JSON-LD structured data for the local business.
- Adds Vercel Analytics loaded on the page (the conversion event on form submission arrives with the lead-capture change).

## Capabilities

### New Capabilities

- `design-system`: visual foundation — color tokens, typography roles bound to local fonts, shared styling rules for interactive primitives, and contrast/accessibility requirements.
- `landing-content`: structure and behavior of the marketing landing — required sections, their content contracts (prices, terms, process steps), responsive/mobile-first layout, and interactive components (assortment carousel, FAQ accordion, in-page navigation), plus baseline analytics integration.
- `landing-seo`: how the landing presents itself to search engines and ad crawlers — document metadata, Open Graph, sitemap/robots, and JSON-LD structured data.

### Modified Capabilities

(none — the project has no existing specs)

## Impact

- Code: `src/app/layout.tsx` (fonts, `lang`, metadata), `src/app/page.tsx` (section composition), `src/app/globals.css` (tokens); new `src/components/` modules; new `sitemap.ts` / `robots.ts`; OG image asset or file convention.
- Assets: usage of `public/images/*.webp`; deletion of `src/fonts/Geist*.woff2`.
- Dependencies: shadcn/ui primitives (carousel, accordion, button), `@vercel/analytics`.
- No changes to `next.config.ts` (Cache Components flags stay), no API, storage or form behavior in this change — those belong to the follow-up `lead-capture` change.
