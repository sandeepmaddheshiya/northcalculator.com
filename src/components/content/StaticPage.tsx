import type { Locale } from '@/i18n/locales';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Prose } from './Prose';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbs, graph } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { SITE } from '@/lib/site';
import {
  STATIC_PAGES,
  STATIC_PAGE_DESCRIPTIONS,
  STATIC_PAGE_PATHS,
  type StaticPageId,
} from '@/content/pages';

export async function staticPageMetadata(locale: Locale, id: StaticPageId): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pages' });
  return buildMetadata({
    locale,
    path: STATIC_PAGE_PATHS[id],
    title: `${t(id)} · ${SITE.name}`,
    description: STATIC_PAGE_DESCRIPTIONS[locale]?.[id] ?? '',
    availableLocales: Object.keys(STATIC_PAGES).filter((l) => STATIC_PAGES[l]?.[id]),
  });
}

export async function StaticPage({ locale, id }: { locale: Locale; id: StaticPageId }) {
  setRequestLocale(locale);
  const Body = STATIC_PAGES[locale]?.[id];
  if (!Body) notFound();
  const t = await getTranslations({ locale, namespace: 'pages' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const format = await getFormatter({ locale });
  const title = t(id);
  return (
    <main>
      <JsonLd
        json={graph(
          breadcrumbs([
            { name: tc('home'), path: `/${locale}` },
            { name: title, path: `/${locale}${STATIC_PAGE_PATHS[id]}` },
          ]),
        )}
      />
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          label={tc('breadcrumbs')}
          items={[{ name: tc('home'), href: '/' }, { name: title }]}
        />
        <h1 className="mt-6 text-3xl font-semibold sm:text-[2.5rem] sm:leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-subtle">
          {tc('lastUpdated', {
            date: format.dateTime(new Date(SITE.policiesUpdated), { dateStyle: 'long' }),
          })}
        </p>
        <Prose className="mt-8">
          <Body />
        </Prose>
      </Container>
    </main>
  );
}
