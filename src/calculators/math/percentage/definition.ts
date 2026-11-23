import type { CalculatorDefinition } from '@/calculators/types';

const MODES = ['of', 'is', 'whole', 'change', 'diff', 'increase', 'decrease', 'original'] as const;
export type PercentMode = (typeof MODES)[number];

export const definition: CalculatorDefinition = {
  id: 'percentage',
  slug: { en: 'percentage-calculator' },
  category: 'math',
  tags: [
    'percent',
    'percentage',
    '%',
    'percent of',
    'percent change',
    'percentage increase',
    'percentage decrease',
    'reverse percentage',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'mode',
      param: 'q',
      type: 'select',
      labelKey: 'mode',
      default: 'of',
      options: MODES.map((m) => ({ value: m, labelKey: `mode.${m}` })),
    },
    {
      id: 'a',
      param: 'a',
      type: 'number',
      labelKey: 'a',
      labelBy: 'mode',
      default: 15,
      allowNegative: true,
    },
    {
      id: 'b',
      param: 'b',
      type: 'number',
      labelKey: 'b',
      labelBy: 'mode',
      default: 240,
      allowNegative: true,
    },
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'result',
      format: 'number',
      primary: true,
      formatBy: { input: 'mode', map: { is: 'percent', change: 'percent', diff: 'percent' } },
    },
  ],
  sources: [
    {
      title: 'Guide for the Use of the International System of Units (SI), NIST SP 811',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811',
      accessed: '2026-11-23',
      locator: '§7.10.2, the percent symbol (% = 0.01)',
    },
    {
      title: 'Prealgebra 2e, 6.2 Solve General Applications of Percent',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent',
      accessed: '2026-11-23',
      locator: 'percent increase and decrease',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-23', note: 'First published.' }],
  related: ['compound-interest', 'gpa'],
  examples: [
    { id: 'tip', inputs: { mode: 'of', a: 20, b: 64.5 }, expect: { result: 12.9 } },
    { id: 'raise', inputs: { mode: 'change', a: 80, b: 92 }, expect: { result: 15 } },
    { id: 'sale', inputs: { mode: 'original', a: 68, b: -15 }, expect: { result: 80 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-23',
};
