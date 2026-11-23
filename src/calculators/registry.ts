import type { CalculatorDefinition } from './types';
import type { CalculatorModule } from './module';
import { CATEGORIES, type CategoryDefinition } from './categories';
import { mortgage } from './finance/mortgage';
import { loan } from './finance/loan';
import { compoundInterest } from './finance/compound-interest';
import { percentage } from './math/percentage';
import { bmi } from './health/bmi';
import { age } from './date-time/age';
import { gpa } from './education/gpa';
import { unitConverter } from './conversion/unit-converter';
import { currencyConverter } from './conversion/currency-converter';
import { scientific } from './math/scientific';

/**
 * Central registry: one line per calculator module (each folder's index.ts).
 * Order here is the default order within a category. Each module also needs a client island
 * entry in islands.tsx (checked by the content gate).
 */
export const MODULES: readonly CalculatorModule[] = [
  mortgage,
  loan,
  compoundInterest,
  percentage,
  scientific,
  bmi,
  age,
  unitConverter,
  currencyConverter,
  gpa,
];

export const CALCULATORS: readonly CalculatorDefinition[] = MODULES.map((m) => m.definition);

export function getModule(id: string): CalculatorModule | undefined {
  return MODULES.find((m) => m.definition.id === id);
}

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
