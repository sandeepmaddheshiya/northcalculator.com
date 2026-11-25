import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'standard-deviation',
  slug: { en: 'standard-deviation-calculator' },
  category: 'statistics',
  tags: [
    'standard deviation',
    'variance',
    'sample vs population',
    'sum of squares',
    'standard error',
    'coefficient of variation',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'kind',
      param: 'k',
      type: 'segmented',
      labelKey: 'kind',
      default: 'sample',
      options: [
        { value: 'sample', labelKey: 'kind.sample' },
        { value: 'population', labelKey: 'kind.population' },
      ],
      helpKey: 'kind.help',
    },
    {
      id: 'values',
      param: 'v',
      type: 'text',
      labelKey: 'values',
      default:
        '9, 9.5, 9.5, 10, 10, 10, 10, 10.5, 10.5, 10.5, 10.5, 11, 11, 11, 11, 11, 11, 11.5, 11.5, 11.5',
      maxLength: 20000,
      multiline: true,
      helpKey: 'values.help',
    },
  ],
  outputs: [
    { id: 'sd', labelKey: 'out.sd', labelBy: 'kind', format: 'sig', decimals: 10, primary: true },
    { id: 'variance', labelKey: 'out.variance', labelBy: 'kind', format: 'sig', decimals: 10 },
    { id: 'mean', labelKey: 'out.mean', format: 'sig', decimals: 10 },
    { id: 'count', labelKey: 'out.count', format: 'integer' },
    { id: 'ss', labelKey: 'out.ss', format: 'sig', decimals: 10 },
    { id: 'other', labelKey: 'out.other', labelBy: 'kind', format: 'sig', decimals: 10 },
    { id: 'se', labelKey: 'out.se', format: 'sig', decimals: 8 },
    { id: 'cv', labelKey: 'out.cv', format: 'sig', decimals: 6 },
  ],
  sources: [
    {
      title: 'Introductory Statistics 2e, 2.7 Measures of the Spread of the Data',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data',
      accessed: '2026-11-25',
      locator:
        's = √(Σ(x − x̄)² ÷ (n − 1)), σ = √(Σ(x − μ)² ÷ N); Example 2.32: 20 fifth-grade ages → x̄ = 10.525, Σ(x − x̄)² = 9.7375, s² = 0.5125, s = 0.715891; Example 2.33: 31 exam scores → x̄ = 73.5, s = 17.9',
    },
    {
      title: 'Statistical Reference Datasets: Univariate Summary Statistics (NumAcc1)',
      publisher: 'National Institute of Standards and Technology (NIST)',
      url: 'https://www.itl.nist.gov/div898/strd/univ/numacc1.html',
      accessed: '2026-11-25',
      locator:
        'Certified values: 10000001, 10000003, 10000002 → sample mean 10000002 and sample standard deviation 1 (exact, denominator n − 1); a test of numerical accuracy for large values that differ only in the last digit',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['average', 'z-score', 'confidence-interval'],
  examples: [
    {
      id: 'ages',
      inputs: {
        kind: 'sample',
        values:
          '9, 9.5, 9.5, 10, 10, 10, 10, 10.5, 10.5, 10.5, 10.5, 11, 11, 11, 11, 11, 11, 11.5, 11.5, 11.5',
      },
      expect: { sd: 0.715891053164, variance: 0.5125 },
    },
    {
      id: 'population',
      inputs: { kind: 'population', values: '2, 4, 4, 4, 5, 5, 7, 9' },
      expect: { sd: 2, variance: 4 },
    },
    {
      id: 'nist',
      inputs: { kind: 'sample', values: '10000001, 10000003, 10000002' },
      expect: { sd: 1, mean: 10000002 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
