import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';
import { Container } from '@/components/layout/Container';
import { Link } from '@/i18n/navigation';

// Shown by the service worker when a page that was never visited is requested offline.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OfflinePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'offline' });
  return (
    <main>
      <Container className="max-w-2xl py-16">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <p className="mt-3 text-lg text-muted">{t('body')}</p>
        <p className="mt-6">
          <Link href="/" className="font-medium text-brand underline underline-offset-4">
            {t('home')}
          </Link>
        </p>
      </Container>
    </main>
  );
}
