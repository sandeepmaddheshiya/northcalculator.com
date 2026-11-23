# Architecture decision records

Short ADRs. Status: Proposed → Accepted (after owner approval) → Superseded.

## ADR-001: Stack as specified in BRIEF §2

- **Status:** Accepted 2026-11-23
- **Decision:** Next.js 16.4.6 (App Router), React 19.3, TypeScript 6.0.3 strict (TS 7 / tsgo skipped until the ESLint and Next.js type tooling officially support it) + `noUncheckedIndexedAccess`, Tailwind v4 with a CSS-variable token layer, next-intl, Vitest, Playwright, Lighthouse CI, pnpm.
- **Why:** This stack was already decided in the brief. We confirm the exact versions in Phase 1 against npm, using no version released less than 2 weeks before.

## ADR-002: Headless primitives = Radix UI (selective), native elements first

- **Status:** Accepted 2026-11-23
- **Decision:** Use native `<input>`, `<select>`, `<details>` wherever they're accessible enough. Import individual Radix primitives only for popover, dialog, tabs and toggle-group.
- **Why:** Per-primitive packages keep the 90 KB JS budget achievable. React Aria is excellent but its dependency graph is heavier on the calculator island.

## ADR-003: Taxonomy is flat, one category per calculator

- **Status:** Accepted 2026-11-23
- **Decision:** URLs are `/{locale}/{category}/{slug}`. Subcategories are only on-page groupings.
- **Why:** URLs stay stable as the catalogue grows, and there are no duplicate URLs from cross-listing. See taxonomy-and-wave1.md.

## ADR-004: Number handling

- **Status:** Accepted 2026-11-23
- **Decision:** Money and percentages that compound use decimal.js. Physics and everyday maths use `number` with an explicit per-calculator rounding policy. mathjs is lazy-loaded only for the scientific calculator. Parsing uses a locale-aware parser that accepts `1,234.56`, `1.234,56`, `1 234,56` and `12,34,567` (Indian grouping).
- **Why:** This avoids floating-point money bugs without paying for decimal.js on every page.

## ADR-005: Date arithmetic is calendar-date based

- **Status:** Accepted 2026-11-23
- **Decision:** Age, date difference and add-days work on plain calendar dates (Y-M-D), never on epoch ms. This avoids DST and time zone off-by-one errors. Time-zone conversion uses `Intl` / IANA tzdb. We evaluate the `Temporal` polyfill in Phase 1 and use native `Temporal` where available.

## ADR-006: Indian English formatting inside the `en` locale

- **Status:** Accepted 2026-11-23
- **Decision:** `en` content is shared, but number formatting follows the user's region preference (auto-suggested, stored locally): `en-US`, `en-GB` or `en-IN` (lakh/crore). This doesn't create separate URLs. Regional calculators (India income tax, UK take-home) are separate pages with their own slugs.
- **Why:** India is about 27% of the market leader's traffic. Separate `en-IN` URLs would duplicate content.

## ADR-007: Currency data provider (all currencies)

- **Status:** Accepted 2026-11-23 (owner asked for all country currencies; supersedes the ECB-only proposal)
- **Decision:** The primary source is the ExchangeRate-API open endpoint (`open.er-api.com`, no key, 160+ ISO 4217 currencies, updated daily, attribution link required). The fallback is the `@fawazahmed0/currency-api` daily JSON (served from jsDelivr). At build time a snapshot is embedded so the page renders a real default result without JS. On the client, the page refreshes from the primary source and falls back to the secondary source, then to the snapshot. The UI shows the rate timestamp and source and says "reference rates, updated daily", never "live". A daily Cloudflare deploy-hook rebuild keeps the snapshot fresh.
- **Why:** No free source with full currency coverage offers intraday rates. Daily reference rates, stated honestly, are good enough for a converter.

## ADR-008: Crawlers and AI bots allowed

- **Status:** Accepted
- **Decision:** robots.txt allows Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended, per the brief. It blocks `/api/`, `/dev/`, internal search and the search index.
- **Deviation from BRIEF §9:** URLs with calculator-state query parameters are **not** blocked in robots.txt. Every such URL carries a canonical to the clean URL. Google's guidance is that robots-blocking a URL hides its canonical tag and can leave the URL indexed without content, so the canonical tag is the correct tool here.

## ADR-009: Logo

- **Status:** Accepted 2026-11-23
- **Decision:** The owner's logo (`brand/northcalculator-logo-source.png`, 2172×724 raster) is the brand mark. In Phase 1 we redraw it as a clean SVG (a full lockup, a mark-only version, and a 16/32 px favicon simplification) and take brand colours from it. Sampled colours: navy ≈ `#021B3A`, blue ≈ `#0A5CC0` → `#0A6FE0`. The compass "N" motif is the owner's chosen mark and appears in the logo only, not as decoration across the site (BRIEF §7).

