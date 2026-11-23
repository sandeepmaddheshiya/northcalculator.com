import type { Locale } from '@/i18n/locales';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LogoMark } from '@/components/brand/Logo';
import { Container } from './Container';
import { categoriesFor } from '@/calculators/registry';
import { SITE } from '@/lib/site';
import { Icon } from '@/components/ui/Icon';

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const tc = await getTranslations({ locale, namespace: 'categories' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const categories = categoriesFor(locale);
  const year = new Date().getFullYear();

  const linkCls = 'text-muted hover:text-text underline-offset-4 hover:underline';
  return (
    <footer className="no-print border-line bg-surface mt-24 border-t">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <LogoMark idPrefix="ftr" className="h-10 w-auto" />
          <p className="text-muted mt-4 flex gap-2 text-sm">
            <Icon name="lock" size={18} className="text-subtle mt-0.5 shrink-0" />
            {tCommon('onDevice')}
          </p>
          <p className="text-subtle mt-3 text-sm">{t('disclaimer')}</p>
        </div>
        {categories.length > 0 && (
          <nav aria-label={t('calculators')}>
            <h2 className="text-subtle text-xs font-semibold tracking-wider uppercase">
              {t('calculators')}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.key}>
                  <Link href={`/${c.slug[locale]}`} className={linkCls}>
                    {tc(c.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <nav aria-label={t('about')}>
          <h2 className="text-subtle text-xs font-semibold tracking-wider uppercase">
            {t('about')}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className={linkCls}>
                {t('about')}
              </Link>
            </li>
            <li>
              <Link href="/methodology" className={linkCls}>
                {t('methodology')}
              </Link>
            </li>
            <li>
              <Link href="/editorial-policy" className={linkCls}>
                {t('editorialPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className={linkCls}>
                {t('contact')}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label={t('legal')}>
          <h2 className="text-subtle text-xs font-semibold tracking-wider uppercase">
            {t('legal')}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/privacy" className={linkCls}>
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className={linkCls}>
                {t('terms')}
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
      <div className="border-line border-t">
        <Container className="text-subtle flex flex-col gap-1 py-5 text-xs sm:flex-row sm:justify-between">
          <p>{t('copyright', { year })}</p>
          <p>
            {t.rich('operatedBy', {
              name: SITE.operator.name,
            })}{' '}
            <a
              href={SITE.operator.url}
              className="hover:text-text underline underline-offset-2"
              rel="author"
            >
              {SITE.operator.url.replace('https://', '')}
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
