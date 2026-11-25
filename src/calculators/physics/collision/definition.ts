import type { CalculatorDefinition } from '@/calculators/types';

const body = (id: 'm1' | 'v1' | 'm2' | 'v2', param: string, def: number) =>
  ({
    id,
    param,
    type: 'number',
    labelKey: id,
    default: def,
    min: id.startsWith('m') ? 0 : -3e8,
    max: id.startsWith('m') ? 1e30 : 3e8,
    allowNegative: id.startsWith('v'),
    row: { id: `b${id[1]}`, legendKey: `b${id[1]}Row` },
  }) as const;

export const definition: CalculatorDefinition = {
  id: 'collision',
  slug: { en: 'collision-calculator' },
  category: 'physics',
  tags: [
    'elastic collision',
    'inelastic collision',
    'conservation of momentum',
    'final velocity',
    'kinetic energy lost',
    'one dimension',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'kind',
      param: 'k',
      type: 'segmented',
      labelKey: 'kind',
      default: 'elastic',
      options: [
        { value: 'elastic', labelKey: 'kind.elastic' },
        { value: 'inelastic', labelKey: 'kind.inelastic' },
        { value: 'known', labelKey: 'kind.known' },
      ],
    },
    body('m1', 'a', 0.5),
    body('v1', 'b', 4),
    body('m2', 'c', 3.5),
    body('v2', 'd', 0),
    {
      id: 'v1f',
      param: 'e',
      type: 'number',
      labelKey: 'v1f',
      default: -4,
      allowNegative: true,
      min: -3e8,
      max: 3e8,
      helpKey: 'v1f.help',
      showIf: { input: 'kind', in: ['known'] },
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'kind', format: 'text', primary: true },
    { id: 'v1f', labelKey: 'out.v1f', format: 'sig', decimals: 8 },
    { id: 'v2f', labelKey: 'out.v2f', format: 'sig', decimals: 8 },
    { id: 'keBefore', labelKey: 'out.keBefore', format: 'sig', decimals: 8 },
    { id: 'keAfter', labelKey: 'out.keAfter', format: 'sig', decimals: 8 },
    { id: 'keChange', labelKey: 'out.keChange', format: 'sig', decimals: 8 },
    { id: 'lostPct', labelKey: 'out.lostPct', format: 'sig', decimals: 6 },
    { id: 'momentum', labelKey: 'out.momentum', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 8.4 Elastic Collisions and 8.5 Inelastic Collisions in One Dimension',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/8-4-elastic-collisions-in-one-dimension',
      accessed: '2026-11-25',
      locator:
        'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′ (Eq. 8.34), kinetic energy conserved (Eq. 8.35); Example 8.4: 0.500 kg at 4.00 m/s hits 3.50 kg at rest → −3.00 m/s and 1.00 m/s, 4.00 J unchanged; §8.5 Example 8.5: 0.150 kg puck at 35.0 m/s, 70.0 kg goalie → 7.48 × 10⁻² m/s, 91.9 J → 0.196 J; Example 8.6: 0.350 kg at 2.00 m/s, 0.500 kg at −0.500 m/s, v₁′ = −4.00 m/s → v₂′ = 3.70 m/s, 0.763 J → 6.22 J',
    },
    {
      title: 'University Physics Volume 1, 9.4 Types of Collisions',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/9-4-types-of-collisions',
      accessed: '2026-11-25',
      locator:
        'Elastic v₁,f = ((m₁ − m₂)v₁,i + 2m₂v₂,i) ÷ (m₁ + m₂); Example 9.10: proton 7.0 × 10⁶ m/s and neutron −4.0 × 10⁶ m/s stick → 1.5 × 10⁶ m/s; Example 9.11: 15 g puck at rest, 12 g puck at 2.5 m/s → 2.22 m/s and −0.28 m/s',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['momentum', 'kinetic-energy', 'force'],
  examples: [
    {
      id: 'elastic',
      inputs: { kind: 'elastic', m1: 0.5, v1: 4, m2: 3.5, v2: 0 },
      expect: { v1f: -3, v2f: 1, keChange: 0 },
    },
    {
      id: 'puck',
      inputs: { kind: 'inelastic', m1: 0.15, v1: 35, m2: 70, v2: 0 },
      expect: { keBefore: 91.875 },
    },
    {
      id: 'carts',
      inputs: { kind: 'known', m1: 0.35, v1: 2, m2: 0.5, v2: -0.5, v1f: -4 },
      expect: { v2f: 3.7 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
