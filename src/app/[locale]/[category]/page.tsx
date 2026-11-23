import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';
import { routing } from '@/i18n/routing';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { Link } from '@/i18n/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbs, graph } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { calculatorsFor, categoriesFor } from '@/calculators/registry';
import { calculatorPath } from '@/calculators/paths';
import { loadContent } from '@/calculators/content-loader';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categoriesFor(locale).map((c) => ({ locale, category: c.slug[locale]! })),
  );
}

function findCategory(locale: string, slug: string) {
  return categoriesFor(locale).find((c) => c.slug[locale] === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const cat = findCategory(locale, p.category);
  if (!cat) return {};
  const t = await getTranslations({ locale, namespace: 'categoryHub' });
  const tc = await getTranslations({ locale, namespace: 'categories' });
  return buildMetadata({
    locale,
    path: `/${cat.slug[locale]}`,
    title: t('title', { name: tc(cat.key) }),
    description: t(`intro.${cat.key}`).slice(0, 158),
  });
}

export default async function CategoryHub({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  setRequestLocale(locale);
  const cat = findCategory(locale, p.category);
  if (!cat) notFound();
  const [t, tc, tcommon] = await Promise.all([
    getTranslations({ locale, namespace: 'categoryHub' }),
    getTranslations({ locale, namespace: 'categories' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const calcs = await Promise.all(
    calculatorsFor(locale)
      .filter((c) => c.category === cat.key)
      .map(async (c) => ({ def: c, content: (await loadContent(c.id, locale))! })),
  );
  const name = tc(cat.key);
  return (
    <main>
      <JsonLd
        json={graph(
          breadcrumbs([
            { name: tcommon('home'), path: `/${locale}` },
            { name, path: `/${locale}/${cat.slug[locale]}` },
          ]),
          {
            '@type': 'CollectionPage',
            name: t('title', { name }),
            url: `${SITE.url}/${locale}/${cat.slug[locale]}`,
            hasPart: calcs.map((c) => ({
              '@type': 'WebApplication',
              name: c.content.name,
              url: `${SITE.url}/${locale}${calculatorPath(c.def, locale)}`,
            })),
          },
        )}
      />
      <Container className="py-8 sm:py-12">
        <Breadcrumbs
          label={tcommon('breadcrumbs')}
          items={[{ name: tcommon('home'), href: '/' }, { name }]}
        />
        <header className="mt-6 max-w-3xl">
          <h1 className="flex items-center gap-3 text-[clamp(1.875rem,1.4rem+2vw,2.75rem)] font-semibold tracking-[-0.02em]">
            <CategoryGlyph category={cat.key} size={36} />
            {t('title', { name })}
          </h1>
          <p className="mt-4 text-lg text-muted">{t(`intro.${cat.key}`)}</p>
        </header>
        <ul className="mt-10 grid grid-cols-[minmax(0,1fr)] border-t border-line sm:grid-cols-2">
          {calcs.map(({ def, content }) => (
            <li
              key={def.id}
              className="border-b border-line py-5 sm:odd:pe-8 sm:even:border-s sm:even:ps-8"
            >
              <Link
                href={calculatorPath(def, locale)}
                className="text-lg font-semibold hover:text-brand"
              >
                {content.name}
              </Link>
              <p className="mt-1 text-muted">{content.promise}</p>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
