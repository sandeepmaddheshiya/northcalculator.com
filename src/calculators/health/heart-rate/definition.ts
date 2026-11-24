import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'heart-rate',
  slug: { en: 'heart-rate-zone-calculator' },
  category: 'health',
  tags: [
    'heart rate zones',
    'target heart rate',
    'maximum heart rate',
    'max HR',
    'training zones',
    'exercise intensity',
  ],
  difficulty: 'basic',
  ymyl: true,
  schemaCategory: 'HealthApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'age',
      param: 'a',
      type: 'number',
      labelKey: 'age',
      default: 35,
      min: 15,
      max: 100,
      integer: true,
      sensitive: true,
    },
    {
      id: 'formula',
      param: 'f',
      type: 'segmented',
      labelKey: 'formula',
      default: 'aha',
      options: [
        { value: 'aha', labelKey: 'formula.aha' },
        { value: 'tanaka', labelKey: 'formula.tanaka' },
      ],
      helpKey: 'formula.help',
    },
  ],
  outputs: [
    { id: 'max', labelKey: 'out.max', format: 'integer', primary: true },
    { id: 'moderate', labelKey: 'out.moderate', format: 'text' },
    { id: 'vigorous', labelKey: 'out.vigorous', format: 'text' },
    { id: 'target', labelKey: 'out.target', format: 'text' },
  ],
  sources: [
    {
      title: 'Target Heart Rates Chart',
      publisher: 'American Heart Association',
      url: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates',
      accessed: '2026-11-24',
      locator:
        'maximum heart rate about 220 minus age; moderate 50–70%, vigorous 70–85% of maximum; chart: age 35 → 93–157 bpm, maximum 185 bpm',
    },
    {
      title: 'Age-predicted maximal heart rate revisited',
      publisher:
        'Tanaka H, Monahan KD, Seals DR, Journal of the American College of Cardiology 2001;37(1):153–156',
      url: 'https://doi.org/10.1016/s0735-1097(00)01054-8',
      accessed: '2026-11-24',
      locator:
        'abstract: HRmax = 208 − 0.7 × age in healthy adults, from 18,712 subjects in 351 studies; independent of sex and activity',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['running-pace', 'calorie', 'bmi'],
  examples: [
    { id: 'aha', inputs: { age: 35, formula: 'aha' }, expect: { max: 185, target: '93–157 bpm' } },
    { id: 'older', inputs: { age: 65, formula: 'tanaka' }, expect: { max: 163 } },
    {
      id: 'young',
      inputs: { age: 20, formula: 'aha' },
      expect: { max: 200, moderate: '100–140 bpm' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
