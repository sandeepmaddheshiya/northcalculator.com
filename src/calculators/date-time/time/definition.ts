import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const UNITS = [
  ['d', 'days', 'd'],
  ['h', 'hours', 'h'],
  ['m', 'minutes', 'm'],
  ['s', 'seconds', 's'],
] as const;

const part = (side: 'a' | 'b', defaults: readonly number[]): NumberInput[] =>
  UNITS.map(([u, label, p], i) => ({
    id: `${side}${u.toUpperCase()}`,
    param: `${side}${p}`,
    type: 'number',
    labelKey: `unit.${label}`,
    default: defaults[i]!,
    min: 0,
    max: 1e7,
    row: { id: side, legendKey: side },
  }));

export const definition: CalculatorDefinition = {
  id: 'time',
  slug: { en: 'time-calculator' },
  category: 'date-time',
  tags: [
    'time calculator',
    'add time',
    'subtract time',
    'hours and minutes',
    'time duration',
    'hours minutes seconds',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    ...part('a', [0, 2, 45, 0]),
    {
      id: 'op',
      param: 'o',
      type: 'segmented',
      labelKey: 'op',
      default: 'add',
      options: [
        { value: 'add', labelKey: 'op.add' },
        { value: 'sub', labelKey: 'op.sub' },
      ],
    },
    ...part('b', [0, 1, 30, 0]),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'text', primary: true },
    { id: 'hours', labelKey: 'out.hours', format: 'number', decimals: 6 },
    { id: 'minutes', labelKey: 'out.minutes', format: 'number', decimals: 4 },
    { id: 'seconds', labelKey: 'out.seconds', format: 'number', decimals: 3 },
    { id: 'days', labelKey: 'out.days', format: 'number', decimals: 6 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 7.5 Systems of Measurement',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/7-5-systems-of-measurement',
      accessed: '2026-11-24',
      locator:
        'Table 7.2: 1 min = 60 s, 1 h = 60 min, 1 day = 24 h, 1 week = 7 days; Example 7.46: 9 weeks = 90,720 minutes',
    },
    {
      title: 'The International System of Units (SI Brochure), 9th edition',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      accessed: '2026-11-24',
      locator:
        'Table 8, non-SI units accepted for use with the SI: min = 60 s, h = 3600 s, d = 86 400 s',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['date-difference', 'date-add', 'unit-converter'],
  examples: [
    { id: 'add', inputs: {}, expect: { result: '4 h 15 min', hours: 4.25 } },
    {
      id: 'shift',
      inputs: { aD: 0, aH: 8, aM: 0, aS: 0, op: 'sub', bD: 0, bH: 3, bM: 25, bS: 40 },
      expect: { result: '4 h 34 min 20 s' },
    },
    {
      id: 'weeks',
      inputs: { aD: 63, aH: 0, aM: 0, aS: 0, op: 'add', bD: 0, bH: 0, bM: 0, bS: 0 },
      expect: { minutes: 90720, result: '63 d' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
