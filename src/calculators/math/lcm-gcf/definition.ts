import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'lcm-gcf',
  slug: { en: 'lcm-gcf-calculator' },
  category: 'math',
  tags: [
    'LCM',
    'least common multiple',
    'GCF',
    'greatest common factor',
    'GCD',
    'HCF',
    'prime factorization',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'f',
      type: 'segmented',
      labelKey: 'find',
      default: 'gcf',
      options: [
        { value: 'gcf', labelKey: 'find.gcf' },
        { value: 'lcm', labelKey: 'find.lcm' },
      ],
    },
    {
      id: 'numbers',
      param: 'v',
      type: 'text',
      labelKey: 'numbers',
      default: '54, 36',
      maxLength: 2000,
      helpKey: 'numbers.help',
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'find', format: 'text', primary: true },
    { id: 'gcf', labelKey: 'out.gcf', format: 'text' },
    { id: 'lcm', labelKey: 'out.lcm', format: 'text' },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 2.5 Prime Factorization and the Least Common Multiple',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/2-5-prime-factorization-and-the-least-common-multiple',
      accessed: '2026-11-24',
      locator:
        'Examples 2.48–2.54: 48 = 2⁴ × 3, 120 = 2³ × 3 × 5; LCM(15, 20) = 60, LCM(15, 18) = 90, LCM(50, 100) = 100',
    },
    {
      title: 'Elementary Algebra 2e, 7.1 Greatest Common Factor and Factor by Grouping',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/elementary-algebra-2e/pages/7-1-greatest-common-factor-and-factor-by-grouping',
      accessed: '2026-11-24',
      locator: 'Example 7.1: the GCF of 54 and 36 is 18',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['fraction', 'average', 'scientific-calculator'],
  examples: [
    { id: 'gcf', inputs: { find: 'gcf', numbers: '54, 36' }, expect: { result: '18' } },
    { id: 'lcm', inputs: { find: 'lcm', numbers: '15, 18' }, expect: { result: '90' } },
    { id: 'buses', inputs: { find: 'lcm', numbers: '12, 20, 30' }, expect: { result: '60' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
