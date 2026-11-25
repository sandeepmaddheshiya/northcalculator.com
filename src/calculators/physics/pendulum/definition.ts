import type { CalculatorDefinition } from '@/calculators/types';

const FIND = ['period', 'length', 'g'] as const;
const unless = (f: string) => ({ input: 'find', in: FIND.filter((x) => x !== f) });

export const definition: CalculatorDefinition = {
  id: 'pendulum',
  slug: { en: 'pendulum-period-calculator' },
  category: 'physics',
  tags: ['pendulum', 'period', 'T = 2π√(L/g)', 'simple pendulum', 'measure g', 'frequency'],
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
      default: 'period',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    {
      id: 'length',
      param: 'l',
      type: 'number',
      labelKey: 'length',
      default: 1,
      min: 0,
      max: 1e6,
      showIf: unless('length'),
    },
    {
      id: 'period',
      param: 't',
      type: 'number',
      labelKey: 'period',
      default: 2,
      min: 0,
      max: 1e6,
      showIf: unless('period'),
    },
    {
      id: 'g',
      param: 'g',
      type: 'number',
      labelKey: 'g',
      default: 9.80665,
      min: 0,
      max: 1000,
      showIf: unless('g'),
      helpKey: 'g.help',
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
    { id: 'frequency', labelKey: 'out.frequency', format: 'sig', decimals: 8 },
    { id: 'perMinute', labelKey: 'out.perMinute', format: 'sig', decimals: 6 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 16.4 The Simple Pendulum',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/16-4-the-simple-pendulum',
      accessed: '2026-11-25',
      locator:
        'T = 2π√(L/g) (Eq. 16.29) for amplitudes below about 15°; Example 16.5: L = 75.000 cm, T = 1.7357 s → g = 4π²L/T² = 9.8281 m/s²',
    },
    {
      title: 'University Physics Volume 1, 15.4 Pendulums',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums',
      accessed: '2026-11-25',
      locator:
        'ω = √(g/L), T = 2π√(L/g) (Eq. 15.18–15.19), independent of mass and nearly of amplitude below 15°; Example 15.3: 9.8281 m/s²',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['hookes-law', 'free-fall', 'wave'],
  examples: [
    {
      id: 'gravity',
      inputs: { find: 'g', length: 0.75, period: 1.7357 },
      expect: { result: 9.82814766896 },
    },
    {
      id: 'metre',
      inputs: { find: 'period', length: 1, g: 9.80665 },
      expect: { result: 2.00640929259 },
    },
    {
      id: 'seconds',
      inputs: { find: 'length', period: 2, g: 9.80665 },
      expect: { result: 0.993621385566 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
