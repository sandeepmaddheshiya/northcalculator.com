# Deployment (Cloudflare Pages)

The site is a fully static export (ADR-010), so there's no server to run.

## One-time setup

1. Push the repo to GitHub.
2. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: `pnpm install --frozen-lockfile && pnpm build`
   - Build output directory: `out`
   - Environment variables (Production and Preview):
     - `NEXT_PUBLIC_SITE_URL` = `https://northcalculator.com` (for Preview, the preview URL is fine; previews should not be indexed, see below)
     - `NODE_VERSION` = `24`
     - `PNPM_VERSION` = `11.17.0`
4. **Custom domains:** add `northcalculator.com` and `www.northcalculator.com`. Add a redirect rule (Rules → Redirect Rules) that sends `www` to the apex with a 301.
5. **SSL/TLS:** Full (strict). Turn on "Always Use HTTPS". HSTS is already sent by `public/_headers`.
6. **Preview deployments:** in Pages settings, add the header `X-Robots-Tag: noindex` for `*.pages.dev`, or enable Cloudflare Access on previews, so preview URLs are never indexed.

## Daily rebuild (currency snapshot, ADR-007)

Create a Deploy Hook (Pages → Settings → Builds → Deploy hooks) and call it once a day, for example from a Cloudflare Worker Cron Trigger (`0 6 * * *`) that `POST`s to the hook URL. Keep the hook URL secret.

## What Cloudflare reads from the build

- `out/_headers`: security headers, cache rules, and the `/embed/*` frame policy.
- `out/_redirects`: `/` → `/en` (301).
- `out/404.html`: served with a real 404 status for unknown URLs.
- Per-page CSP is a `<meta>` tag injected by `scripts/postbuild.mjs`.

## After the first deploy

Follow `docs/seo-launch-checklist.md` for header checks and the Search Console and Bing Webmaster setup. In short:

- Verify the domain in Google Search Console (DNS TXT record) and submit `https://northcalculator.com/sitemap.xml`.
- Do the same in Bing Webmaster Tools (it can import from GSC).

## Environment variables

See `.env.example`. Only `NEXT_PUBLIC_SITE_URL` is required.
