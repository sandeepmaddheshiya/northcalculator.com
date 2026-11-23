import { LIVE_LOCALE_CODES } from '@/i18n/locales';
import { calculatorsFor, categoriesFor } from '@/calculators/registry';
import { getCategory } from '@/calculators/categories';
import { SITE, absoluteUrl } from '@/lib/site';

export interface SitemapEntry {
  path: string;
  /** Real content-change date only, never the build time (BRIEF §9). */
  lastmod: string;
}

export const STATIC_PAGES = [
  '',
  '/about',
  '/methodology',
  '/editorial-policy',
  '/contact',
  '/privacy',
  '/terms',
] as const;

/** Sitemap files: one for static pages per locale, one per category per locale. */
export function sitemapFiles(): { file: string; locale: string; category?: string }[] {
  const out: { file: string; locale: string; category?: string }[] = [];
  for (const locale of LIVE_LOCALE_CODES) {
    out.push({ file: `${locale}-pages.xml`, locale });
    for (const c of categoriesFor(locale))
      out.push({ file: `${locale}-${c.key}.xml`, locale, category: c.key });
  }
  return out;
}

export function entriesFor(locale: string, category?: string): SitemapEntry[] {
  if (!category) {
    return STATIC_PAGES.map((p) => ({ path: `/${locale}${p}`, lastmod: SITE.policiesUpdated }));
  }
  const cat = categoriesFor(locale).find((c) => c.key === category);
  if (!cat) return [];
  const calcs = calculatorsFor(locale).filter((c) => c.category === category);
  const latest =
    calcs
      .map((c) => c.contentUpdated)
      .sort()
      .at(-1) ?? SITE.policiesUpdated;
  return [
    { path: `/${locale}/${cat.slug[locale]}`, lastmod: latest },
    ...calcs.map((c) => ({
      path: `/${locale}/${getCategory(c.category).slug[locale]}/${c.slug[locale]}`,
      lastmod: c.contentUpdated,
    })),
  ];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** hreflang alternates are emitted only between locales where the page exists. */
export function urlsetXml(
  entries: SitemapEntry[],
  alternates: (path: string) => Record<string, string>,
): string {
  const body = entries
    .map((e) => {
      const alts = Object.entries(alternates(e.path))
        .map(
          ([hl, p]) =>
            `<xhtml:link rel="alternate" hreflang="${hl}" href="${esc(absoluteUrl(p))}"/>`,
        )
        .join('');
      return `<url><loc>${esc(absoluteUrl(e.path))}</loc><lastmod>${e.lastmod}</lastmod>${alts}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

export function sitemapIndexXml(files: { file: string; lastmod: string }[]): string {
  const body = files
    .map(
      (f) =>
        `<sitemap><loc>${absoluteUrl(`/sitemaps/${f.file}`)}</loc><lastmod>${f.lastmod}</lastmod></sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

/** Same-path alternates across live locales for static pages (calculators pass their own map in Phase 4). */
export function staticAlternates(path: string): Record<string, string> {
  const rest = path.replace(/^\/[^/]+/, '');
  const out: Record<string, string> = {};
  for (const l of LIVE_LOCALE_CODES) out[l] = `/${l}${rest}`;
  out['x-default'] = `/en${rest}`;
  return out;
}
