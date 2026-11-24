import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'trigonometry',
  slug: { en: 'trigonometry-calculator' },
  category: 'math',
  tags: [
    'sin',
    'cos',
    'tan',
    'unit circle',
    'degrees to radians',
    'exact trig values',
    'csc sec cot',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'angle',
      param: 'a',
      type: 'number',
      labelKey: 'angle',
      labelBy: 'unit',
      default: 150,
      allowNegative: true,
      min: -1e9,
      max: 1e9,
    },
    {
      id: 'unit',
      param: 'u',
      type: 'segmented',
      labelKey: 'unit',
      default: 'deg',
      options: [
        { value: 'deg', labelKey: 'unit.deg' },
        { value: 'rad', labelKey: 'unit.rad' },
      ],
    },
  ],
  outputs: [
    { id: 'sin', labelKey: 'out.sin', format: 'text', primary: true },
    { id: 'cos', labelKey: 'out.cos', format: 'text' },
    { id: 'tan', labelKey: 'out.tan', format: 'text' },
    { id: 'csc', labelKey: 'out.csc', format: 'text' },
    { id: 'sec', labelKey: 'out.sec', format: 'text' },
    { id: 'cot', labelKey: 'out.cot', format: 'text' },
    { id: 'converted', labelKey: 'out.converted', labelBy: 'unit', format: 'text' },
    { id: 'reference', labelKey: 'out.reference', format: 'sig', decimals: 10 },
  ],
  sources: [
    {
      title: 'Algebra and Trigonometry 2e, 7.1 Angles and 7.3 Unit Circle',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-3-unit-circle',
      accessed: '2026-11-24',
      locator:
        'θ/180 = θ_R/π (§7.1, Example 3: 3 rad ≈ 172°; Example 4: 15° = π/12); Table 1 special angles; Example 4: cos(5π/3) = 0.5; Example 5: reference angle of 225° is 45°; Example 6: cos 150° = −√3/2, sin 150° = 1/2, cos 5π/4 = sin 5π/4 = −√2/2',
    },
    {
      title:
        'NIST Digital Library of Mathematical Functions, Table 4.17.1: Trigonometric functions, values at multiples of π/12',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://dlmf.nist.gov/4.17',
      accessed: '2026-11-24',
      locator:
        'sin π/12 = ¼√2(√3 − 1), tan π/12 = 2 − √3, csc π/12 = √2(√3 + 1), … through π; tan π/2 = ∞',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['pythagorean', 'triangle', 'scientific-calculator'],
  examples: [
    {
      id: 'obtuse',
      inputs: { angle: 150, unit: 'deg' },
      expect: { sin: '1/2 = 0.5', cos: '−√3/2 ≈ −0.866025404' },
    },
    {
      id: 'fifteen',
      inputs: { angle: 15, unit: 'deg' },
      expect: { tan: '2 − √3 ≈ 0.267949192', converted: 'π/12 ≈ 0.261799388 rad' },
    },
    { id: 'radians', inputs: { angle: 3, unit: 'rad' }, expect: { converted: '171.887339°' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