## ADR-010: Hosting = Cloudflare Pages, fully static export

- **Status:** Accepted 2026-11-23 (owner: Cloudflare Pages)
- **Decision:** `output: 'export'` produces a static site that Cloudflare Pages serves from `out/`. There is no Node server, middleware or ISR. Consequences:
  - Locale routing is static (`/en/...`), and `/` 301-redirects to `/en` through `public/_redirects`. There is no IP or Accept-Language redirect, which matches the brief anyway.
  - Security headers come from `public/_headers`. Static export can't use per-request nonces, so a post-build script computes SHA-256 hashes of each page's inline scripts and injects a per-page `<meta http-equiv="Content-Security-Policy">`. `frame-ancestors` (which a meta tag can't carry) is set in `_headers`.
  - Changing data (currency) is refreshed client-side, with a build-time snapshot and a daily scheduled rebuild (ADR-007).
  - OG images, the sitemap, robots and llms.txt are generated at build time.
- **Why:** Static output is the fastest and cheapest option, and it keeps us host-agnostic. If we ever need a server, we can move to `@opennextjs/cloudflare` (Workers) without changing app code.

## ADR-011: Reviewer and publishing policy

- **Status:** Accepted 2026-11-23 (owner decision)
- **Decision:** The owner is the reviewer for all pages for now and will review them one by one after deploying. Every calculator has `review: { status: 'pending' | 'reviewed', reviewer, date }`. Pages are built and deployed regardless. The page shows an honest status: while pending, it says "Formulas verified against cited sources by automated tests; editorial review pending". Once reviewed, it shows "Reviewed by {name} on {date}". We never show a reviewed date for a page nobody has reviewed. A build flag `NOINDEX_UNREVIEWED_YMYL` (default `false`, per the owner) can noindex pending YMYL pages if we need it later.

## ADR-012: No keyword tools; demand from live SERP observation

- **Status:** Accepted 2026-11-23 (owner)
- **Decision:** Prioritise by public SERP evidence (autocomplete, People Also Ask, competitor coverage, public third-party snapshots). After launch, re-prioritise using Search Console.

## ADR-013: No analytics at launch

- **Status:** Accepted 2026-11-23 (owner: "leave it")
- **Decision:** Ship without analytics or cookies, so no consent banner is needed. Optional later: Cloudflare Web Analytics, which is cookieless.

## ADR-014: Typography = IBM Plex Sans + IBM Plex Mono

- **Status:** Accepted 2026-11-23
- **Decision:** Plex Sans for UI and text, and Plex Mono for formulas, units, step working and data tables. Both are self-hosted through `next/font`. Script coverage uses the Plex sister families per locale (Devanagari, Arabic, Thai, JP, KR), which keeps one consistent voice across scripts. Plex has true tabular and lining figures.
- **Why:** Plex was drawn as an engineer's typeface. That fits the "precision instrument" concept, and it has the widest matched script family of any open superfamily. Two families total, within budget.

## ADR-015: JavaScript budget vs the framework floor

- **Status:** Proposed, needs owner decision. CI currently enforces the interim value in `budgets.json`.
- **Context:** BRIEF §10 sets ≤ 90 KB gz initial JS _including the framework_. Measured on this repo (2026-11-23): a page with **zero** client components loads **129 KB gz** on Next.js 16.4 + React 19.3 (React DOM ≈ 70 KB, App Router runtime ≈ 45 KB, router and Turbopack runtime ≈ 14 KB). Legacy polyfills (38 KB) are `nomodule`, so modern browsers skip them and they're excluded. Our own code adds about 11 KB (header search, theme toggle, icons). We already removed next-intl's client runtime (−16 KB) by passing pre-translated labels to islands.
- **Real-world impact measured:** Lighthouse mobile (simulated 4G, mid-tier CPU) scores **100/100/100/100**, with LCP 0.90 s, CLS 0.000 and TBT 40–84 ms. All CWV budgets in BRIEF §10 pass by a wide margin.
- **Options:**
  1. **Keep Next.js and redefine the budget** as framework floor + own code: total ≤ 150 KB gz on content pages, ≤ 180 KB on calculator pages, with own code ≤ 20 KB per content page and each calculator chunk ≤ 30 KB (unchanged). The CWV budgets stay as release blockers. _(Recommended: the CWV targets that users and Google actually experience are already met, and the brief's architecture stays intact.)_
  2. **Switch to Astro + Preact islands:** about 15–40 KB per page, so the 90 KB budget holds easily, but it means rebuilding the foundation and departs from BRIEF §2.
  3. **Keep Next.js and try to strip React from content pages:** not possible with the App Router. Every page hydrates the React runtime.

## ADR-016: English spelling

- **Status:** Accepted 2026-11-23
- **Decision:** The `en` locale uses US spelling ("math", "color"), matching the largest English search market (and the leading competitor). UK/IN users get region-aware number formatting (ADR-006), not separate spelling.
