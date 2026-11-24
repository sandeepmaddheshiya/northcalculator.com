import type { CategoryKey } from '@/components/ui/CategoryGlyph';
import type { LocalizedSlug } from './types';

export interface CategoryDefinition {
  key: CategoryKey;
  slug: LocalizedSlug;
  /** Display order on the home page and in navigation. */
  order: number;
}

/** Wave 1 and Wave 2 categories (docs/taxonomy-and-wave1.md). Hubs with no calculators are not rendered. */
export const CATEGORIES: readonly CategoryDefinition[] = [
  { key: 'finance', slug: { en: 'finance' }, order: 1 },
  { key: 'math', slug: { en: 'math' }, order: 2 },
  { key: 'health', slug: { en: 'health' }, order: 3 },
  { key: 'date-time', slug: { en: 'date-time' }, order: 4 },
  { key: 'conversion', slug: { en: 'conversion' }, order: 5 },
  { key: 'education', slug: { en: 'education' }, order: 6 },
  { key: 'everyday', slug: { en: 'everyday' }, order: 7 },
  { key: 'geometry', slug: { en: 'geometry' }, order: 8 },
  { key: 'statistics', slug: { en: 'statistics' }, order: 9 },
  { key: 'physics', slug: { en: 'physics' }, order: 10 },
  { key: 'electronics', slug: { en: 'electronics' }, order: 11 },
  { key: 'chemistry', slug: { en: 'chemistry' }, order: 12 },
  { key: 'construction', slug: { en: 'construction' }, order: 13 },
];

export function getCategory(key: CategoryKey): CategoryDefinition {
  const c = CATEGORIES.find((x) => x.key === key);
  if (!c) throw new Error(`Unknown category ${key}`);
  return c;
}
