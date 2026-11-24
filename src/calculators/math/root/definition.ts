import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'root',
  slug: { en: 'square-root-calculator' },
  category: 'math',
  tags: ['square root', 'cube root', 'nth root', 'simplify radicals', 'radical', 'perfect square'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'x',
      param: 'x',
      type: 'number',
      labelKey: 'x',
      default: 72,
      allowNegative: true,
      min: -1e15,
      max: 1e15,
    },
    {
      id: 'n',
      param: 'n',
      type: 'number',
      labelKey: 'n',
      default: 2,
      min: 2,
      max: 100,
      integer: true,
      helpKey: 'n.help',
    },
  ],
  outputs: [
    { id: 'root', labelKey: 'out.root', format: 'sig', decimals: 12, primary: true },
    { id: 'simplified', labelKey: 'out.simplified', format: 'text' },
    { id: 'between', labelKey: 'out.between', format: 'text' },
  ],
  sources: [
    {
      title: 'Intermediate Algebra 2e, 8.1 Simplify Expressions with Roots',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/intermediate-algebra-2e/pages/8-1-simplify-expressions-with-roots',
      accessed: '2026-11-24',
      locator:
        'Examples 8.1–8.6: √144 = 12, ∛64 = 4, ⁴√81 = 3, ∛−125 = −5, −⁴√16 not real, √105 between 10 and 11, √17 ≈ 4.12',
    },
    {
      title: 'Intermediate Algebra 2e, 8.2 Simplify Radical Expressions',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/intermediate-algebra-2e/pages/8-2-simplify-radical-expressions',
      accessed: '2026-11-24',
      locator: 'product property: take out the largest factor that is a perfect power of the index',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['exponent', 'scientific-calculator', 'lcm-gcf'],
  examples: [
    { id: 'simplify', inputs: { x: 72, n: 2 }, expect: { simplified: '6√2' } },
    {
      id: 'estimate',
      inputs: { x: 17, n: 2 },
      expect: { root: 4.12310562562, between: '4 and 5' },
    },
    { id: 'cube', inputs: { x: -125, n: 3 }, expect: { root: -5, simplified: '−5' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
