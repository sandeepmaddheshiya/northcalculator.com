import type { CalculatorDefinition } from './types';
import { getCategory } from './categories';

/** Locale-less path of a calculator page, e.g. "/finance/mortgage-calculator". */
export function calculatorPath(def: CalculatorDefinition, locale: string): string {
  return `/${getCategory(def.category).slug[locale]}/${def.slug[locale]}`;
}
