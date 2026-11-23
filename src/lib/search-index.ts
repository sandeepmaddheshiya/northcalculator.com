import { calculatorsFor } from '@/calculators/registry';
import { getCategory } from '@/calculators/categories';

export interface SearchDoc {
  id: string;
  title: string;
  description: string;
  synonyms: string;
  category: string;
  url: string;
}

type T = (key: string) => string;

/** Builds the per-locale search index at build time (served as /{locale}/search-index.json). */
export function buildSearchIndex(locale: string, t: T, tPages: T): SearchDoc[] {
  const docs: SearchDoc[] = calculatorsFor(locale).map((c) => ({
    id: c.id,
    title: t(`calc.${c.id}.name`),
    description: t(`calc.${c.id}.promise`),
    synonyms: c.tags.join(' '),
    category: t(`categories.${c.category}`),
    url: `/${locale}/${getCategory(c.category).slug[locale]}/${c.slug[locale]}`,
  }));
  for (const [id, path] of [
    ['about', '/about'],
    ['methodology', '/methodology'],
    ['editorialPolicy', '/editorial-policy'],
    ['privacy', '/privacy'],
    ['contact', '/contact'],
  ] as const) {
    docs.push({
      id,
      title: tPages(id),
      description: '',
      synonyms: '',
      category: '',
      url: `/${locale}${path}`,
    });
  }
  return docs;
}
