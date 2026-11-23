# MASTER BRIEF: NorthCalculator (condensed working copy)

> The full original brief was supplied by the owner in the first Claude Code session on 2026-11-23. This file keeps every requirement in compact form. If anything here conflicts with a later owner instruction, the owner instruction wins. Record such changes in docs/decisions.md.

**Domain:** northcalculator.com (to be confirmed). Use `NEXT_PUBLIC_SITE_URL` everywhere and never hardcode the domain.

## 0. Working rules

1. Plan before coding. Phase 0 is research only; wait for approval before scaffolding.
2. Work in phases (§15). At the end of each phase: typecheck, lint, tests, build, Lighthouse; fix; commit; summarise.
3. Keep `CLAUDE.md` current (architecture, conventions, commands, rules).
4. Never fake correctness. Every formula has an authoritative cited source and unit tests with reference values. If unsure, add it to docs/open-questions.md.
5. Never generate thin, templated or mass-produced content.
6. Ask only when blocked. Otherwise decide, record it in docs/decisions.md, and continue.

## 1. Mission

The most accurate, fastest, clearest and most trustworthy calculator site, multilingual and on every device. Competitors: calculator.net, omnicalculator, calculatorsoup, calculator.io, rapidtables, symbolab, desmos, bankrate, nerdwallet, Mayo/CDC/NHS, timeanddate, unitconverters.net, convertunits, and the Google widgets.
Promise: a clean instrument-grade UI with the tool first and no layout shift; live results with defaults; result + explanation + steps + formula + chart/table; static-first and tiny JS; one consistent input system; every calculation is a shareable URL, with copy/print/PDF/CSV and local history; proper localisation; formula sources, reviewer, last-reviewed date and changelog; AI-search-ready (answer-first, llms.txt, JSON-LD).
Brand: "North" = precision and direction. Calm, like an instrument, not a toy or a content farm.

## 2. Stack

Next.js latest stable (App Router, RSC), TS strict + noUncheckedIndexedAccess. SSG for content; ISR only for changing data (FX). Client components only for the calculator island. Tailwind v4 + CSS-variable tokens + Radix or React Aria (no stock shadcn look). next-intl, locale-prefixed. decimal.js/big.js for money; mathjs lazy; plain number with explicit rounding elsewhere. Zod from definitions. Tiny lazy SVG charts. Build-time per-locale Fuse/MiniSearch index, lazy, `/` and Cmd/Ctrl+K. Vitest (+ property tests), Playwright + axe, Lighthouse CI budgets. pnpm, ESLint, Prettier, Husky + lint-staged, Conventional Commits, GitHub Actions. Vercel target but host-agnostic. Privacy-friendly analytics (Plausible/Umami) + GSC; no non-essential cookies before consent.

## 3. Architecture

`/src/app/[locale]/(site)/{page, [category]/page, [category]/[slug]/page, search, about, methodology, editorial-policy, privacy, terms, contact}`, `api/` only if needed. `/src/calculators/registry.ts` + `/src/calculators/<category>/<calc>/{definition.ts, compute.ts, compute.test.ts, content.<locale>.mdx, Calculator.tsx?}`. `/src/engine` (money, units, dates, stats, rounding), `/src/components`, `/src/i18n`, `/src/lib/seo`, `/docs`.
Definition contract: id, slug per locale, category, subcategory, tags, difficulty; inputs[] (number, currency, percent, unit-number, date, select, toggle, slider, table/list; default, min/max/step, units, validation, helper key); outputs[] (label key, format, primary/secondary); `compute(inputs, ctx) → {outputs, steps[], series?, table?, warnings[]}`; sources[] {title, publisher, url, accessed} (required, and CI fails without it); reviewedBy, lastReviewed, version, changelog[]; related[], faqs[], examples[]. A generic renderer plus an optional custom component. Adding a calculator = adding one folder.
Engine: documented rounding policy, an exact unit-factor graph, leap-year- and tz-safe dates, locale-safe parsing, no float money bugs, pure deterministic compute that can run in a Web Worker.

## 4. Catalogue

