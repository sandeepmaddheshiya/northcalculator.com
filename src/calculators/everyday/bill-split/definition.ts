import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

const p = (amount: number) => ({ amount });

export const definition: CalculatorDefinition = {
  id: 'bill-split',
  slug: { en: 'split-bill-calculator' },
  category: 'everyday',
  tags: [
    'split the bill',
    'bill splitter',
    'who owes what',
    'restaurant bill',
    'split check',
    'shared expenses',
  ],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'people',
      param: 'p',
      type: 'list',
      labelKey: 'people',
      maxRows: 30,
      columns: [
        {
          id: 'amount',
          param: 'a',
          type: 'number',
          labelKey: 'col.amount',
          default: 20,
          min: 0,
          max: 1e7,
        },
      ],
      default: [p(24), p(31.5), p(18.75)],
      helpKey: 'people.help',
    },
    {
      id: 'taxRate',
      param: 't',
      type: 'percent',
      labelKey: 'taxRate',
      default: 8.875,
      min: 0,
      max: 50,
    },
    {
      id: 'tipRate',
      param: 'g',
      type: 'percent',
      labelKey: 'tipRate',
      default: 20,
      min: 0,
      max: 100,
    },
    {
      id: 'tipOn',
      param: 'o',
      type: 'segmented',
      labelKey: 'tipOn',
      default: 'subtotal',
      options: [
        { value: 'subtotal', labelKey: 'tipOn.subtotal' },
        { value: 'total', labelKey: 'tipOn.total' },
      ],
      advanced: true,
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'total', labelKey: 'out.total', format: 'currency', primary: true },
    { id: 'subtotal', labelKey: 'out.subtotal', format: 'currency' },
    { id: 'tax', labelKey: 'out.tax', format: 'currency' },
    { id: 'tip', labelKey: 'out.tip', format: 'currency' },
    { id: 'factor', labelKey: 'out.factor', format: 'number', decimals: 4 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 6.2 Solve General Applications of Percent',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent',
      accessed: '2026-11-24',
      locator: 'Example 6.20: an 18% tip on a $68.50 bill is $12.33',
    },
    {
      title: 'Contemporary Mathematics, 6.2 Discounts, Markups, and Sales Tax',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/6-2-discounts-markups-and-sales-tax',
      accessed: '2026-11-24',
      locator: 'Example 6.22: 8.25% sales tax on $34.88 is $2.88, total $37.76',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['tip', 'sales-tax', 'percentage'],
  examples: [
    {
      id: 'dinner',
      inputs: { people: [p(24), p(31.5), p(18.75)], taxRate: 8.875, tipRate: 20 },
      expect: { total: 95.69 },
    },
    {
      id: 'tip',
      inputs: { people: [p(68.5)], taxRate: 0, tipRate: 18 },
      expect: { tip: 12.33, total: 80.83 },
    },
    {
      id: 'tax',
      inputs: { people: [p(34.88)], taxRate: 8.25, tipRate: 0 },
      expect: { tax: 2.88, total: 37.76 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
