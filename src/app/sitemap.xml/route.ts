import { entriesFor, sitemapFiles, sitemapIndexXml } from '@/lib/seo/sitemap';

export const dynamic = 'force-static';

export function GET() {
  const files = sitemapFiles().map((f) => ({
    file: f.file,
    lastmod:
      entriesFor(f.locale, f.category)
        .map((e) => e.lastmod)
        .sort()
        .at(-1) ?? '',
  }));
  return new Response(sitemapIndexXml(files), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
