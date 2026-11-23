/**
 * JSON-LD builders (BRIEF §9). Only mark up content that is visible on the page.
 * Never add AggregateRating or other unverifiable claims.
 */
import { SITE, absoluteUrl } from '@/lib/site';

type Json = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const PERSON_ID = `${SITE.url}/#operator`;

export function organization(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
    founder: { '@id': PERSON_ID },
  };
}

export function operator(): Json {
  return { '@type': 'Person', '@id': PERSON_ID, name: SITE.operator.name, url: SITE.operator.url };
}

export function website(locale: string): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.url,
    name: SITE.name,
    inLanguage: locale,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(`/${locale}/search`)}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function webApplication(p: {
  name: string;
  description: string;
  path: string;
  locale: string;
  category: string;
  dateModified: string;
}): Json {
  return {
    '@type': 'WebApplication',
    name: p.name,
    description: p.description,
    url: absoluteUrl(p.path),
    inLanguage: p.locale,
    applicationCategory: p.category,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript for live results; default result is in the HTML.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    dateModified: p.dateModified,
    publisher: { '@id': ORG_ID },
  };
}

export function faqPage(faqs: { q: string; a: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function graph(...nodes: Json[]): string {
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(
    /</g,
    '\\u003c',
  );
}
