# NorthCalculator: working agreement for Claude Code

Read `BRIEF.md` (the owner's brief, condensed) and `docs/decisions.md` (ADRs) before changing anything. The brief's rules are binding. Deviations need an ADR.

## Status

- Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ (10 flagships) · Phase 3: infrastructure ✅ (generator, inline search answers, history/saved, compare, PWA/offline, homepage samples); Wave 1 at 71 of ~90 calculators; Wave 2 in progress (geometry: 4, statistics: 3, physics: 2, electronics: 2) (docs/taxonomy-and-wave1.md).
- Phase 4: tooling and runbook ✅ (`pnpm i18n:status`, docs/i18n-rollout.md); no locale goes live until a fluent reviewer signs it off (ADR-026).
- Phase 5: embeds ✅ (`/embed/{locale}/{id}`, ADR-024); workers deferred (ADR-025); Wave 2 calculators not started.
- Phase 6: launch docs ✅ (docs/seo-launch-checklist.md, docs/growth.md); deploy, DNS and Search Console need the owner.
- Phase 7: `pnpm check:stale` flags overdue reviews. All calculators are `review: pending` until the owner reviews them (ADR-011).
- Next: more Wave 1 calculators via `pnpm new:calculator`, highest demand first.

## Commands

|                                       |                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`                            | Dev server (http://localhost:3000/en, gallery at /dev/design)                         |
| `pnpm build`                          | Static export to `out/` + `scripts/postbuild.mjs` (per-page CSP hashes + page checks) |
| `pnpm start`                          | Serve `out/` like Cloudflare Pages                                                    |
| `pnpm check`                          | typecheck + lint + unit tests + i18n parity                                           |
| `pnpm test`                           | Vitest: formulas, parser, token contrast, content gate, JSON-LD                       |
| `pnpm e2e`                            | Playwright + axe on mobile 360px and desktop (needs `pnpm build`)                     |
| `pnpm check:bundle`                   | Gzip JS/CSS per page vs `budgets.json`                                                |
| `pnpm lhci`                           | Lighthouse CI budgets (`lighthouserc.json`)                                           |
| `pnpm check:i18n`                     | Key parity across locales, no unused keys                                             |
| `pnpm check:links`                    | Every cited source URL resolves (403 from bot-blocking sites is a warning)            |
| `pnpm rates`                          | Refresh the currency snapshot (also runs at the start of `pnpm build`)                |
| `pnpm new:calculator <category> <id>` | Scaffold + register a calculator (TODO markers fail the content gate)                 |
| `pnpm i18n:status`                    | Per-locale UI and content coverage                                                    |
| `pnpm check:stale`                    | Calculators overdue for review; `--strict` exits non-zero                             |

End of every phase: run all of the above, fix everything, commit (Conventional Commits), and summarise.

## Architecture (key facts)

- **Hosting:** Cloudflare Pages, `output: 'export'` (ADR-010). No middleware, ISR or server. Headers and redirects live in `public/_headers` / `public/_redirects`. Never use features that need a Node server.
- **Routing:** `src/app/[locale]/…`. Only `status: 'live'` locales in `src/i18n/locales.ts` are routed. `/` → `/en` 301.
- **i18n:** next-intl runs **server-side only**. Client islands must NOT call `useTranslations`. Pass pre-translated labels as props (see `src/i18n/labels.ts`) and use `fill()` for `{placeholders}`. Use `Link` from `@/i18n/navigation` (a server component) in RSC. In client components use plain `<a>`/`next/link` with an explicit locale.
- **Locale typing:** narrow route params with `resolveLocale()` from `@/i18n/server`.
- **Calculators:** one folder each: `definition.ts`, `compute.ts`, `compute.test.ts`, `content.en.tsx` (ADR-019), `Island.tsx`, `index.ts`. Register the module in `src/calculators/registry.ts` **and** its island in `src/calculators/islands.tsx` (client map, ADR-020; never import islands from server code). Compute is pure and deterministic. Money is integer minor units (ADR-017, `src/engine/money.ts`), not decimal.js. Text outputs use `ctx.t` + `Intl.PluralRules` (ADR-021). Build-time data (currency rates) comes through `module.data` → `ctx.data`.
- **Generic island features:** `showIf`, `labelBy` (inputs and outputs), `hidden` inputs, `reroll` (seeded random tools, ADR-027), `time` inputs and list cells (HH:MM, `engine/clock.ts`), `advanced`, `optionsBy` (dependent selects), `swapWith`, list inputs (rows), formats `sig`/`duration`/`text`. Prefer extending these over writing a custom island. Only the scientific calculator has a custom one.
- **Tests per calculator:** ≥2 independent reference sources (textbook/standard values verified by fetching the source), property tests, and the worked-example check. When a printed reference value is off by a rounding step, assert the exact value and say why (ADR-022). The content gate checks title/description/summary/FAQ lengths, ui keys, banned phrases and near-duplicates.
- **SEO:** `buildMetadata()` (self-canonical, hreflang only to locales where the page exists, x-default); JSON-LD builders in `src/lib/seo/jsonld.ts` (mark up only visible content, never ratings); sitemap index at `/sitemap.xml` → `/sitemaps/{locale}-{category}.xml`; `/llms.txt`; OG images are build-time PNG routes at `/{locale}/og/{name}.png`.
- **Design:** tokens in `src/app/globals.css` (semantic only; `tokens.test.ts` enforces contrast). See `docs/design-system.md`. Banned patterns are listed in BRIEF §7.

## Rules that are easy to break

- No hardcoded domain: use `SITE.url` / `absoluteUrl()` (`NEXT_PUBLIC_SITE_URL`).
- Every formula needs a cited primary source plus ≥10 tests with ≥2 independent reference values. Never guess: log it in `docs/open-questions.md`.
- Never claim a feature or fact that isn't true yet (e.g. search placeholder copy). Never show a review date for an unreviewed page (ADR-011).
- No placeholder or lorem copy (postbuild fails on it). Exactly one `<h1>` per page.
- No horizontal scroll at 360px (E2E checks it). Mobile CSS grids must declare `grid-cols-[minmax(0,1fr)]`; implicit `auto` columns grow to fit wide content (formulas, buttons). Use logical CSS properties (`ms-`, `pe-`, `start-`) for RTL.
- Lazy-load heavy libraries (mathjs, charts, MiniSearch, PDF). Keep each calculator chunk ≤ 30 KB gz.
- No `eval` / `new Function` (lint error).
- Only add new third-party origins to `CONNECT` in `scripts/postbuild.mjs` with an ADR.
- Commit messages follow Conventional Commits (enforced by the hook).
