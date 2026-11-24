import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'exponent',
  slug: { en: 'exponent-calculator' },
  category: 'math',
  tags: [
    'exponent',
    'power',
    'negative exponent',
    'fractional exponent',
    'x to the power of y',
    'powers of 10',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'base',
      param: 'b',
      type: 'number',
      labelKey: 'base',
      default: 4,
      allowNegative: true,
      min: -1e15,
      max: 1e15,
    },
    {
      id: 'power',
      param: 'n',
      type: 'text',
      labelKey: 'power',
      default: '-2',
      maxLength: 30,
      helpKey: 'power.help',
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'sig', decimals: 12, primary: true },
    { id: 'exact', labelKey: 'out.exact', format: 'text' },
    { id: 'scientific', labelKey: 'out.scientific', format: 'text' },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 10.5 Integer Exponents and Scientific Notation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/10-5-integer-exponents-and-scientific-notation',
      accessed: '2026-11-24',
      locator:
        'a⁻ⁿ = 1/aⁿ; Example 10.63: 4⁻² = 1/16, 10⁻³ = 1/1000; Example 10.64: (−3)⁻² = 1/9, −3⁻² = −1/9',
    },
    {
      title: 'Intermediate Algebra 2e, 8.3 Simplify Rational Exponents',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/intermediate-algebra-2e/pages/8-3-simplify-rational-exponents',
      accessed: '2026-11-24',
      locator: 'a^(1/n) = ⁿ√a and a^(m/n) = (ⁿ√a)^m',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['root', 'logarithm', 'scientific-notation'],
  examples: [
    { id: 'negative', inputs: { base: 4, power: '-2' }, expect: { result: 0.0625, exact: '1/16' } },
    {
      id: 'big',
      inputs: { base: 2, power: '64' },
      expect: { exact: '18,446,744,073,709,551,616' },
    },
    { id: 'fraction', inputs: { base: 27, power: '2/3' }, expect: { result: 9 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
