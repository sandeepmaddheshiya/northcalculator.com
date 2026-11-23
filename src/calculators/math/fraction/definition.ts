import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const int = (
  id: string,
  param: string,
  labelKey: string,
  def: number,
  extra: Partial<NumberInput> = {},
): NumberInput => ({
  id,
  param,
  type: 'number',
  labelKey,
  default: def,
  integer: true,
  allowNegative: true,
  min: -1e12,
  max: 1e12,
  ...extra,
});

const A = { id: 'a', legendKey: 'fracA' };
const B = { id: 'b', legendKey: 'fracB' };

export const definition: CalculatorDefinition = {
  id: 'fraction',
  slug: { en: 'fraction-calculator' },
  category: 'math',
  tags: [
    'fractions',
    'add fractions',
    'subtract fractions',
    'multiply fractions',
    'divide fractions',
    'simplify',
    'mixed numbers',
    'common denominator',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    int('aw', 'aw', 'whole', 0, { row: A }),
    int('an', 'an', 'num', 1, { row: A }),
    int('ad', 'ad', 'den', 2, { row: A }),
    {
      id: 'op',
      param: 'op',
      type: 'segmented',
      labelKey: 'op',
      default: 'add',
      options: [
        { value: 'add', labelKey: 'op.add' },
        { value: 'sub', labelKey: 'op.sub' },
        { value: 'mul', labelKey: 'op.mul' },
        { value: 'div', labelKey: 'op.div' },
      ],
    },
    int('bw', 'bw', 'whole', 0, { row: B }),
    int('bn', 'bn', 'num', 1, { row: B }),
    int('bd', 'bd', 'den', 3, { row: B }),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'text', primary: true },
    { id: 'mixed', labelKey: 'out.mixed', format: 'text' },
    { id: 'decimal', labelKey: 'out.decimal', format: 'sig', decimals: 12 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 4.2 Multiply and Divide Fractions',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/4-2-multiply-and-divide-fractions',
      accessed: '2026-11-24',
      locator: 'simplifying, multiplying and dividing; Examples 4.22, 4.25–4.27, 4.33, 4.35, 4.36',
    },
    {
      title: 'Prealgebra 2e, 4.5 Add and Subtract Fractions with Different Denominators',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/4-5-add-and-subtract-fractions-with-different-denominators',
      accessed: '2026-11-24',
      locator: 'least common denominator; Examples 4.67–4.71, 4.73',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['percentage', 'scientific-calculator', 'average'],
  examples: [
    { id: 'lcd', inputs: { an: 7, ad: 12, op: 'add', bn: 5, bd: 18 }, expect: { result: '31/36' } },
    {
      id: 'divide',
      inputs: { an: 7, ad: 18, op: 'div', bn: 14, bd: 27 },
      expect: { result: '3/4' },
    },
    {
      id: 'mixed',
      inputs: { aw: 2, an: 1, ad: 4, op: 'mul', bw: 1, bn: 1, bd: 3 },
      expect: { result: '3', mixed: '3' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
