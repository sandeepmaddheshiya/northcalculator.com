import type { CalculatorDefinition } from '@/calculators/types';
import { bodyInputs } from '../energy';

export const definition: CalculatorDefinition = {
  id: 'calorie',
  slug: { en: 'calorie-calculator' },
  category: 'health',
  tags: [
    'calories',
    'TDEE',
    'daily calorie needs',
    'total daily energy expenditure',
    'maintenance calories',
    'physical activity level',
  ],
  difficulty: 'basic',
  ymyl: true,
  schemaCategory: 'HealthApplication',
  roundingKey: 'rounding',
  inputs: [
    ...bodyInputs(),
    {
      id: 'activity',
      param: 'l',
      type: 'select',
      labelKey: 'activity',
      default: 'sedentary',
      options: [
        { value: 'sedentary', labelKey: 'activity.sedentary' },
        { value: 'active', labelKey: 'activity.active' },
        { value: 'vigorous', labelKey: 'activity.vigorous' },
        { value: 'custom', labelKey: 'activity.custom' },
      ],
      helpKey: 'activity.help',
    },
    {
      id: 'pal',
      param: 'p',
      type: 'number',
      labelKey: 'pal',
      default: 1.6,
      min: 1.2,
      max: 2.5,
      step: 0.01,
      showIf: { input: 'activity', in: ['custom'] },
      helpKey: 'pal.help',
    },
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
    },
  ],
  outputs: [
    { id: 'tdee', labelKey: 'out.tdee', format: 'integer', primary: true },
    { id: 'range', labelKey: 'out.range', format: 'text' },
    { id: 'kj', labelKey: 'out.kj', format: 'integer' },
    { id: 'bmr', labelKey: 'out.bmr', format: 'integer' },
    { id: 'palUsed', labelKey: 'out.pal', format: 'number', decimals: 2 },
  ],
  sources: [
    {
      title:
        'Human energy requirements: Report of a Joint FAO/WHO/UNU Expert Consultation (2004), section 5',
      publisher: 'Food and Agriculture Organization of the United Nations',
      url: 'https://www.fao.org/4/y5686e/y5686e07.htm',
      accessed: '2026-11-24',
      locator:
        'energy requirement = PAL × BMR; Table 5.3 PAL classes 1.40–1.69, 1.70–1.99, 2.00–2.40; Table 5.1 example lifestyles with PAL 1.53, 1.76, 2.25; 1.75 × 1 697 kcal = 2 970 kcal',
    },
    {
      title: 'A new predictive equation for resting energy expenditure in healthy individuals',
      publisher:
        'Mifflin MD, St Jeor ST et al., American Journal of Clinical Nutrition 1990;51(2):241–247',
      url: 'https://doi.org/10.1093/ajcn/51.2.241',
      accessed: '2026-11-24',
      locator: 'abstract: sex-specific REE equations from weight, height and age',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['bmr', 'bmi'],
  examples: [
    {
      id: 'office',
      inputs: { sex: 'female', age: 35, cm: 165, kg: 62, activity: 'sedentary' },
      expect: { tdee: 2012 },
    },
    {
      id: 'fao',
      inputs: {
        sex: 'male',
        age: 22,
        cm: 178,
        kg: 70,
        activity: 'vigorous',
        equation: 'schofield',
      },
      expect: { tdee: 3929 },
    },
    {
      id: 'active',
      inputs: {
        system: 'imperial',
        sex: 'male',
        age: 45,
        ft: 5,
        in: 10,
        lb: 185,
        activity: 'active',
      },
      expect: { tdee: 3045 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
