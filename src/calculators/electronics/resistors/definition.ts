import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'resistors',
  slug: { en: 'series-parallel-resistor-calculator' },
  category: 'electronics',
  tags: [
    'resistors in series',
    'resistors in parallel',
    'equivalent resistance',
    'total resistance',
    'ohms',
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
      default: 'parallel',
      options: [
        { value: 'series', labelKey: 'mode.series' },
        { value: 'parallel', labelKey: 'mode.parallel' },
      ],
    },
    {
      id: 'values',
      param: 'r',
      type: 'text',
      labelKey: 'values',
      default: '1, 6, 13',
      maxLength: 1000,
      helpKey: 'values.help',
    },
    {
      id: 'voltage',
      param: 'v',
      type: 'number',
      labelKey: 'voltage',
      default: 12,
      min: 0,
      max: 1e9,
      helpKey: 'voltage.help',
    },
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
    { id: 'series', labelKey: 'out.series', format: 'sig', decimals: 8 },
    { id: 'parallel', labelKey: 'out.parallel', format: 'sig', decimals: 8 },
    { id: 'current', labelKey: 'out.current', format: 'sig', decimals: 8 },
    { id: 'power', labelKey: 'out.power', format: 'sig', decimals: 8 },
    { id: 'count', labelKey: 'out.count', format: 'integer' },
  ],
  sources: [
    {
      title: 'College Physics 2e, 21.1 Resistors in Series and Parallel',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/21-1-resistors-in-series-and-parallel',
      accessed: '2026-11-24',
      locator:
        'R_s = R₁ + R₂ + … (Eq. 21.5), 1/R_p = 1/R₁ + 1/R₂ + … (Eq. 21.20); Example 21.1: 1.00, 6.00, 13.0 Ω in series → 20.0 Ω, 0.600 A at 12.0 V, 7.20 W; Example 21.2: in parallel → 0.804 Ω, 14.92 A, 179 W',
    },
    {
      title: 'University Physics Volume 2, 10.2 Resistors in Series and Parallel',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-2/pages/10-2-resistors-in-series-and-parallel',
      accessed: '2026-11-24',
      locator:
        'R_S = Σ Rᵢ (Eq. 10.2), R_P = (Σ 1/Rᵢ)⁻¹ (Eq. 10.3); Example 10.2: four 20 Ω and one 10 Ω in series → 90 Ω, 0.1 A at 9 V; Example 10.3: 1.00, 2.00, 2.00 Ω in parallel → 0.50 Ω, 6.00 A at 3.00 V, 18.00 W',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['ohms-law', 'electricity-cost', 'fraction'],
  examples: [
    {
      id: 'parallel',
      inputs: { mode: 'parallel', values: '1, 6, 13', voltage: 12 },
      expect: { result: 0.80412371134, current: 14.9230769231 },
    },
    {
      id: 'series',
      inputs: { mode: 'series', values: '20, 20, 20, 20, 10', voltage: 9 },
      expect: { result: 90, current: 0.1 },
    },
    {
      id: 'prefixes',
      inputs: { mode: 'parallel', values: '4.7k, 4.7k, 10k', voltage: 5 },
      expect: { result: 1902.8340081 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
