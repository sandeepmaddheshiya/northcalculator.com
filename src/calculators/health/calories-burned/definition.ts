import type { CalculatorDefinition } from '@/calculators/types';

/** 2024 Adult Compendium of Physical Activities: [code, MET]. Labels are in content.en.tsx. */
export const ACTIVITIES: readonly (readonly [code: string, met: number])[] = [
  ['07021', 1.0],
  ['02150', 2.3],
  ['17170', 3.0],
  ['17190', 3.8],
  ['18292', 5.8],
  ['01030', 8.0],
  ['18290', 8.0],
  ['12050', 9.3],
  ['12120', 14.8],
];

export const definition: CalculatorDefinition = {
  id: 'calories-burned',
  slug: { en: 'calories-burned-calculator' },
  category: 'health',
  tags: [
    'calories burned',
    'MET',
    'exercise calories',
    'activity energy',
    'walking calories',
    'running calories',
  ],
  difficulty: 'basic',
  ymyl: true,
  schemaCategory: 'HealthApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'activity',
      param: 'a',
      type: 'select',
      labelKey: 'activity',
      default: '17190',
      options: [
        ...ACTIVITIES.map(([c]) => ({ value: c, labelKey: `act.${c}` })),
        { value: 'custom', labelKey: 'act.custom' },
      ],
    },
    {
      id: 'met',
      param: 'met',
      type: 'number',
      labelKey: 'met',
      default: 6,
      min: 0.5,
      max: 25,
      step: 0.1,
      showIf: { input: 'activity', in: ['custom'] },
      helpKey: 'met.help',
    },
    {
      id: 'minutes',
      param: 'min',
      type: 'number',
      labelKey: 'minutes',
      default: 30,
      min: 1,
      max: 1440,
    },
    {
      id: 'unit',
      param: 'u',
      type: 'segmented',
      labelKey: 'unit',
      default: 'kg',
      options: [
        { value: 'kg', labelKey: 'unit.kg' },
        { value: 'lb', labelKey: 'unit.lb' },
      ],
    },
    {
      id: 'weight',
      param: 'w',
      type: 'number',
      labelKey: 'weight',
      labelBy: 'unit',
      default: 70,
      min: 20,
      max: 700,
      sensitive: true,
    },
  ],
  outputs: [
    { id: 'kcal', labelKey: 'out.kcal', format: 'integer', primary: true },
    { id: 'net', labelKey: 'out.net', format: 'integer' },
    { id: 'perHour', labelKey: 'out.perHour', format: 'integer' },
    { id: 'metUsed', labelKey: 'out.met', format: 'number', decimals: 1 },
  ],
  sources: [
    {
      title: '2024 Adult Compendium of Physical Activities (website and activity tables)',
      publisher: 'Herrmann SD, Ainsworth BE et al., Compendium of Physical Activities',
      url: 'https://pacompendium.com/adult-compendium/',
      accessed: '2026-11-24',
      locator:
        'one MET is defined as 1 kcal/kg/hour (3.5 mL O₂/kg/min); codes 17190 walking 2.8–3.4 mph 3.8 MET, 12050 running 6–6.3 mph 9.3, 01030 bicycling 12–13.9 mph 8.0, 02150 yoga hatha 2.3, 07021 sitting quietly 1.0',
    },
    {
      title:
        '2024 Adult Compendium of Physical Activities: A third update of the energy costs of human activities',
      publisher: 'Journal of Sport and Health Science 2024;13(1):6–12',
      url: 'https://doi.org/10.1016/j.jshs.2023.10.010',
      accessed: '2026-11-24',
      locator:
        'abstract: tailored to adults 19–59; 1,114 activities with measured or estimated MET values',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['calorie', 'bmr', 'running-pace'],
  examples: [
    {
      id: 'walk',
      inputs: { activity: '17190', minutes: 30, unit: 'kg', weight: 70 },
      expect: { kcal: 133 },
    },
    {
      id: 'run',
      inputs: { activity: '12050', minutes: 45, unit: 'lb', weight: 180 },
      expect: { kcal: 569 },
    },
    {
      id: 'yoga',
      inputs: { activity: '02150', minutes: 60, unit: 'kg', weight: 60 },
      expect: { kcal: 138, net: 78 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
