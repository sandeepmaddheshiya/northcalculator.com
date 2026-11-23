import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

export const definition: CalculatorDefinition = {
  id: 'tip',
  slug: { en: 'tip-calculator' },
  category: 'everyday',
  tags: ['tip', 'gratuity', 'split the bill', 'restaurant tip', 'tip per person'],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'bill', param: 'b', type: 'currency', labelKey: 'bill', default: 68.5, min: 0, max: 1e9 },
    { id: 'pct', param: 't', type: 'percent', labelKey: 'pct', default: 18, min: 0, max: 100 },
    {
      id: 'people',
      param: 'n',
      type: 'number',
      labelKey: 'people',
      default: 1,
      min: 1,
      max: 100,
      integer: true,
    },
    {
      id: 'round',
      param: 'r',
      type: 'segmented',
      labelKey: 'round',
      default: 'none',
      options: [
        { value: 'none', labelKey: 'round.none' },
        { value: 'up', labelKey: 'round.up' },
      ],
      helpKey: 'round.help',
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'tip', labelKey: 'out.tip', format: 'currency', primary: true },
    { id: 'total', labelKey: 'out.total', format: 'currency' },
    { id: 'each', labelKey: 'out.each', format: 'currency' },
    { id: 'tipEach', labelKey: 'out.tipEach', format: 'currency' },
    { id: 'effective', labelKey: 'out.effective', format: 'percent', decimals: 2 },
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
      title: 'Guide for the Use of the International System of Units (SI), NIST SP 811',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811',
      accessed: '2026-11-24',
      locator: '§7.10.2: the percent symbol means 0.01',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['discount', 'percentage', 'sales-tax'],
  examples: [
    {
      id: 'dinner',
      inputs: { bill: 68.5, pct: 18, people: 1 },
      expect: { tip: 12.33, total: 80.83 },
    },
    {
      id: 'split',
      inputs: { bill: 187.4, pct: 20, people: 4, round: 'up' },
      expect: { each: 57, total: 228 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
