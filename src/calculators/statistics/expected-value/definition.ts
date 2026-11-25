import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'expected-value',
  slug: { en: 'expected-value-calculator' },
  category: 'statistics',
  tags: [
    'expected value',
    'mean of a probability distribution',
    'discrete random variable',
    'standard deviation',
    'variance',
    'fair game',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'pairs',
      param: 'd',
      type: 'text',
      labelKey: 'pairs',
      default: '0 0.2; 1 0.5; 2 0.3',
      maxLength: 10000,
      helpKey: 'pairs.help',
    },
  ],
  outputs: [
    { id: 'mean', labelKey: 'out.mean', format: 'sig', decimals: 10, primary: true },
    { id: 'sd', labelKey: 'out.sd', format: 'sig', decimals: 10 },
    { id: 'variance', labelKey: 'out.variance', format: 'sig', decimals: 10 },
    { id: 'total', labelKey: 'out.total', format: 'sig', decimals: 10 },
    { id: 'count', labelKey: 'out.count', format: 'integer' },
  ],
  sources: [
    {
      title: 'Introductory Statistics 2e, 4.2 Mean or Expected Value and Standard Deviation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation',
      accessed: '2026-11-25',
      locator:
        'μ = Σ x·P(x), σ = √Σ (x − μ)²·P(x); Example 4.3: 0, 1, 2 with 0.2, 0.5, 0.3 → μ = 1.1, σ = 0.7; Example 4.4: μ = 2.1, σ ≈ 1.0247; Example 4.6: −$6 at 2/3, +$10 at 1/3 → −2/3; Example 4.8: μ = −5.006, σ ≈ 28.7186',
    },
    {
      title: 'Contemporary Mathematics, 7.11 Expected Value',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/7-11-expected-value',
      accessed: '2026-11-25',
      locator:
        'expected value = Σ value × probability; Example 7.37: one die → 3.5, sum of two dice → 7, a Rummy card → 95/13 ≈ 7.3; win $10 on a six, else lose $1 → about $0.83',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['probability', 'binomial', 'average'],
  examples: [
    { id: 'soccer', inputs: { pairs: '0 0.2; 1 0.5; 2 0.3' }, expect: { mean: 1.1, sd: 0.7 } },
    {
      id: 'die',
      inputs: { pairs: '1 1/6; 2 1/6; 3 1/6; 4 1/6; 5 1/6; 6 1/6' },
      expect: { mean: 3.5 },
    },
    { id: 'bet', inputs: { pairs: '50 0.2142; -20 0.7858' }, expect: { mean: -5.006 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
