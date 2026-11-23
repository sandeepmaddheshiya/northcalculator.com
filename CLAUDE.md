# NorthCalculator: working agreement for Claude Code

Read `BRIEF.md` (the owner's brief, condensed) and `docs/decisions.md` (ADRs) before changing anything. The brief's rules are binding. Deviations need an ADR.

## Status

- Phase 0 (research) ✅ · Phase 1 (foundation) ✅ awaiting owner review of the design (`/dev/design`) and ADR-015.
- Next: Phase 2: engine + 10 flagship calculators (percentage, mortgage, loan/EMI, compound interest, BMI, age, unit converter, scientific, GPA, currency).

## Commands

|                     |                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`          | Dev server (http://localhost:3000/en, gallery at /dev/design)                         |
| `pnpm build`        | Static export to `out/` + `scripts/postbuild.mjs` (per-page CSP hashes + page checks) |
| `pnpm start`        | Serve `out/` like Cloudflare Pages                                                    |
| `pnpm check`        | typecheck + lint + unit tests + i18n parity                                           |
| `pnpm test`         | Vitest: formulas, parser, token contrast, content gate, JSON-LD                       |
| `pnpm e2e`          | Playwright + axe on mobile 360px and desktop (needs `pnpm build`)                     |
| `pnpm check:bundle` | Gzip JS/CSS per page vs `budgets.json`                                                |
| `pnpm lhci`         | Lighthouse CI budgets (`lighthouserc.json`)                                           |
| `pnpm check:i18n`   | Key parity across locales, no unused keys                                             |

End of every phase: run all of the above, fix everything, commit (Conventional Commits), and summarise.

## Architecture (key facts)

- **Hosting:** Cloudflare Pages, `output: 'export'` (ADR-010). No middleware, ISR or server. Headers and redirects live in `public/_headers` / `public/_redirects`. Never use features that need a Node server.
- **Routing:** `src/app/[locale]/…`. Only `status: 'live'` locales in `src/i18n/locales.ts` are routed. `/` → `/en` 301.
- **i18n:** next-intl runs **server-side only**. Client islands must NOT call `useTranslations`. Pass pre-translated labels as props (see `src/i18n/labels.ts`) and use `fill()` for `{placeholders}`. Use `Link` from `@/i18n/navigation` (a server component) in RSC. In client components use plain `<a>`/`next/link` with an explicit locale.
- **Locale typing:** narrow route params with `resolveLocale()` from `@/i18n/server`.
- **Calculators:** contract in `src/calculators/types.ts`, registered in `src/calculators/registry.ts`. Compute is pure and deterministic. Money uses decimal.js. Parse input with `parseLocaleNumber`, format with `formatNumber` (`src/engine`).
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
