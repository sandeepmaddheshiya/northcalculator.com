import type { CalculatorDefinition } from '@/calculators/types';

const forType = (...t: string[]) => ({ input: 'type', in: t }) as const;

export const definition: CalculatorDefinition = {
  id: 'sample-size',
  slug: { en: 'sample-size-calculator' },
  category: 'statistics',
  tags: [
    'sample size',
    'survey sample size',
    'margin of error',
    'confidence level',
    'how many respondents',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'type',
      param: 'k',
      type: 'segmented',
      labelKey: 'type',
      default: 'proportion',
      options: [
        { value: 'proportion', labelKey: 'type.proportion' },
        { value: 'mean', labelKey: 'type.mean' },
      ],
    },
    {
      id: 'margin',
      param: 'e',
      type: 'number',
      labelKey: 'margin',
      labelBy: 'type',
      default: 3,
      min: 0,
      max: 1e12,
      helpKey: 'margin.help',
    },
    {
      id: 'p',
      param: 'p',
      type: 'number',
      labelKey: 'p',
      default: 50,
      min: 0,
      max: 100,
      helpKey: 'p.help',
      showIf: forType('proportion'),
    },
    {
      id: 'sd',
      param: 's',
      type: 'number',
      labelKey: 'sd',
      default: 15,
      min: 0,
      max: 1e12,
      showIf: forType('mean'),
    },
    {
      id: 'level',
      param: 'c',
      type: 'number',
      labelKey: 'level',
      default: 95,
      min: 50,
      max: 99.99,
    },
  ],
  outputs: [
    { id: 'n', labelKey: 'out.n', format: 'integer', primary: true },
    { id: 'exact', labelKey: 'out.exact', format: 'sig', decimals: 8 },
    { id: 'z', labelKey: 'out.z', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'Introductory Statistics 2e, 8.1 A Single Population Mean Using the Normal Distribution and 8.3 A Population Proportion',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-1-a-single-population-mean-using-the-normal-distribution',
      accessed: '2026-11-24',
      locator:
        'n = z²σ² ÷ EBM² (§8.1, Example 8.7: σ = 15, EBM = 2, 95% → 216.09, round up to 217); n = z²p′q′ ÷ EBP² (§8.3, Example 8.14: EBP = 0.03, 90%, p′q′ = 0.25 → 751.7, round up to 752)',
    },
    {
      title: 'NIST/SEMATECH e-Handbook of Statistical Methods, 7.2.2.2 Sample sizes required',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc222.htm',
      accessed: '2026-11-24',
      locator: 'to estimate a mean within δ at 95% with σ known: N ≥ (1.96 ÷ δ)²σ²',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['confidence-interval', 'z-score', 'percentage'],
  examples: [
    { id: 'poll', inputs: { type: 'proportion', margin: 3, p: 50, level: 90 }, expect: { n: 752 } },
    { id: 'mean', inputs: { type: 'mean', margin: 2, sd: 15, level: 95 }, expect: { n: 217 } },
    {
      id: 'survey',
      inputs: { type: 'proportion', margin: 5, p: 50, level: 95 },
      expect: { n: 385 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