Wave 1 (~80–100): everyday math, finance, health, date/time, unit conversion, education (see docs/taxonomy-and-wave1.md). Wave 2: algebra/calculus, geometry, statistics, physics, chemistry, electronics, construction, business/tax, everyday life. Wave 3: engineering, astronomy, biology, photography, music, advanced finance, country tax, insurance, real estate, and more. Locale homepages promote what that region needs.

## 5. Page anatomy (in order)

1 H1 + one-sentence promise. 2 Calculator above the fold: defaults, live results, primary + grouped secondary, unit toggles, reset, share, copy, print/PDF, show steps. 3 Plain-language result explanation + warnings. 4 Chart/table, accessible. 5 Answer-first summary of 40–70 words. 6 How it works (formula, variables, assumptions, rounding). 7 ≥2 worked examples, verified by tests. 8 Practical guidance. 9 FAQ (4–8, specific). 10 Sources, methodology, last reviewed, reviewer, version/changelog. 11 Related calculators + breadcrumbs. 12 Feedback widget. 400–900 words standard (more for YMYL), never filler, in MDX per locale.

## 6. UX

Live results (<50 ms perceived), forgiving input (`1,000`, `1 000`, `10%`, `$10`), inline validation. Mobile-first: inputmode, ≥44px targets, sticky result bar, no horizontal scroll. Keyboard-first: Enter to the next field, Cmd/Ctrl+K, Esc. URL-encoded state (the server renders defaults, the client hydrates from the URL). localStorage history, favourites, scenarios and preferences, with sensitive inputs kept on the device (and the UI says so). Compare mode for finance and health. Smart search with synonyms and inline answers ("15% of 240"). Dark/light, reduced motion, high contrast. WCAG 2.2 AA with live-region results. Print stylesheet. Embed widgets in Wave 2. No dark patterns.

## 7. Visual design

"The precision instrument." Deliver docs/design-system.md and a `/dev/design` gallery (noindex, robots-blocked) in Phase 1. **Banned:** purple/blue gradient blobs, mesh/aurora, glassmorphism, glowing orbs, generic 3-column icon-card grids, emoji icons, stock illustrations, sparkles, fake testimonials or counts, a centred "Supercharge" hero, the default shadcn look, uniform rounded-2xl, repeated identical card grids, lorem ipsum. **Do:** typography-led design (a distinctive legible pairing via next/font, subset, swap + size-adjust, tabular lining numerals, per-script stacks); a real colour system with one brand hue, a tinted neutral scale, semantic colours and designed dark mode; an 8-pt grid with deliberate asymmetry; the result as the hero (count-up <300 ms, off under reduced motion); custom consistent icons and category glyphs; meaningful micro-interactions; real content in mockups. The homepage leads with the universal input plus top tools by category and locale, and a factual "why North" strip. Breakpoints: 360/768/1280/1920.

## 8. i18n

Locale-prefixed paths with default `en`. No IP/Accept-Language redirect; use a dismissible suggestion banner plus a cookie for users. Slugs are translated per locale. hreflang in both directions + x-default in head and sitemaps; canonicals are self-referencing. Locale order: en; then es, hi, pt-BR, fr, de, id, ar (RTL), ru, tr, ja, it, nl, pl, vi, th, ko, zh-CN, bn, ur. A new locale = config + messages only. A locale goes live only when its UI and content are human-reviewed; MT is a first draft only. No untranslated pages exist under a locale or appear in its sitemap. Full Intl formatting (numbers, dates, plurals, lists, digits, calendars, first day of week). Regional calculators appear only in the relevant region, with the tax year stated. RTL via logical CSS. ICU messages, strict key typing, CI key parity.

## 9. SEO and trust

