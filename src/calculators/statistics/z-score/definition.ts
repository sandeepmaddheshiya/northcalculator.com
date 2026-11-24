import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'z-score',
  slug: { en: 'z-score-calculator' },
  category: 'statistics',
  tags: [
    'z-score',
    'standard score',
    'normal distribution',
    'percentile',
    'standard deviation',
    'empirical rule',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'mode',
      param: 'm',
      type: 'segmented',
      labelKey: 'mode',
      default: 'z',
      options: [
        { value: 'z', labelKey: 'mode.z' },
        { value: 'x', labelKey: 'mode.x' },
      ],
    },
    {
      id: 'x',
      param: 'x',
      type: 'number',
      labelKey: 'x',
      labelBy: 'mode',
      default: 168,
      allowNegative: true,
      min: -1e12,
      max: 1e12,
    },
    {
      id: 'mean',
      param: 'mu',
      type: 'number',
      labelKey: 'mean',
      default: 170,
      allowNegative: true,
      min: -1e12,
      max: 1e12,
    },
    { id: 'sd', param: 'sd', type: 'number', labelKey: 'sd', default: 6.28, min: 0, max: 1e12 },
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'mode',
      format: 'sig',
      decimals: 8,
      primary: true,
    },
    { id: 'below', labelKey: 'out.below', format: 'percent', decimals: 2 },
    { id: 'above', labelKey: 'out.above', format: 'percent', decimals: 2 },
    { id: 'between', labelKey: 'out.between', format: 'percent', decimals: 2 },
  ],
  sources: [
    {
      title: 'Introductory Statistics 2e, 6.1 The Standard Normal Distribution',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution',
      accessed: '2026-11-24',
      locator:
        'z = (x − μ) ÷ σ; Example 6.1: N(5, 6), x = 17 → z = 2; Example 6.3: N(170, 6.28), x = 168 → z = −0.32, z = 1.27 → x = 177.98; empirical rule 68–95–99.7',
    },
    {
      title:
        'NIST/SEMATECH e-Handbook of Statistical Methods, 1.3.6.7.1 Cumulative Distribution Function of the Standard Normal Distribution',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3671.htm',
      accessed: '2026-11-24',
      locator: 'area from 0 to z: 1.00 → 0.34134, 1.96 → 0.47500, 2.00 → 0.47725, 3.00 → 0.49865',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['average', 'probability', 'percentage'],
  examples: [
    {
      id: 'height',
      inputs: { mode: 'z', x: 168, mean: 170, sd: 6.28 },
      expect: { result: -0.31847133758 },
    },
    {
      id: 'score',
      inputs: { mode: 'z', x: 17, mean: 5, sd: 6 },
      expect: { result: 2, below: 97.725 },
    },
    {
      id: 'reverse',
      inputs: { mode: 'x', x: 1.27, mean: 170, sd: 6.28 },
      expect: { result: 177.9756 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
