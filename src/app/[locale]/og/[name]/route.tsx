import { resolveLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ogImage } from '@/lib/og';

export const dynamic = 'force-static';
export const dynamicParams = false;

/** Static OG images: /{locale}/og/{name}.png. Calculators add their own names in Phase 2. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, name: 'home.png' }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; name: string }> },
) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  return ogImage({ title: t('title'), kicker: t('eyebrow') });
}
