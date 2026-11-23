import { calculatorsFor } from '@/calculators/registry';
import { getCategory } from '@/calculators/categories';
import { loadContent } from '@/calculators/content-loader';

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
export async function buildSearchIndex(locale: string, t: T, tPages: T): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = await Promise.all(
    calculatorsFor(locale).map(async (c) => {
      const content = (await loadContent(c.id, locale))!;
      return {
        id: c.id,
        title: content.name,
        description: content.promise,
        synonyms: [...c.tags, ...content.synonyms].join(' '),
        category: t(`categories.${c.category}`),
        url: `/${locale}/${getCategory(c.category).slug[locale]}/${c.slug[locale]}`,
      };
    }),
  );
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
