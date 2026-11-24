import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'circle',
  slug: { en: 'circle-calculator' },
  category: 'geometry',
  tags: ['circle calculator', 'circumference', 'area of a circle', 'radius', 'diameter', 'pi'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'known',
      param: 'k',
      type: 'select',
      labelKey: 'known',
      default: 'r',
      options: ['r', 'd', 'c', 'a'].map((v) => ({ value: v, labelKey: `known.${v}` })),
    },
    {
      id: 'value',
      param: 'v',
      type: 'number',
      labelKey: 'value',
      labelBy: 'known',
      default: 2.5,
      min: 0,
      max: 1e12,
    },
  ],
  outputs: [
    { id: 'area', labelKey: 'out.area', format: 'sig', decimals: 10, primary: true },
    { id: 'radius', labelKey: 'out.radius', format: 'sig', decimals: 10 },
    { id: 'diameter', labelKey: 'out.diameter', format: 'sig', decimals: 10 },
    { id: 'circumference', labelKey: 'out.circumference', format: 'sig', decimals: 10 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 9.5 Solve Geometry Applications: Circles and Irregular Figures',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/9-5-solve-geometry-applications-circles-and-irregular-figures',
      accessed: '2026-11-24',
      locator:
        'd = 2r, C = 2πr = πd, A = πr²; Example 9.41: r = 2.5 ft → C ≈ 15.7 ft, A ≈ 19.625 ft²; Example 9.42: d = 4 ft → C ≈ 12.56 ft; Example 9.43: C = 47.1 cm → d ≈ 15 cm (π ≈ 3.14)',
    },
    {
      title: 'Prealgebra 2e, C Geometric Formulas',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas',
      accessed: '2026-11-24',
      locator: 'circle: C = 2πr = πd, A = πr²',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['area', 'volume', 'scientific-calculator'],
  examples: [
    {
      id: 'radius',
      inputs: { known: 'r', value: 2.5 },
      expect: { area: 19.6349540849, circumference: 15.7079632679 },
    },
    { id: 'table', inputs: { known: 'd', value: 4 }, expect: { circumference: 12.5663706144 } },
    { id: 'fromC', inputs: { known: 'c', value: 47.1 }, expect: { diameter: 14.9923956393 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
