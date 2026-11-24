import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'combinations',
  slug: { en: 'permutation-combination-calculator' },
  category: 'statistics',
  tags: ['permutations', 'combinations', 'nCr', 'nPr', 'factorial', 'counting'],
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
      default: 8,
      min: 0,
      max: 1000,
      integer: true,
      helpKey: 'n.help',
    },
    {
      id: 'r',
      param: 'r',
      type: 'number',
      labelKey: 'r',
      default: 3,
      min: 0,
      max: 1000,
      integer: true,
      helpKey: 'r.help',
    },
  ],
  outputs: [
    { id: 'nCr', labelKey: 'out.nCr', format: 'text', primary: true },
    { id: 'nPr', labelKey: 'out.nPr', format: 'text' },
    { id: 'repPerm', labelKey: 'out.repPerm', format: 'text' },
    { id: 'repComb', labelKey: 'out.repComb', format: 'text' },
    { id: 'nFact', labelKey: 'out.nFact', format: 'text' },
  ],
  sources: [
    {
      title: 'Contemporary Mathematics, 7.3 Combinations',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/7-3-combinations',
      accessed: '2026-11-24',
      locator:
        'nCr = n! ÷ (r!(n − r)!); Example 7.9: 8C3 = 56, 12C5 = 792, 15C9 = 5,005; Example 7.10: 52C2 = 1,326; prints 38C5 as 501,492, which is 501,942',
    },
    {
      title: 'Contemporary Mathematics, 7.2 Permutations',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/7-2-permutations',
      accessed: '2026-11-24',
      locator:
        'nPr = n! ÷ (n − r)!; Example 7.4: 8 × 7 × 6 = 336, 8! = 40,320; Example 7.6: 12P3 = 1,320, 8P5 = 6,720; Example 7.7: 312P2 = 97,032',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['probability', 'lcm-gcf', 'random-number'],
  examples: [
    { id: 'committee', inputs: { n: 8, r: 3 }, expect: { nCr: '56', nPr: '336' } },
    { id: 'poker', inputs: { n: 52, r: 2 }, expect: { nCr: '1,326', nPr: '2,652' } },
    { id: 'lottery', inputs: { n: 38, r: 5 }, expect: { nCr: '501,942' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
