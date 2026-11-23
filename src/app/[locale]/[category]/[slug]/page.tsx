import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';
import { routing } from '@/i18n/routing';
import { MODULES } from '@/calculators/registry';
import { getCategory } from '@/calculators/categories';
import { calculatorPath } from '@/calculators/paths';
import { buildMetadata } from '@/lib/seo/metadata';
import { CalculatorPage } from '@/components/calc/CalculatorPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    MODULES.filter((m) => m.definition.locales.includes(locale)).map((m) => ({
      locale,
      category: getCategory(m.definition.category).slug[locale]!,
      slug: m.definition.slug[locale]!,
    })),
  );
}

function find(locale: string, category: string, slug: string) {
  return MODULES.find(
    (m) =>
      m.definition.locales.includes(locale) &&
      m.definition.slug[locale] === slug &&
      getCategory(m.definition.category).slug[locale] === category,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const mod = find(locale, p.category, p.slug);
  if (!mod) return {};
  const content = await mod.content[locale]!();
  const def = mod.definition;
  const noindex =
    process.env.NOINDEX_UNREVIEWED_YMYL === 'true' && def.ymyl && def.review.status !== 'reviewed';
  return buildMetadata({
    locale,
    path: calculatorPath(def, locale),
    title: content.title,
    description: content.description,
    availableLocales: def.locales,
    alternatesByLocale: Object.fromEntries(def.locales.map((l) => [l, calculatorPath(def, l)])),
    ogImage: `/${locale}/og/${def.id}.png`,
    noindex,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  setRequestLocale(locale);
  const mod = find(locale, p.category, p.slug);
  if (!mod) notFound();
  return <CalculatorPage mod={mod} locale={locale} />;
}
