import type { CategoryKey } from '@/components/ui/CategoryGlyph';
import type { LocalizedSlug } from './types';

export interface CategoryDefinition {
  key: CategoryKey;
  slug: LocalizedSlug;
  /** Display order on the home page and in navigation. */
  order: number;
}

/** Wave 1 categories (docs/taxonomy-and-wave1.md). Wave 2 categories are added with their first calculator. */
export const CATEGORIES: readonly CategoryDefinition[] = [
  { key: 'finance', slug: { en: 'finance' }, order: 1 },
  { key: 'math', slug: { en: 'math' }, order: 2 },
  { key: 'health', slug: { en: 'health' }, order: 3 },
  { key: 'date-time', slug: { en: 'date-time' }, order: 4 },
  { key: 'conversion', slug: { en: 'conversion' }, order: 5 },
  { key: 'education', slug: { en: 'education' }, order: 6 },
  { key: 'everyday', slug: { en: 'everyday' }, order: 7 },
];

export function getCategory(key: CategoryKey): CategoryDefinition {
  const c = CATEGORIES.find((x) => x.key === key);
  if (!c) throw new Error(`Unknown category ${key}`);
  return c;
}
