import type { CalculatorDefinition } from '@/calculators/types';
import { bodyInputs } from '../energy';

export const definition: CalculatorDefinition = {
  id: 'bmr',
  slug: { en: 'bmr-calculator' },
  category: 'health',
  tags: [
    'BMR',
    'basal metabolic rate',
    'resting energy expenditure',
    'Mifflin-St Jeor',
    'metabolism',
    'calories at rest',
  ],
  difficulty: 'basic',
  ymyl: true,
  schemaCategory: 'HealthApplication',
  roundingKey: 'rounding',
  inputs: [
    ...bodyInputs(),
    {
      id: 'equation',
      param: 'q',
      type: 'select',
      labelKey: 'equation',
      default: 'mifflin',
      options: [
        { value: 'mifflin', labelKey: 'equation.mifflin' },
        { value: 'schofield', labelKey: 'equation.schofield' },
      ],
      advanced: true,
      helpKey: 'equation.help',
    },
  ],
  outputs: [
    { id: 'bmr', labelKey: 'out.bmr', format: 'integer', primary: true },
    { id: 'kj', labelKey: 'out.kj', format: 'integer' },
    { id: 'perHour', labelKey: 'out.perHour', format: 'number', decimals: 1 },
    { id: 'other', labelKey: 'out.other', labelBy: 'equation', format: 'integer' },
  ],
  sources: [
    {
      title: 'A new predictive equation for resting energy expenditure in healthy individuals',
      publisher:
        'Mifflin MD, St Jeor ST et al., American Journal of Clinical Nutrition 1990;51(2):241–247',
      url: 'https://doi.org/10.1093/ajcn/51.2.241',
      accessed: '2026-11-24',
      locator:
        'abstract: REE (males) = 10 × weight (kg) + 6.25 × height (cm) − 5 × age (y) + 5; REE (females) = … − 161; 498 subjects aged 19–78',
    },
    {
      title:
        'The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass',
      publisher: 'Roza AM, Shizgal HM, American Journal of Clinical Nutrition 1984;40(1):168–182',
      url: 'https://doi.org/10.1093/ajcn/40.1.168',
      accessed: '2026-11-24',
      locator:
        'abstract: resting energy expenditure is directly related to body cell mass; unreliable in malnourished patients',
    },
    {
      title:
        'Human energy requirements: Report of a Joint FAO/WHO/UNU Expert Consultation (2004), section 5',
      publisher: 'Food and Agriculture Organization of the United Nations',
      url: 'https://www.fao.org/4/y5686e/y5686e07.htm',
      accessed: '2026-11-24',
      locator:
        'Table 5.2, Schofield equations for BMR from body weight (kcal/day): women 30–60 y 8.126 kg + 845.6; men 18–30 y 15.057 kg + 692.2; Table 5.1 worked examples',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['calorie', 'bmi'],
  examples: [
    {
      id: 'woman',
      inputs: { system: 'metric', sex: 'female', age: 35, cm: 165, kg: 62 },
      expect: { bmr: 1315 },
    },
    {
      id: 'man',
      inputs: { system: 'imperial', sex: 'male', age: 45, ft: 5, in: 10, lb: 185 },
      expect: { bmr: 1730 },
    },
    {
      id: 'fao',
      inputs: { system: 'metric', sex: 'female', age: 40, cm: 160, kg: 55, equation: 'schofield' },
      expect: { bmr: 1293 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
