import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'anova',
  slug: { en: 'anova-calculator' },
  category: 'statistics',
  tags: [
    'one-way ANOVA',
    'analysis of variance',
    'F-test',
    'F-ratio',
    'compare several means',
    'p-value',
  ],
  difficulty: 'advanced',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'groups',
      param: 'g',
      type: 'text',
      labelKey: 'groups',
      default: '6.9, 5.4, 5.8, 4.6, 4.0; 8.3, 6.8, 7.8, 9.2, 6.5; 8.0, 10.5, 8.1, 6.9, 9.3',
      maxLength: 20000,
      multiline: true,
      helpKey: 'groups.help',
    },
    {
      id: 'alpha',
      param: 'a',
      type: 'select',
      labelKey: 'alpha',
      default: '0.05',
      options: [
        { value: '0.1', labelKey: 'alpha.10' },
        { value: '0.05', labelKey: 'alpha.05' },
        { value: '0.01', labelKey: 'alpha.01' },
      ],
    },
  ],
  outputs: [
    { id: 'p', labelKey: 'out.p', format: 'sig', decimals: 6, primary: true },
    { id: 'decision', labelKey: 'out.decision', format: 'text' },
    { id: 'f', labelKey: 'out.f', format: 'sig', decimals: 8 },
    { id: 'critical', labelKey: 'out.critical', format: 'sig', decimals: 6 },
    { id: 'dfB', labelKey: 'out.dfB', format: 'integer' },
    { id: 'dfW', labelKey: 'out.dfW', format: 'integer' },
  ],
  sources: [
    {
      title:
        'NIST/SEMATECH e-Handbook of Statistical Methods, 7.4.3.3 The ANOVA Table and Tests of Hypotheses About Means',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/handbook/prc/section4/prc433.htm',
      accessed: '2026-11-26',
      locator:
        'DFT = k − 1, DFE = N − k, MST = SST/DFT, MSE = SSE/DFE, F = MST/MSE; example: 6.9 5.4 5.8 4.6 4.0 / 8.3 6.8 7.8 9.2 6.5 / 8.0 10.5 8.1 6.9 9.3 → means 5.34, 7.72, 8.56, SST 27.897, SSE 17.452, MST 13.949, MSE 1.454, F 9.59, F(0.05; 2, 12) = 3.89, p 0.00325',
    },
    {
      title:
        'NIST/SEMATECH e-Handbook, 1.3.6.6.5 F Distribution and 1.3.6.7.3 Upper Critical Values of the F Distribution',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3673.htm',
      accessed: '2026-11-26',
      locator:
        'F cdf = 1 − I_k(ν₂/2, ν₁/2), k = ν₂/(ν₂ + ν₁x) (§1.3.6.6.5); upper critical values α = 0.05: (2, 12) 3.885, (3, 20) 3.098, (1, 30) 4.171, (5, 5) 5.050; α = 0.01: (2, 10) 7.559, (3, 12) 5.953',
    },
    {
      title:
        'Introductory Statistics 2e, 13.1 One-Way ANOVA and 13.2 The F Distribution and the F-Ratio',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/13-2-the-f-distribution-and-the-f-ratio',
      accessed: '2026-11-26',
      locator:
        'SS_between = Σ s_j²/n_j − (Σ s_j)²/n, SS_within = SS_total − SS_between, df k − 1 and n − k, F = MS_between/MS_within, right-tailed; Example 13.1: diet plans 5 4.5 4 3 / 3.5 7 4.5 / 8 4 3.5 → SS_between 2.2458, SS_within 20.8542, MS 1.1229 and 2.9792, F 0.3769; assumptions: normal populations, independent random samples, equal variances',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-26', note: 'First published.' }],
  related: ['two-sample-t-test', 'chi-square', 'standard-deviation'],
  examples: [
    {
      id: 'nist',
      inputs: {
        groups: '6.9, 5.4, 5.8, 4.6, 4.0; 8.3, 6.8, 7.8, 9.2, 6.5; 8.0, 10.5, 8.1, 6.9, 9.3',
        alpha: '0.05',
      },
      expect: { f: 9.59110703644, dfB: 2, dfW: 12 },
    },
    {
      id: 'diet',
      inputs: { groups: '5, 4.5, 4, 3; 3.5, 7, 4.5; 8, 4, 3.5', alpha: '0.05' },
      expect: { f: 0.376923076923, dfB: 2, dfW: 7 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-26',
};
