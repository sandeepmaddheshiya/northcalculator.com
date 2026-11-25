import type { CalculatorDefinition } from '@/calculators/types';

const showFor = (...m: string[]) => ({ input: 'find', in: m }) as const;
const n = (
  id: string,
  param: string,
  def: number,
  row: string,
  extra: Record<string, unknown> = {},
) =>
  ({
    id,
    param,
    type: 'number',
    labelKey: id,
    default: def,
    allowNegative: true,
    min: -1e12,
    max: 1e12,
    row: { id: row, legendKey: `${row}Row` },
    ...extra,
  }) as const;

export const definition: CalculatorDefinition = {
  id: 'bernoulli',
  slug: { en: 'bernoulli-equation-calculator' },
  category: 'physics',
  tags: [
    'Bernoulli’s equation',
    'fluid pressure',
    'flow speed',
    'Bernoulli’s principle',
    'pressure drop',
    'hydraulics',
  ],
  difficulty: 'advanced',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'q',
      type: 'segmented',
      labelKey: 'find',
      default: 'p1',
      options: [
        { value: 'p1', labelKey: 'find.p1' },
        { value: 'p2', labelKey: 'find.p2' },
        { value: 'v2', labelKey: 'find.v2' },
      ],
    },
    n('p1', 'a', 1620, 'pt1', { showIf: showFor('p2', 'v2') }),
    n('v1', 'b', 1.96, 'pt1', { min: 0, allowNegative: false }),
    n('h1', 'c', 0, 'pt1'),
    n('p2', 'd', 101, 'pt2', { showIf: showFor('p1', 'v2') }),
    n('v2', 'e', 25.5, 'pt2', { min: 0, allowNegative: false, showIf: showFor('p1', 'p2') }),
    n('h2', 'f', 0, 'pt2'),
    {
      id: 'rho',
      param: 'r',
      type: 'number',
      labelKey: 'rho',
      default: 1000,
      min: 0,
      max: 1e6,
      advanced: true,
      helpKey: 'rho.help',
    },
    {
      id: 'g',
      param: 'g',
      type: 'number',
      labelKey: 'g',
      default: 9.80665,
      min: 0.01,
      max: 1000,
      advanced: true,
      helpKey: 'g.help',
    },
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'find',
      format: 'sig',
      decimals: 6,
      primary: true,
    },
    { id: 'p1', labelKey: 'out.p1', format: 'sig', decimals: 6 },
    { id: 'p2', labelKey: 'out.p2', format: 'sig', decimals: 6 },
    { id: 'v2', labelKey: 'out.v2', format: 'sig', decimals: 6 },
    { id: 'dp', labelKey: 'out.dp', format: 'sig', decimals: 6 },
    { id: 'total', labelKey: 'out.total', format: 'sig', decimals: 6 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 12.2 Bernoulli’s Equation and 12.3 The Most General Applications of Bernoulli’s Equation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/12-2-bernoullis-equation',
      accessed: '2026-11-25',
      locator:
        'P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂ (Eq. 12.18); Example 12.4: hose 1.96 m/s, nozzle 25.5 m/s at 1.01 × 10⁵ N/m² → 4.24 × 10⁵ N/m²; §12.3 Example 12.5: fire hose 6.40 cm and 3.00 cm, 40.0 L/s, nozzle 10.0 m up at 0 gauge → v 12.434 and 56.588 m/s, 1.62 × 10⁶ N/m² gauge at the base',
    },
    {
      title: 'University Physics Volume 1, 14.6 Bernoulli’s Equation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/14-6-bernoullis-equation',
      accessed: '2026-11-25',
      locator:
        'p + ½ρv² + ρgh = constant along a streamline (Eq. 14.16); Example 14.6: 4.24 × 10⁵ N/m²; Example 14.7: 1.62 × 10⁶ N/m² gauge, 12.4 → 56.6 m/s, 10.0 m rise → nozzle −2.9 kPa ≈ 0 gauge',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['flow-rate', 'pressure', 'free-fall'],
  examples: [
    {
      id: 'hose',
      inputs: { find: 'p1', p2: 101, v1: 1.96, h1: 0, v2: 25.5, h2: 0, rho: 1000, g: 9.8 },
      expect: { result: 424.2042 },
    },
    {
      id: 'fire',
      inputs: { find: 'p2', p1: 1620, v1: 12.4, h1: 0, v2: 56.6, h2: 10, rho: 1000, g: 9.8 },
      expect: { result: -2.9 },
    },
    {
      id: 'tank',
      inputs: { find: 'v2', p1: 0, v1: 0, h1: 5, p2: 0, h2: 0, rho: 1000, g: 9.8 },
      expect: { result: 9.89949493661 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
