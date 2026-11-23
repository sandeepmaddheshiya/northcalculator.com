import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { resolveLocale } from '@/i18n/server';
import { MODULES, getModule } from '@/calculators/registry';
import { calculatorPath } from '@/calculators/paths';
import { calcChrome, validationMessages } from '@/i18n/labels';
import { CalculatorIslandFor } from '@/calculators/islands';
import { buildToday } from '@/lib/build-date';
import { absoluteUrl } from '@/lib/site';

export const dynamicParams = false;

/** /embed/{locale}/{calculator id}: the calculator alone, for iframes on other sites (BRIEF §6, Wave 2). */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    MODULES.filter((m) => m.definition.locales.includes(locale)).map((m) => ({
      locale,
      id: m.definition.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const p = await params;
  const mod = getModule(p.id);
  if (!mod) return {};
  const content = await mod.content[resolveLocale(p.locale)]!();
  const canonical = absoluteUrl(`/${p.locale}${calculatorPath(mod.definition, p.locale)}`);
  return { title: content.name, alternates: { canonical } };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  setRequestLocale(locale);
  const mod = getModule(p.id);
  if (!mod || !mod.definition.locales.includes(locale)) notFound();
  const [content, data, chrome, validation, t] = await Promise.all([
    mod.content[locale]!(),
    mod.data?.(),
    calcChrome(locale),
    validationMessages(locale),
    getTranslations({ locale, namespace: 'embed' }),
  ]);
  const path = `/${locale}${calculatorPath(mod.definition, locale)}`;
  return (
    <main className="p-4 sm:p-5">
      <h1 className="mb-4 text-xl font-semibold">{content.name}</h1>
      <CalculatorIslandFor
        id={mod.definition.id}
        locale={locale}
        today={buildToday()}
        ui={content.ui}
        chrome={chrome}
        validation={validation}
        data={data}
        canonicalPath={path}
      />
      <p className="mt-5 border-t border-line pt-3 text-xs text-subtle">
        {t('poweredBy')}{' '}
        <a
          href={absoluteUrl(path)}
          target="_blank"
          rel="noopener"
          className="font-medium text-brand underline underline-offset-2"
        >
          {t('open')}
        </a>
      </p>
    </main>
  );
}
