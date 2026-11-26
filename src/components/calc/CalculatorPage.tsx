import { getFormatter, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/locales';
import type { CalculatorModule } from '@/calculators/module';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Prose } from '@/components/content/Prose';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbs, faqPage, graph, webApplication } from '@/lib/seo/jsonld';
import { Link } from '@/i18n/navigation';
import { calcChrome, validationMessages } from '@/i18n/labels';
import { getCategory } from '@/calculators/categories';
import { calculatorPath } from '@/calculators/paths';
import { loadContent } from '@/calculators/content-loader';
import { getModule } from '@/calculators/registry';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues, encodeState } from '@/calculators/url-state';
import type { InputValues } from '@/calculators/types';
import { buildToday } from '@/lib/build-date';
import { Icon } from '@/components/ui/Icon';
import { fill } from '@/lib/fill';
import { absoluteUrl } from '@/lib/site';
import { CalculatorIslandFor } from '@/calculators/islands';

/** The template every calculator page follows (BRIEF §5). Server component; only the island hydrates. */
export async function CalculatorPage({ mod, locale }: { mod: CalculatorModule; locale: Locale }) {
  const def = mod.definition;
  const content = (await mod.content[locale]!())!;
  const [data, chrome, validation, t, tc, tcat, format] = await Promise.all([
    mod.data?.(),
    calcChrome(locale),
    validationMessages(locale),
    getTranslations({ locale, namespace: 'calc' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'categories' }),
    getFormatter({ locale }),
  ]);
  const today = buildToday();
  const cat = getCategory(def.category);
  const path = `/${locale}${calculatorPath(def, locale)}`;
  const defaults = defaultValues(def, today);
  const currencyOf = (v: InputValues) =>
    def.currency && 'input' in def.currency
      ? String(v[def.currency.input])
      : def.currency && 'fixed' in def.currency
        ? def.currency.fixed
        : 'USD';
  const fmtFor = (v: InputValues) => makeFmt(locale, currencyOf(v));

  const examples = content.examples.map((ex) => {
    const spec = def.examples.find((e) => e.id === ex.id)!;
    const inputs = { ...defaults, ...spec.inputs } as InputValues;
    const fmt = fmtFor(inputs);
    const r = mod.compute(inputs, {
      today,
      fmt,
      data,
      t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
    });
    const q = encodeState(def, inputs, defaults);
    return { ...ex, node: ex.body(r, fmt, inputs), href: `${path}${q ? `?${q}` : ''}` };
  });

  const related = (
    await Promise.all(
      def.related.map(async (id) => {
        const m = getModule(id);
        if (!m || !m.definition.locales.includes(locale)) return null;
        const c = await loadContent(id, locale);
        return c
          ? { id, name: c.name, promise: c.promise, href: calculatorPath(m.definition, locale) }
          : null;
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null);

  const dateStr = (iso: string) =>
    format.dateTime(new Date(`${iso}T12:00:00Z`), { dateStyle: 'long', timeZone: 'UTC' });
  const toc = [
    ['summary', t('sectionSummary')],
    ['how', t('sectionHow')],
    ['examples', t('sectionExamples')],
    ['guidance', t('sectionGuidance')],
    ['faq', t('sectionFaq')],
    ['sources', t('sectionSources')],
  ] as const;
  const HowItWorks = content.HowItWorks;
  const Guidance = content.Guidance;

  return (
    <main>
      <JsonLd
        json={graph(
          breadcrumbs([
            { name: tc('home'), path: `/${locale}` },
            { name: tcat(def.category), path: `/${locale}/${cat.slug[locale]}` },
            { name: content.name, path },
          ]),
          webApplication({
            name: content.name,
            description: content.description,
            path,
            locale,
            category: def.schemaCategory,
            dateModified: def.contentUpdated,
          }),
          faqPage(content.faqs.map((f) => ({ q: f.q, a: f.a }))),
        )}
      />
      <Container className="pt-6 pb-10 sm:pt-8">
        <Breadcrumbs
          label={tc('breadcrumbs')}
          items={[
            { name: tc('home'), href: '/' },
            { name: tcat(def.category), href: `/${cat.slug[locale]}` },
            { name: content.name },
          ]}
        />
        <header className="mt-5 mb-7 max-w-3xl">
          <h1 className="text-[clamp(1.875rem,1.4rem+2vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
            {content.name}
          </h1>
          <p className="mt-2 text-lg text-muted">{content.promise}</p>
        </header>
        <CalculatorIslandFor
          category={def.category}
          id={def.id}
          locale={locale}
          today={today}
          ui={content.ui}
          chrome={chrome}
          validation={validation}
          data={data}
        />
      </Container>

      <Container className="cv-auto grid grid-cols-[minmax(0,1fr)] gap-12 border-t border-line pt-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="min-w-0">
          <section id="summary" aria-labelledby="h-summary" className="max-w-[68ch]">
            <h2 id="h-summary" className="font-mono text-xs tracking-[0.16em] text-brand uppercase">
              {t('sectionSummary')}
            </h2>
            <p className="mt-3 text-xl leading-relaxed">{content.summary}</p>
          </section>

          <Prose className="mt-4">
            <h2 id="how">{t('sectionHow')}</h2>
            <HowItWorks fmt={fmtFor(defaults)} />

            <h2 id="examples">{t('sectionExamples')}</h2>
            {examples.map((ex) => (
              <section key={ex.id} aria-labelledby={`ex-${ex.id}`}>
                <h3 id={`ex-${ex.id}`}>{ex.title}</h3>
                {ex.node}
                <p>
                  <a href={ex.href} className="inline-flex items-center gap-1.5 font-medium">
                    {t('tryExample')}{' '}
                    <Icon name="arrowRight" size={16} className="rtl:rotate-180" />
                  </a>
                </p>
              </section>
            ))}

            <h2 id="guidance">{t('sectionGuidance')}</h2>
            <Guidance />

            <h2 id="faq">{t('sectionFaq')}</h2>
            <div className="divide-y divide-line border-y border-line">
              {content.faqs.map((f) => (
                <div key={f.q} className="py-4">
                  <h3 className="!mt-0 !mb-1 !text-base">{f.q}</h3>
                  <p className="!my-0 text-muted">{f.a}</p>
                </div>
              ))}
            </div>

            <h2 id="sources">{t('sectionSources')}</h2>
            <ol>
              {def.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener" target="_blank">
                    {s.title}
                  </a>
                  , {s.publisher}
                  {s.locator ? `, ${s.locator}` : ''} (
                  {t('accessed', { date: dateStr(s.accessed) })})
                </li>
              ))}
            </ol>
            <p>
              <strong>{t('rounding')}:</strong> {content.ui[def.roundingKey]}
            </p>
            <p>
              {def.review.status === 'reviewed' && def.review.reviewer && def.review.date
                ? t('reviewed', { name: def.review.reviewer, date: dateStr(def.review.date) })
                : t('reviewPending')}{' '}
              {t('version', { version: def.version, date: dateStr(def.contentUpdated) })}
            </p>
            <details>
              <summary className="cursor-pointer font-medium">{t('changelog')}</summary>
              <ul>
                {def.changelog.map((c) => (
                  <li key={c.version}>
                    <span className="num font-mono text-sm">{c.version}</span> · {dateStr(c.date)}:{' '}
                    {c.note}
                  </li>
                ))}
              </ul>
            </details>
            <p>
              <Link href="/methodology">{t('methodologyLink')}</Link>
            </p>
            <details className="no-print">
              <summary className="cursor-pointer font-medium">{t('embedTitle')}</summary>
              <p>{t('embedBody')}</p>
              <pre className="overflow-x-auto rounded-sm border border-line bg-sunken p-3 font-mono text-xs whitespace-pre-wrap">
                {`<iframe src="${absoluteUrl(`/embed/${locale}/${def.id}`)}" title="${content.name}" width="100%" height="760" style="border:0" loading="lazy"></iframe>`}
              </pre>
            </details>
          </Prose>

          <aside
            aria-labelledby="h-feedback"
            className="mt-12 max-w-[68ch] border-s-2 border-line-strong bg-sunken px-5 py-4"
          >
            <h2 id="h-feedback" className="font-semibold">
              {t('feedbackTitle')}
            </h2>
            <p className="mt-1 text-sm text-muted">{t('feedbackBody')}</p>
            <Link
              href="/contact"
              className="mt-2 inline-block text-sm font-medium text-brand underline underline-offset-4"
            >
              {t('feedbackCta')}
            </Link>
          </aside>
        </article>

        <aside className="no-print min-w-0 lg:sticky lg:top-24 lg:self-start">
          <nav aria-labelledby="h-toc" className="hidden lg:block">
            <h2 id="h-toc" className="text-xs font-semibold tracking-wider text-subtle uppercase">
              {t('onThisPage')}
            </h2>
            <ul className="mt-3 space-y-1.5 border-s border-line ps-4 text-sm">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-muted hover:text-text">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {related.length > 0 && (
            <nav aria-labelledby="h-related" className="lg:mt-10">
              <h2
                id="h-related"
                className="text-xs font-semibold tracking-wider text-subtle uppercase"
              >
                {t('sectionRelated')}
              </h2>
              <ul className="mt-3 space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={r.href} className="font-medium hover:text-brand">
                      {r.name}
                    </Link>
                    <p className="text-sm text-muted">{r.promise}</p>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </Container>
    </main>
  );
}
