import type { CalculatorDefinition } from '@/calculators/types';

const FIND = ['remaining', 'time', 'halfLife'] as const;
const unless = (f: string) => ({ input: 'find', in: FIND.filter((x) => x !== f) });

export const definition: CalculatorDefinition = {
  id: 'half-life',
  slug: { en: 'half-life-calculator' },
  category: 'chemistry',
  tags: [
    'half-life',
    'radioactive decay',
    'exponential decay',
    'carbon dating',
    'decay constant',
    'remaining amount',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'q',
      type: 'segmented',
      labelKey: 'find',
      default: 'remaining',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    {
      id: 'initial',
      param: 'n0',
      type: 'number',
      labelKey: 'initial',
      default: 100,
      min: 0,
      max: 1e30,
    },
    {
      id: 'remaining',
      param: 'n',
      type: 'number',
      labelKey: 'remaining',
      default: 50,
      min: 0,
      max: 1e30,
      showIf: unless('remaining'),
    },
    {
      id: 'time',
      param: 't',
      type: 'number',
      labelKey: 'time',
      default: 15,
      min: 0,
      max: 1e15,
      showIf: unless('time'),
    },
    {
      id: 'halfLife',
      param: 'h',
      type: 'number',
      labelKey: 'halfLife',
      default: 5.27,
      min: 0,
      max: 1e15,
      showIf: unless('halfLife'),
      helpKey: 'halfLife.help',
    },
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'find',
      format: 'sig',
      decimals: 8,
      primary: true,
    },
    { id: 'percent', labelKey: 'out.percent', format: 'percent', decimals: 4 },
    { id: 'halfLives', labelKey: 'out.halfLives', format: 'sig', decimals: 8 },
    { id: 'lambda', labelKey: 'out.lambda', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'Chemistry 2e, 21.3 Radioactive Decay',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/21-3-radioactive-decay',
      accessed: '2026-11-25',
      locator:
        'N_t = N₀e^(−λt), λ = ln 2 ÷ t½; Example 21.5: cobalt-60, t½ = 5.27 y, 15 y → 13.8% left, 2.00% left at 29.6 y (with λ rounded to 0.132 y⁻¹); check: radon-222, 0.750 → 0.100 g in 11.1 d; Example 21.6: carbon-14, rate 10.8 of 13.6 → 1910 y',
    },
    {
      title: 'College Physics 2e, 31.5 Half-Life and Activity',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity',
      accessed: '2026-11-25',
      locator:
        'N = N₀e^(−λt) (Eq. 31.36), λ = 0.693 ÷ t½ (Eq. 31.37); Example 31.4: 92% of carbon-14 left, t½ = 5730 y → 690 y',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['logarithm', 'exponent', 'compound-interest'],
  examples: [
    {
      id: 'cobalt',
      inputs: { find: 'remaining', initial: 100, time: 15, halfLife: 5.27 },
      expect: { result: 13.9052365233 },
    },
    {
      id: 'shroud',
      inputs: { find: 'time', initial: 100, remaining: 92, halfLife: 5730 },
      expect: { result: 689.285959202 },
    },
    {
      id: 'radon',
      inputs: { find: 'time', initial: 0.75, remaining: 0.1, halfLife: 3.823 },
      expect: { result: 11.113042747 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
