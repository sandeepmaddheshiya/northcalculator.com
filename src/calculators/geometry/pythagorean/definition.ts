import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'pythagorean',
  slug: { en: 'pythagorean-theorem-calculator' },
  category: 'geometry',
  tags: [
    'Pythagorean theorem',
    'right triangle',
    'hypotenuse',
    'a² + b² = c²',
    'missing side',
    'distance',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'f',
      type: 'segmented',
      labelKey: 'find',
      default: 'c',
      options: [
        { value: 'c', labelKey: 'find.c' },
        { value: 'leg', labelKey: 'find.leg' },
      ],
    },
    { id: 'a', param: 'a', type: 'number', labelKey: 'a', default: 3, min: 0, max: 1e12 },
    {
      id: 'b',
      param: 'b',
      type: 'number',
      labelKey: 'b',
      labelBy: 'find',
      default: 4,
      min: 0,
      max: 1e12,
    },
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'find',
      format: 'sig',
      decimals: 10,
      primary: true,
    },
    { id: 'area', labelKey: 'out.area', format: 'sig', decimals: 10 },
    { id: 'perimeter', labelKey: 'out.perimeter', format: 'sig', decimals: 10 },
    { id: 'angleA', labelKey: 'out.angleA', format: 'number', decimals: 4 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 9.3 Use Properties of Angles, Triangles, and the Pythagorean Theorem',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/9-3-use-properties-of-angles-triangles-and-the-pythagorean-theorem',
      accessed: '2026-11-24',
      locator:
        'a² + b² = c²; Example 9.22: legs 3 and 4 → c = 5; Example 9.23: leg 5, hypotenuse 13 → b = 12; Example 9.24: x² + x² = 10² → x ≈ 7.1',
    },
    {
      title: 'Prealgebra 2e, C Geometric Formulas',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas',
      accessed: '2026-11-24',
      locator: 'Pythagorean theorem; triangle area ½bh',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['area', 'root', 'scientific-calculator'],
  examples: [
    { id: 'hyp', inputs: { find: 'c', a: 3, b: 4 }, expect: { result: 5, area: 6 } },
    { id: 'leg', inputs: { find: 'leg', a: 5, b: 13 }, expect: { result: 12 } },
    {
      id: 'bracket',
      inputs: { find: 'leg', a: 7.0710678118654755, b: 10 },
      expect: { result: 7.07106781187 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
