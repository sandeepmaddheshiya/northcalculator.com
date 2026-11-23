import type { CalculatorDefinition } from './types';
import { CATEGORIES, type CategoryDefinition } from './categories';

/**
 * Central registry. Each calculator folder exports its definition and is listed here.
 * (Phase 3 replaces this list with a generated index from `pnpm new:calculator`.)
 */
export const CALCULATORS: readonly CalculatorDefinition[] = [];

export function calculatorsFor(locale: string): CalculatorDefinition[] {
  return CALCULATORS.filter((c) => c.locales.includes(locale));
}

/** Categories that have at least one calculator in this locale. Empty hubs are never rendered (thin content). */
export function categoriesFor(locale: string): CategoryDefinition[] {
  const used = new Set(calculatorsFor(locale).map((c) => c.category));
  return CATEGORIES.filter((c) => used.has(c.key) && c.slug[locale]).sort(
    (a, b) => a.order - b.order,
  );
}
