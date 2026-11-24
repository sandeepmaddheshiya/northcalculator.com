import type { CalculatorDefinition } from '@/calculators/types';

export const SOLIDS = ['box', 'cube', 'cylinder', 'sphere', 'cone'] as const;
const dim = (id: 'a' | 'b' | 'c', def: number, shapes: readonly string[]) => ({
  id,
  param: id,
  type: 'number' as const,
  labelKey: id,
  labelBy: 'shape',
  default: def,
  min: 0,
  max: 1e9,
  showIf: { input: 'shape', in: shapes },
});

export const definition: CalculatorDefinition = {
  id: 'volume',
  slug: { en: 'volume-calculator' },
  category: 'geometry',
  tags: [
    'volume calculator',
    'surface area',
    'volume of a cylinder',
    'volume of a sphere',
    'volume of a cone',
    'cubic units',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'shape',
      param: 's',
      type: 'select',
      labelKey: 'shape',
      default: 'box',
      options: SOLIDS.map((s) => ({ value: s, labelKey: `shape.${s}` })),
    },
    dim('a', 14, SOLIDS),
    dim('b', 9, ['box', 'cylinder', 'cone']),
    dim('c', 17, ['box']),
  ],
  outputs: [
    { id: 'volume', labelKey: 'out.volume', format: 'sig', decimals: 10, primary: true },
    { id: 'surface', labelKey: 'out.surface', format: 'sig', decimals: 10 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 9.6 Solve Geometry Applications: Volume and Surface Area',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area',
      accessed: '2026-11-24',
      locator:
        'box V = LWH, S = 2LH + 2LW + 2WH (Example 9.47: 14 × 9 × 17 → 2,142, S = 1,034); cube 2.5 → 15.625, 37.5; sphere r = 6 → V ≈ 904.32, S ≈ 452.16; cylinder r = 3, h = 5 → V ≈ 141.3, S ≈ 150.72; cone r = 2, h = 6 → V ≈ 25.12 (π ≈ 3.14)',
    },
    {
      title: 'Prealgebra 2e, C Geometric Formulas',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas',
      accessed: '2026-11-24',
      locator:
        'volume and surface area formulas for rectangular solids, cubes, spheres, cylinders and cones',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['area', 'circle', 'volume-converter'],
  examples: [
    {
      id: 'box',
      inputs: { shape: 'box', a: 14, b: 9, c: 17 },
      expect: { volume: 2142, surface: 1034 },
    },
    {
      id: 'cylinder',
      inputs: { shape: 'cylinder', a: 4, b: 13 },
      expect: { volume: 653.451271947 },
    },
    { id: 'sphere', inputs: { shape: 'sphere', a: 6 }, expect: { volume: 904.778684234 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
