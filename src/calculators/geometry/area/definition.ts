import type { CalculatorDefinition } from '@/calculators/types';

export const SHAPES = ['rectangle', 'triangle', 'trapezoid', 'circle', 'parallelogram'] as const;
const dim = (id: 'a' | 'b' | 'c', def: number, shapes: readonly string[]) => ({
  id,
  param: id,
  type: 'number' as const,
  labelKey: id,
  labelBy: 'shape',
  default: def,
  min: 0,
  max: 1e12,
  showIf: { input: 'shape', in: shapes },
});

export const definition: CalculatorDefinition = {
  id: 'area',
  slug: { en: 'area-calculator' },
  category: 'geometry',
  tags: [
    'area calculator',
    'area of a rectangle',
    'area of a triangle',
    'area of a circle',
    'trapezoid area',
    'square footage',
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
      default: 'rectangle',
      options: SHAPES.map((s) => ({ value: s, labelKey: `shape.${s}` })),
    },
    dim('a', 32, SHAPES),
    dim('b', 20, ['rectangle', 'triangle', 'trapezoid', 'parallelogram']),
    dim('c', 14, ['trapezoid']),
  ],
  outputs: [
    { id: 'area', labelKey: 'out.area', format: 'sig', decimals: 10, primary: true },
    { id: 'perimeter', labelKey: 'out.perimeter', format: 'sig', decimals: 10 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 9.4 Use Properties of Rectangles, Triangles, and Trapezoids',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids',
      accessed: '2026-11-24',
      locator:
        'A = LW, P = 2L + 2W; triangle A = ½bh; trapezoid A = ½h(b + B); Example 9.27: 32 m × 20 m = 640 m², P = 104 m; Example 9.33: ½ × 11 × 8 = 44 in²; Example 9.38: h 6, bases 11 and 14 → 75 in²',
    },
    {
      title: 'Prealgebra 2e, 9.5 Solve Geometry Applications: Circles and Irregular Figures',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/9-5-solve-geometry-applications-circles-and-irregular-figures',
      accessed: '2026-11-24',
      locator: 'A = πr², C = 2πr; Example 9.41: r = 2.5 ft gives A ≈ 19.625 ft² with π ≈ 3.14',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['circle', 'volume', 'area-converter'],
  examples: [
    {
      id: 'rectangle',
      inputs: { shape: 'rectangle', a: 32, b: 20 },
      expect: { area: 640, perimeter: 104 },
    },
    { id: 'triangle', inputs: { shape: 'triangle', a: 11, b: 8 }, expect: { area: 44 } },
    { id: 'trapezoid', inputs: { shape: 'trapezoid', a: 6, b: 11, c: 14 }, expect: { area: 75 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
