import { resolveLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildSearchIndex } from '@/lib/search-index';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale });
  const tPages = await getTranslations({ locale, namespace: 'pages' });
  const docs = buildSearchIndex(
    locale,
    (k) => t(k as never),
    (k) => tPages(k as never),
  );
  return Response.json(docs);
}
