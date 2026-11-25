import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const dim = (id: string, param: string, def: number, shapes: string[]): NumberInput => ({
  id,
  param,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e9,
  showIf: { input: 'shape', in: shapes },
});

export const definition: CalculatorDefinition = {
  id: 'surface-area',
  slug: { en: 'surface-area-calculator' },
  category: 'geometry',
  tags: ['surface area', 'rectangular prism', 'cube', 'cylinder', 'sphere', 'lateral area'],
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
      options: ['box', 'cube', 'cylinder', 'sphere'].map((v) => ({
        value: v,
        labelKey: `shape.${v}`,
      })),
    },
    dim('length', 'l', 14, ['box']),
    dim('width', 'w', 9, ['box']),
    dim('height', 'h', 17, ['box', 'cylinder']),
    dim('side', 'a', 2.5, ['cube']),
    dim('radius', 'r', 6, ['cylinder', 'sphere']),
  ],
  outputs: [
    { id: 'total', labelKey: 'out.total', format: 'sig', decimals: 10, primary: true },
    { id: 'lateral', labelKey: 'out.lateral', format: 'sig', decimals: 10 },
    { id: 'base', labelKey: 'out.base', format: 'sig', decimals: 10 },
    { id: 'volume', labelKey: 'out.volume', format: 'sig', decimals: 10 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 9.6 Solve Geometry Applications: Volume and Surface Area',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area',
      accessed: '2026-11-25',
      locator:
        'S = 2LH + 2LW + 2WH, cube 6s², sphere 4πr², cylinder 2πr² + 2πrh (π ≈ 3.14); Example 9.47: 14 × 9 × 17 → 1,034; Example 9.48: 30 × 25 × 20 → 3,700; Example 9.49: cube 2.5 → 37.5; Example 9.51: sphere r = 6 → 452.16; Example 9.54: can r = 4, h = 13 → 427.04',
    },
    {
      title: 'Contemporary Mathematics, 10.7 Volume and Surface Area',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/10-7-volume-and-surface-area',
      accessed: '2026-11-25',
      locator:
        'prism SA = 2B + ph, cylinder SA = 2πr² + 2πrh; Example 10.56: 10 × 5 × 3 → 190 cm²; Example 10.60: cylinder r = 5, h = 12 → 534 in²',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['volume', 'area', 'circle'],
  examples: [
    {
      id: 'box',
      inputs: { shape: 'box', length: 14, width: 9, height: 17 },
      expect: { total: 1034 },
    },
    { id: 'sphere', inputs: { shape: 'sphere', radius: 6 }, expect: { total: 452.389342117 } },
    {
      id: 'can',
      inputs: { shape: 'cylinder', radius: 4, height: 13 },
      expect: { total: 427.256600888 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
