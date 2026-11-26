import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'proportion-test',
  slug: { en: 'proportion-test-calculator' },
  category: 'statistics',
  tags: [
    'one-proportion z-test',
    'hypothesis test for a proportion',
    'p-value',
    'sample proportion',
    'percentage claim test',
    'normal approximation',
  ],
  difficulty: 'advanced',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'x',
      param: 'x',
      type: 'number',
      labelKey: 'x',
      default: 17,
      min: 0,
      max: 1e12,
      integer: true,
    },
    {
      id: 'n',
      param: 'n',
      type: 'number',
      labelKey: 'n',
      default: 42,
      min: 1,
      max: 1e12,
      integer: true,
    },
    {
      id: 'p0',
      param: 'p',
      type: 'percent',
      labelKey: 'p0',
      default: 25,
      min: 0,
      max: 100,
      helpKey: 'p0.help',
    },
    {
      id: 'tail',
      param: 't',
      type: 'select',
      labelKey: 'tail',
      default: 'right',
      options: [
        { value: 'two', labelKey: 'tail.two' },
        { value: 'right', labelKey: 'tail.right' },
        { value: 'left', labelKey: 'tail.left' },
      ],
    },
    {
      id: 'alpha',
      param: 'a',
      type: 'select',
      labelKey: 'alpha',
      default: '0.01',
      options: [
        { value: '0.1', labelKey: 'alpha.10' },
        { value: '0.05', labelKey: 'alpha.05' },
        { value: '0.01', labelKey: 'alpha.01' },
        { value: '0.005', labelKey: 'alpha.005' },
      ],
    },
  ],
  outputs: [
    { id: 'p', labelKey: 'out.p', format: 'sig', decimals: 6, primary: true },
    { id: 'decision', labelKey: 'out.decision', format: 'text' },
    { id: 'z', labelKey: 'out.z', format: 'sig', decimals: 8 },
    { id: 'pHat', labelKey: 'out.pHat', format: 'sig', decimals: 6 },
    { id: 'critical', labelKey: 'out.critical', format: 'sig', decimals: 6 },
    { id: 'se', labelKey: 'out.se', format: 'sig', decimals: 6 },
  ],
  sources: [
    {
      title:
        'Introductory Statistics 2e, 9.5 Additional Information and Full Hypothesis Test Examples',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/9-5-additional-information-and-full-hypothesis-test-examples',
      accessed: '2026-11-26',
      locator:
        'Example 9.17: 53 of 100 vs 50%, two-tailed → z 0.6, p 0.5485; Example 9.18: 43 of 150 vs 30% → p 0.7216; Example 9.19: 17 of 42 vs 25%, right-tailed → z 2.3163, p 0.0103; Example 9.21: 172 of 420,019 vs 0.034% → z 2.443, p 0.0073; Example 9.22: 11 of 37,937 vs 0.078%, two-tailed → z −3.4189, p 0.00063',
    },
    {
      title:
        'NIST/SEMATECH e-Handbook of Statistical Methods, 7.2.4 Does the proportion of defectives meet requirements?',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc24.htm',
      accessed: '2026-11-26',
      locator:
        'z = (p̂ − p₀) ÷ √(p₀(1 − p₀)/N); min(Np₀, N(1 − p₀)) ≥ 5; 26 defective of 200 wafers vs p₀ = 0.10, one-sided, α 0.05 → z 1.414 < 1.645, cannot reject',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-26', note: 'First published.' }],
  related: ['confidence-interval', 'binomial', 'sample-size'],
  examples: [
    {
      id: 'shampoo',
      inputs: { x: 17, n: 42, p0: 25, tail: 'right', alpha: '0.01' },
      expect: { z: 2.31626409657 },
    },
    {
      id: 'wafers',
      inputs: { x: 26, n: 200, p0: 10, tail: 'right', alpha: '0.05' },
      expect: { z: 1.41421356237 },
    },
    {
      id: 'brides',
      inputs: { x: 53, n: 100, p0: 50, tail: 'two', alpha: '0.01' },
      expect: { z: 0.6 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-26',
};
