import { entriesFor, sitemapFiles, staticAlternates, urlsetXml } from '@/lib/seo/sitemap';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return sitemapFiles().map((f) => ({ file: f.file }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const meta = sitemapFiles().find((f) => f.file === file);
  if (!meta) return new Response('Not found', { status: 404 });
  const xml = urlsetXml(entriesFor(meta.locale, meta.category), staticAlternates);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
