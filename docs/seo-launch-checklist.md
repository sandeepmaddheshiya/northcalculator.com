# SEO launch checklist

Run through this list when the site first goes live on the production domain, and again after any change to routing, headers or the sitemap. Items marked **(owner)** need account access that only the site owner has.

## 1. Before pointing the domain

- [ ] `NEXT_PUBLIC_SITE_URL=https://northcalculator.com` is set in the Cloudflare Pages production environment (see `.env.example`).
- [ ] `pnpm build` passes locally and in CI, including `check:bundle`, `e2e` and `lhci`.
- [ ] `pnpm check:links` reports 0 broken source links.
- [ ] Every calculator still shows "editorial review pending" unless you have reviewed it (ADR-011). Update `review` in its `definition.ts` after reviewing.

## 2. Right after the first deploy

- [ ] `https://northcalculator.com/` returns **301** to `/en`.
- [ ] A random unknown URL returns a real **404** status.
- [ ] `curl -sI https://northcalculator.com/en` shows HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Content-Security-Policy: frame-ancestors 'none'…`.
- [ ] `curl -sI https://northcalculator.com/embed/en/mortgage` shows exactly **one** `Content-Security-Policy` header with `frame-ancestors *` and **no** `X-Frame-Options` (ADR-024). If two CSP values appear joined by a comma, the detach rule in `public/_headers` is not being applied.
- [ ] `https://<project>.pages.dev/en` returns `X-Robots-Tag: noindex`.
- [ ] `/robots.txt`, `/sitemap.xml`, `/sitemaps/en-finance.xml`, `/llms.txt` and `/llms-full.txt` load and use the production domain.
- [ ] View source on one calculator page: one `<h1>`, self-referencing canonical, `hreflang="en"` and `x-default`, JSON-LD with `BreadcrumbList`, `WebApplication` and `FAQPage`, and the default result in the HTML.
- [ ] The OG image `/en/og/mortgage.png` renders, and a link shared in a chat app shows it.

## 3. Search engines (owner)

- [ ] Google Search Console: verify the domain property with a DNS TXT record and submit `https://northcalculator.com/sitemap.xml`.
- [ ] Bing Webmaster Tools: import from Search Console or verify separately, and submit the sitemap. Other search services also use Bing’s index.
- [ ] Use URL Inspection on the homepage and two calculators and request indexing.
- [ ] Rich results test on one calculator page: FAQPage and breadcrumbs are valid. No warnings about review ratings (we deliberately publish none).

## 4. First four weeks

- [ ] Search Console → Pages: no unexpected "Excluded by noindex" or "Duplicate without user-selected canonical" for calculator URLs. URLs with `?` state parameters should be "Alternate page with proper canonical tag", which is expected (ADR-008).
- [ ] Core Web Vitals report: all URLs good once enough Chrome data exists (budgets: LCP ≤ 1.8 s, INP ≤ 150 ms, CLS ≤ 0.02).
- [ ] Re-prioritise the Wave 1 backlog using real Search Console queries (ADR-012).

## 5. Every release

- [ ] CI green (typecheck, lint, format, unit and content gate, i18n parity, audit, build, bundle budgets, e2e + axe, Lighthouse).
- [ ] New calculators are in the sitemap with a real `lastmod`, linked from their category hub, and listed in `/llms.txt`.
- [ ] `pnpm check:stale` shows nothing overdue, or the overdue pages are scheduled for review.
