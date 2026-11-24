import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const coef = (id: string, def: number): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  allowNegative: true,
  min: -1e12,
  max: 1e12,
});

export const definition: CalculatorDefinition = {
  id: 'quadratic',
  slug: { en: 'quadratic-formula-calculator' },
  category: 'math',
  tags: [
    'quadratic equation',
    'quadratic formula',
    'discriminant',
    'roots',
    'ax² + bx + c = 0',
    'complex roots',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [coef('a', 2), coef('b', 9), coef('c', -5)],
  outputs: [
    { id: 'roots', labelKey: 'out.roots', format: 'text', primary: true },
    { id: 'exact', labelKey: 'out.exact', format: 'text' },
    { id: 'discriminant', labelKey: 'out.discriminant', format: 'sig', decimals: 10 },
    { id: 'kind', labelKey: 'out.kind', format: 'text' },
  ],
  sources: [
    {
      title: 'Intermediate Algebra 2e, 9.3 Solve Quadratic Equations Using the Quadratic Formula',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula',
      accessed: '2026-11-24',
      locator:
        'x = (−b ± √(b² − 4ac)) ÷ 2a; Example 9.21: 2x² + 9x − 5 = 0 → 1/2, −5; Example 9.23: (−5 ± √3)/2; Example 9.24: −1/3 ± (√26/3)i; Example 9.27: 5/2 (double); Example 9.28: discriminants 157, −79, 0',
    },
    {
      title: 'College Algebra 2e, 2.5 Quadratic Equations',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-algebra-2e/pages/2-5-quadratic-equations',
      accessed: '2026-11-24',
      locator:
        'Example 9: x² + 5x + 1 = 0 → (−5 ± √21)/2; Example 10: x² + x + 2 = 0 → (−1 ± i√7)/2; Example 11 and Table 1: discriminant 0, 100, 49, −80 and what each means',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['root', 'fraction', 'scientific-calculator'],
  examples: [
    {
      id: 'rational',
      inputs: { a: 2, b: 9, c: -5 },
      expect: { roots: '0.5 or −5', exact: '1/2 or −5' },
    },
    {
      id: 'irrational',
      inputs: { a: 2, b: 10, c: 11 },
      expect: { exact: '(−5 ± √3)/2', roots: '−1.633974596 or −3.366025404' },
    },
    {
      id: 'complex',
      inputs: { a: 3, b: 2, c: 9 },
      expect: { exact: '(−1 ± i√26)/3', discriminant: -104 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
