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

  const linkCls =
    'inline-block py-0.5 text-muted hover:text-text underline-offset-4 hover:underline';
  return (
    <footer className="no-print mt-24 border-t border-line bg-surface">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <LogoMark idPrefix="ftr" className="h-10 w-auto" />
          <p className="mt-4 flex gap-2 text-sm text-muted">
            <Icon name="lock" size={18} className="mt-0.5 shrink-0 text-subtle" />
            {tCommon('onDevice')}
          </p>
          <p className="mt-3 text-sm text-subtle">{t('disclaimer')}</p>
        </div>
        {categories.length > 0 && (
          <nav aria-label={t('calculators')}>
            <h2 className="text-xs font-semibold tracking-wider text-subtle uppercase">
              {t('calculators')}
            </h2>
            <ul className="mt-3 space-y-1 text-sm">
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
          <h2 className="text-xs font-semibold tracking-wider text-subtle uppercase">
            {t('about')}
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
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
          <h2 className="text-xs font-semibold tracking-wider text-subtle uppercase">
            {t('legal')}
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
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
      <div className="border-t border-line">
        <Container className="flex flex-col gap-1 py-5 text-xs text-subtle sm:flex-row sm:justify-between">
          <p>{t('copyright', { year })}</p>
          <p>
            {t.rich('operatedBy', {
              name: SITE.operator.name,
            })}{' '}
            <a
              href={SITE.operator.url}
              className="underline underline-offset-2 hover:text-text"
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