No scaled content abuse, doorway pages or AI boilerplate (a human SME reviews and is credited). No stuffing, hidden text, cloaking, link schemes or spammy related-search blocks. Ads later only (reserve slots; never above the tool; no CLS). No interstitials. E-E-A-T: author/reviewer pages, last-reviewed dates, methodology, editorial and corrections policy, about/contact with a real entity, privacy, terms. YMYL disclaimers sit near the result; cite primary studies with population caveats. Technical: Metadata API (title 50–60 chars, description, canonical, alternates, OG/Twitter, next/og images per calculator with a sample result); a sitemap index per locale/category with real lastmod; robots (allow content and the major search/AI bots; block /api, /dev, internal search, parameterised dupes); clean URLs with state params canonicalised; true 404/410, 301s, a redirect map; breadcrumbs (UI + JSON-LD); no orphans. JSON-LD: Organization + WebSite (SearchAction) on home, BreadcrumbList, WebApplication/SoftwareApplication per calculator, FAQPage only for visible FAQs, Person for reviewers, no fake ratings. `/llms.txt`, `/llms-full.txt`. Primary content and the default result are in the SSR HTML. HTTPS/HSTS, correct lang/dir. Docs: GSC/Bing setup, docs/seo-launch-checklist.md, docs/growth.md (embeds, open datasets, educator resources, original research, digital PR).

## 10. Performance budgets (release blockers)

p75 mobile 4G mid-range: LCP ≤1.8 s (target 1.2), INP ≤150 ms, CLS ≤0.02, TTFB ≤200 ms on cached edge. JS ≤90 KB gz initial on a calculator page; each calculator chunk ≤30 KB; heavy libraries dynamic. CSS ≤25 KB critical, no CSS-in-JS runtime. Fonts: max 2 families, subset, preload only the critical weight. Images: mostly none; next/image AVIF/WebP. Selective hydration, content-visibility. Immutable assets, SWR, FX revalidation hourly with fallback. PWA/offline. No third parties on the critical path. Lighthouse CI + bundle analyzer + RUM; fail on regression.

## 11. Security and privacy

Strict CSP plus headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy; frame-ancestors open only on /embed/*). Client-side compute; nothing sensitive sent or logged. Safe expression parser (no eval/new Function), with iteration and size caps. Rate-limited APIs, dependency audit, Renovate/Dependabot. Consent banner only if needed.

## 12. Quality gates

Per calculator: pure compute, ≥10 unit tests (typical, boundary, zero, negative, huge, invalid, locale parsing), ≥2 independent authoritative reference cases, worked-example snapshots. Property tests for invariants. Playwright: load, input, update, share round-trip, keyboard-only, no console errors. axe on every template plus manual SR checks. Visual regression for DS components. CI: typecheck, lint, tests, i18n parity, structured-data validation, broken links, Lighthouse, bundle size. Content gate: fail if sources, reviewer, last-reviewed, examples or FAQs are missing, or if similarity is above the threshold.

## 13. Content ops

MDX + typed frontmatter (Git as CMS). A `pnpm new:calculator` generator. docs/editorial-workflow.md (draft → SME review → formula check → translation → publish → re-review every 6–12 months; stale flagging; tax calculators flagged every January). A feedback inbox with a triage workflow.

## 14. Deliverables

docs: competitor-analysis, keyword-and-demand-research, content-guidelines, design-system, decisions, open-questions, growth, seo-launch-checklist, editorial-workflow. CLAUDE.md. The app. Engine + registry + generator. Design system + gallery. Tests + CI. Deployment docs + .env.example.

## 15. Phases

0 Research and plan (no code; wait for approval). 1 Foundation (repo, tooling, CI, tokens, typography, components + gallery, shell, i18n, SEO scaffolding, budgets in CI). 2 Engine + 10 flagship calculators at full quality, then pause for review. 3 Scale Wave 1 (generator, hubs, search, compare, history, PWA, homepage). 4 i18n rollout. 5 Wave 2 + embeds + advanced charts + workers. 6 Launch hardening. 7 Ongoing.

## 16. Definition of Done (per calculator page)

Correct (cited, tested, reviewed); fast (budgets, no CLS, offline); accessible (WCAG 2.2 AA); complete (all §5 sections, unique); localised (only in reviewed locales); discoverable (metadata, JSON-LD, OG, sitemap, linked); trustworthy (sources, reviewer, date, disclaimer); beautiful (design system, no banned patterns).
