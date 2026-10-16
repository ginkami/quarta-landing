# Tasks

## 1. Design system foundation

- [x] 1.1 Replace Geist font wiring in `src/app/layout.tsx` with four `next/font/local` definitions (heading/body/caption/price) and delete `src/fonts/Geist*.woff2`; verify `npm run build` passes and the rendered `<html>` carries all four font-variable classes
- [x] 1.2 Add palette and typography tokens to the Tailwind v4 `@theme` block in `src/app/globals.css` (background `#FAF6EE`, text `#2C2623`, blocks `#D5C2AD`, accent `#4A5D4E`, promo `#D08A4B` + derived hover/border shades); verify `npm run build` and confirm the compiled CSS contains the new `--color-*` / `--font-*` tokens
- [x] 1.3 Initialize shadcn/ui against the project tokens and add `button`, `accordion`, `carousel` primitives; verify `npm run typecheck` passes with the generated components

## 2. Content data and test setup

- [x] 2.1 Create typed content constants in `src/content/landing.ts` (assortment SKUs, subscription, delivery terms, process steps, contacts, FAQ with clearly marked placeholders where client texts are pending); verify `npm run typecheck`
- [x] 2.2 Configure Vitest with jsdom and React Testing Library, add the `test` script; verify `npm test` runs green
- [x] 2.3 Add unit tests for the content contract: 4 assortment products with exact titles/prices and image files present under `public/images/`, process steps in specified order; verify `npm test` passes
- [x] 2.4 Replace the scaffold README with the project's real purpose and local commands (dev/build/lint/typecheck/test); verify every documented command runs as written

## 3. Page sections

- [x] 3.1 Build the Header: «КВАРТА» text logo in Yanone Kaffeesatz, anchor navigation, primary CTA targeting the request entry point (`#contacts` until the form exists); verify `npm run build` and the built HTML contains every navigation target id
- [x] 3.2 Build the Hero with `next/image` fill + priority + contrast scrim over `hero.webp`, the value proposition copy and CTA; verify the built HTML preloads the hero image (LCP) and contains the headline copy
- [x] 3.3 Build the Assortment carousel (client leaf, shadcn Carousel, 2:3 images from content constants); verify `npm run typecheck` and rendered HTML exposes carousel controls with accessible names
- [x] 3.4 Build Subscription and Delivery/pickup sections from content constants; verify rendered HTML contains the exact terms (54 BYN/month, free delivery, 5 BYN, free from 50 BYN, ул. Короля 9, working hours)
- [x] 3.5 Build the Process steps section; verify rendered HTML shows the five steps in the specified order
- [x] 3.6 Build the FAQ accordion (client leaf, shadcn Accordion) with an RTL test that activating a question reveals its answer; verify `npm test` passes
- [x] 3.7 Build the Contacts section and footer from content constants; verify rendered HTML contains the `tel:` and Instagram links
- [x] 3.8 Install `@vercel/analytics` and mount it in the root layout; verify the built HTML references the analytics script

## 4. SEO baseline

- [x] 4.1 Set `lang="ru"` and Metadata API title/description in the root layout; verify the built HTML head contains them
- [x] 4.2 Add `opengraph-image.tsx` (ImageResponse with palette + wordmark); verify `npm run build` emits the OG image route artifact
- [x] 4.3 Add `sitemap.ts` and `robots.ts`; verify `npm run build` emits both routes
- [x] 4.4 Add a JSON-LD builder for the business structured data (name, address, opening hours) with a unit test parsing it and asserting required fields; verify `npm test` passes
- [x] 4.5 Render the JSON-LD block in the page; verify built HTML contains `<script type="application/ld+json">` with the required fields

## 5. Integration checks

- [x] 5.1 Run all gates — `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — and verify every command exits 0 with the landing reported as static/prerendered
- [x] 5.2 Verify Cache Components discipline: grep `src/app` and `src/components` for `cookies(`/`headers(`/`searchParams` and confirm none appear (expected: zero matches)
- [x] 5.3 Serve the production build (`npm run start`) and verify `/`, `/sitemap.xml`, `/robots.txt` return 200 with expected content
- [x] 5.4 Perform a manual acceptance pass: 320 px viewport without horizontal scroll, keyboard navigation through nav/carousel/accordion, hero text contrast ≥ 4.5:1, all section CTAs scroll to their targets
