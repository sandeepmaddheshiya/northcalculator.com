import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'prime-factorization',
  slug: { en: 'prime-factorization-calculator' },
  category: 'math',
  tags: [
    'prime factorization',
    'prime factors',
    'is it prime',
    'factor tree',
    'divisors',
    'composite number',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'n',
      param: 'n',
      type: 'number',
      labelKey: 'n',
      default: 84,
      min: 1,
      max: 1e12,
      integer: true,
      helpKey: 'n.help',
    },
  ],
  outputs: [
    { id: 'factors', labelKey: 'out.factors', format: 'text', primary: true },
    { id: 'expanded', labelKey: 'out.expanded', format: 'text' },
    { id: 'kind', labelKey: 'out.kind', format: 'text' },
    { id: 'divisorCount', labelKey: 'out.divisorCount', format: 'integer' },
    { id: 'divisors', labelKey: 'out.divisors', format: 'text' },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 2.5 Prime Factorization and the Least Common Multiple',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/2-5-prime-factorization-and-the-least-common-multiple',
      accessed: '2026-11-25',
      locator:
        'a prime has exactly two factors, 1 and itself; every composite number is a unique product of primes; Example 2.48: 48 = 2⁴ · 3; Example 2.49: 84 = 2² · 3 · 7; Example 2.50: 120 = 2³ · 3 · 5',
    },
    {
      title: 'Contemporary Mathematics, 3.1 Prime and Composite Numbers',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/3-1-prime-and-composite-numbers',
      accessed: '2026-11-25',
      locator:
        'test primes up to √n; Example 3.7: 2,117 = 29 × 73; Example 3.10: 2,917 is prime; Example 3.11: 140 = 2² × 5 × 7; Example 3.13: 135 = 3³ × 5; Example 3.14: 10,241 = 7² × 11 × 19; Example 3.16: 1,400 = 2³ × 5² × 7',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['lcm-gcf', 'exponent', 'root'],
  examples: [
    { id: 'eightyFour', inputs: { n: 84 }, expect: { factors: '2² × 3 × 7' } },
    { id: 'big', inputs: { n: 10241 }, expect: { factors: '7² × 11 × 19' } },
    { id: 'prime', inputs: { n: 2917 }, expect: { factors: '2,917', divisorCount: 2 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
