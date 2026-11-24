import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const coord = (id: string, def: number): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  allowNegative: true,
  min: -1e12,
  max: 1e12,
  row: { id: id.endsWith('1') ? 'p1' : 'p2', legendKey: id.endsWith('1') ? 'p1' : 'p2' },
});

export const definition: CalculatorDefinition = {
  id: 'slope',
  slug: { en: 'slope-calculator' },
  category: 'math',
  tags: [
    'slope',
    'gradient',
    'rise over run',
    'distance formula',
    'midpoint',
    'equation of a line',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [coord('x1', -2), coord('y1', -3), coord('x2', -7), coord('y2', 4)],
  outputs: [
    { id: 'slope', labelKey: 'out.slope', format: 'text', primary: true },
    { id: 'equation', labelKey: 'out.equation', format: 'text' },
    { id: 'distance', labelKey: 'out.distance', format: 'text' },
    { id: 'midpoint', labelKey: 'out.midpoint', format: 'text' },
    { id: 'angle', labelKey: 'out.angle', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'Intermediate Algebra 2e, 3.2 Slope of a Line and 11.1 Distance and Midpoint Formulas; Circles',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/intermediate-algebra-2e/pages/11-1-distance-and-midpoint-formulas-circles',
      accessed: '2026-11-24',
      locator:
        'm = (y₂ − y₁) ÷ (x₂ − x₁) (§3.2, Example 3.14: (−2, −3), (−7, 4) → −7/5; vertical lines undefined, horizontal 0); d = √((x₂ − x₁)² + (y₂ − y₁)²): Example 11.1 → 5, 11.2 → 13, 11.3 → √202 ≈ 14.2; Example 11.4: midpoint of (−5, −4), (7, 2) is (1, −1)',
    },
    {
      title: 'College Algebra 2e, 2.1 The Rectangular Coordinate Systems and Graphs',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-algebra-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs',
      accessed: '2026-11-24',
      locator:
        'Example 5: (−3, −1), (2, 3) → √41; Example 6: (0, 0), (8, 7) → √113 ≈ 10.63; Example 7: midpoint of (7, −2), (9, 5) is (8, 3/2)',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['pythagorean', 'quadratic', 'fraction'],
  examples: [
    { id: 'slope', inputs: { x1: -2, y1: -3, x2: -7, y2: 4 }, expect: { slope: '−7/5 = −1.4' } },
    {
      id: 'distance',
      inputs: { x1: 10, y1: -4, x2: -1, y2: 5 },
      expect: { distance: '√202 ≈ 14.2126704' },
    },
    { id: 'midpoint', inputs: { x1: 7, y1: -2, x2: 9, y2: 5 }, expect: { midpoint: '(8, 1.5)' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
