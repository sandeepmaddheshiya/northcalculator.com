import type { Metadata } from 'next';
import { LIVE_LOCALE_CODES, DEFAULT_LOCALE } from '@/i18n/locales';
import { SITE, absoluteUrl } from '@/lib/site';

export interface PageSeo {
  locale: string;
  /** Path without locale prefix, e.g. '/finance/mortgage-calculator' or '' for home. */
  path: string;
  title: string;
  description: string;
  /** Per-locale paths when slugs are translated; defaults to the same path in every live locale. */
  alternatesByLocale?: Record<string, string>;
  /** Locales in which this page exists (BRIEF §8: never point hreflang at a missing translation). */
  availableLocales?: readonly string[];
  noindex?: boolean;
  ogImage?: string;
  type?: 'website' | 'article';
}

/** Canonical is always self-referencing in the same locale (BRIEF §9); state params are never canonical. */
export function buildMetadata(p: PageSeo): Metadata {
  const locales = (p.availableLocales ?? LIVE_LOCALE_CODES).filter((l) =>
    (LIVE_LOCALE_CODES as readonly string[]).includes(l),
  );
  const pathFor = (l: string) => `/${l}${p.alternatesByLocale?.[l] ?? p.path}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absoluteUrl(pathFor(l));
  const xDefault = locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0];
  if (xDefault) languages['x-default'] = absoluteUrl(pathFor(xDefault));

  const canonical = absoluteUrl(pathFor(p.locale));
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical, languages },
    robots: p.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: p.type ?? 'website',
      siteName: SITE.name,
      title: p.title,
      description: p.description,
      url: canonical,
      locale: p.locale.replace('-', '_'),
      images: [{ url: p.ogImage ?? `/${p.locale}/og/home.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  };
}
