import { resolveLocale } from '@/i18n/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { searchLabels } from '@/i18n/labels';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { Link } from '@/i18n/navigation';
import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, operator, organization, website } from '@/lib/seo/jsonld';
import { calculatorsFor, categoriesFor } from '@/calculators/registry';
import { loadContent } from '@/calculators/content-loader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    ...buildMetadata({
      locale,
      path: '',
      title: t('homeTitle'),
      description: t('homeDescription'),
    }),
    title: { absolute: t('homeTitle') },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'categories' });
  const categories = categoriesFor(locale);
  const calcs = calculatorsFor(locale);
  const names: Record<string, string> = Object.fromEntries(
    await Promise.all(
      calcs.map(async (c) => [c.id, (await loadContent(c.id, locale))!.name] as const),
    ),
  );

  const principles = [
    ['liveTitle', 'liveBody'],
    ['citedTitle', 'citedBody'],
    ['privateTitle', 'privateBody'],
    ['shareTitle', 'shareBody'],
  ] as const;

  return (
    <main>
      <JsonLd json={graph(organization(), operator(), website(locale))} />
      <section className="border-b border-line">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 pt-12 pb-14 sm:pt-20 sm:pb-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-brand uppercase">
              {t('eyebrow')}
            </p>
            <h1 className="mt-4 max-w-[16ch] text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.025em]">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg text-muted">{t('lede')}</p>
            <div className="mt-8 max-w-xl">
              <SearchTrigger variant="hero" labels={await searchLabels(locale)} locale={locale} />
            </div>
          </div>
          {/* Four verifiable principles, set as a numbered margin list rather than feature cards (BRIEF §7). */}
          <aside aria-label={t('principlesTitle')} className="self-end lg:ps-8">
            <ol className="relative space-y-6 border-s border-line ps-6">
              {principles.map(([title, body], i) => (
                <li key={title} className="relative">
                  <span className="num absolute -start-[2.15rem] top-0.5 flex size-5 items-center justify-center rounded-full border border-line bg-bg font-mono text-[10px] text-subtle">
                    {i + 1}
                  </span>
                  <h2 className="font-semibold">{t(`principles.${title}`)}</h2>
                  <p className="mt-1 text-[15px] text-muted">{t(`principles.${body}`)}</p>
                </li>
              ))}
            </ol>
          </aside>
        </Container>
      </section>

      <Container className="py-14">
        {categories.length > 0 ? (
          <section aria-labelledby="browse">
            <h2 id="browse" className="text-2xl font-semibold">
              {t('categoriesTitle')}
            </h2>
            <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <div key={c.key}>
                  <Link
                    href={`/${c.slug[locale]}`}
                    className="flex items-center gap-2 font-semibold hover:text-brand"
                  >
                    <CategoryGlyph category={c.key} />
                    {tc(c.key)}
                  </Link>
                  <ul className="mt-3 space-y-1.5 border-s border-line ps-4 text-[15px]">
                    {calcs
                      .filter((x) => x.category === c.key)
                      .map((x) => (
                        <li key={x.id}>
                          <Link
                            href={`/${c.slug[locale]}/${x.slug[locale]}`}
                            className="text-muted hover:text-text hover:underline"
                          >
                            {names[x.id]}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section aria-labelledby="coming" className="max-w-2xl">
            <h2 id="coming" className="text-xl font-semibold">
              {t('comingTitle')}
            </h2>
            <p className="mt-2 text-muted">{t('comingBody')}</p>
          </section>
        )}
      </Container>
    </main>
  );
}
