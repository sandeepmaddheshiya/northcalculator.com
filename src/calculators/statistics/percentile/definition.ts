import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'percentile',
  slug: { en: 'percentile-calculator' },
  category: 'statistics',
  tags: [
    'percentile',
    'quartiles',
    'interquartile range',
    'outliers',
    'percentile rank',
    'five-number summary',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'data',
      param: 'd',
      type: 'text',
      labelKey: 'data',
      default:
        '95.0610, 95.0925, 95.1065, 95.1195, 95.1442, 95.1567, 95.1591, 95.1682, 95.1772, 95.1937, 95.1959, 95.1990',
      maxLength: 20000,
      helpKey: 'data.help',
    },
    { id: 'p', param: 'p', type: 'number', labelKey: 'p', default: 90, min: 0, max: 100 },
    {
      id: 'x',
      param: 'x',
      type: 'number',
      labelKey: 'x',
      default: 95.15,
      allowNegative: true,
      min: -1e15,
      max: 1e15,
      helpKey: 'x.help',
    },
  ],
  outputs: [
    { id: 'value', labelKey: 'out.value', format: 'sig', decimals: 10, primary: true },
    { id: 'averaged', labelKey: 'out.averaged', format: 'sig', decimals: 10 },
    { id: 'rank', labelKey: 'out.rank', format: 'sig', decimals: 6 },
    { id: 'q1', labelKey: 'out.q1', format: 'sig', decimals: 10 },
    { id: 'median', labelKey: 'out.median', format: 'sig', decimals: 10 },
    { id: 'q3', labelKey: 'out.q3', format: 'sig', decimals: 10 },
    { id: 'iqr', labelKey: 'out.iqr', format: 'sig', decimals: 10 },
    { id: 'outliers', labelKey: 'out.outliers', format: 'text' },
  ],
  sources: [
    {
      title: 'NIST/SEMATECH e-Handbook of Statistical Methods, 7.2.6.2 Percentiles',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm',
      accessed: '2026-11-25',
      locator:
        'p(N + 1) = k + d, Y(p) = Y[k] + d(Y[k+1] − Y[k]); 12 resistivity values → 90th percentile 95.1981 ohm·cm',
    },
    {
      title: 'Introductory Statistics 2e, 2.3 Measures of the Location of the Data',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data',
      accessed: '2026-11-25',
      locator:
        'locator i = (k/100)(n + 1), averaging the neighbours when i is not whole; percentile of x = (x + 0.5y)/n × 100; IQR = Q3 − Q1, outliers beyond 1.5 IQR; Example 2.13: 13 house prices → Q1 308,750, median 488,800, Q3 649,000, 5,500,000 an outlier',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['average', 'z-score', 'linear-regression'],
  examples: [
    { id: 'nist', inputs: { p: 90, x: 95.15 }, expect: { value: 95.19807 } },
    {
      id: 'houses',
      inputs: {
        data: '114950, 158000, 230500, 387000, 389950, 479000, 488800, 529000, 575000, 639000, 659000, 1095000, 5500000',
        p: 50,
        x: 488800,
      },
      expect: { median: 488800, q1: 308750, q3: 649000, rank: 50 },
    },
    { id: 'small', inputs: { data: '2, 4, 6, 8', p: 50, x: 5 }, expect: { value: 5, rank: 50 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
