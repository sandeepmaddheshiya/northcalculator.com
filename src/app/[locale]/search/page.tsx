import { resolveLocale } from '@/i18n/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { SearchResults } from '@/components/search/SearchResults';
import { searchLabels } from '@/i18n/labels';

// Internal search results are never indexed (BRIEF §9).
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'search' });
  return (
    <main>
      <Container className="py-10 sm:py-14">
        <h1 className="text-3xl font-semibold">{t('label')}</h1>
        <SearchResults labels={await searchLabels(locale)} locale={locale} />
      </Container>
    </main>
  );
}
