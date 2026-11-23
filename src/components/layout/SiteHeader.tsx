import type { Locale } from '@/i18n/locales';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/brand/Logo';
import { Container } from './Container';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from './LocaleSwitcher';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { localeLabels, searchLabels, themeLabels } from '@/i18n/labels';

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [t, search, theme, loc] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    searchLabels(locale),
    themeLabels(locale),
    localeLabels(locale),
  ]);
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-[6px] supports-[backdrop-filter]:bg-bg/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:shadow"
      >
        {t('skipToContent')}
      </a>
      <Container className="flex h-14 items-center gap-3 sm:h-16">
        <Link
          href="/"
          className="-ms-1 flex shrink-0 items-center rounded-sm p-1"
          aria-label={`NorthCalculator, ${t('home')}`}
        >
          <Logo idPrefix="hdr" className="h-7 w-auto sm:h-8" />
        </Link>
        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <SearchTrigger labels={search} locale={locale} />
          <LocaleSwitcher labels={loc} locale={locale} />
          <ThemeToggle labels={theme} />
        </div>
      </Container>
    </header>
  );
}
