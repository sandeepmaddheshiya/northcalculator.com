import type { CalculatorDefinition, NumberInput, SelectInput } from '@/calculators/types';

const charge = (id: string, def: number): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  allowNegative: true,
  min: -1e30,
  max: 1e30,
  row: { id: `${id}Row`, legendKey: `${id}Row` },
});
const unit = (id: string, row: string): SelectInput => ({
  id,
  param: id,
  type: 'select',
  labelKey: 'cu',
  default: 'e',
  options: ['C', 'mC', 'uC', 'nC', 'e'].map((u) => ({ value: u, labelKey: `unit.${u}` })),
  row: { id: row, legendKey: row },
});

export const definition: CalculatorDefinition = {
  id: 'coulomb',
  slug: { en: 'coulombs-law-calculator' },
  category: 'electronics',
  tags: [
    'Coulomb’s law',
    'electric force',
    'electrostatic force',
    'point charges',
    'Coulomb constant',
    'k',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    charge('q1', 1),
    unit('u1', 'q1Row'),
    charge('q2', -1),
    unit('u2', 'q2Row'),
    {
      id: 'r',
      param: 'r',
      type: 'number',
      labelKey: 'r',
      default: 5.3e-11,
      min: 0,
      max: 1e30,
      helpKey: 'r.help',
    },
  ],
  outputs: [
    { id: 'force', labelKey: 'out.force', format: 'sig', decimals: 8, primary: true },
    { id: 'kind', labelKey: 'out.kind', format: 'text' },
    { id: 'field', labelKey: 'out.field', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 18.3 Coulomb’s Law',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/18-3-coulombs-law',
      accessed: '2026-11-25',
      locator:
        'F = k|q₁q₂|/r², k = 8.988 × 10⁹ N·m²/C²; Example 18.1: electron and proton 0.530 × 10⁻¹⁰ m apart → 8.19 × 10⁻⁸ N, attractive',
    },
    {
      title: 'University Physics Volume 2, 5.3 Coulomb’s Law',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law',
      accessed: '2026-11-25',
      locator:
        'F = (1/4πε₀)|q₁q₂|/r² (Eq. 5.1); Example 5.1: ±1.602 × 10⁻¹⁹ C at 5.29 × 10⁻¹¹ m → 8.25 × 10⁻⁸ N',
    },
    {
      title: 'CODATA Values: vacuum electric permittivity and elementary charge',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://physics.nist.gov/cgi-bin/cuu/Value?ep0',
      accessed: '2026-11-25',
      locator:
        'ε₀ = 8.854 187 8188(14) × 10⁻¹² F/m (2022 CODATA); e = 1.602 176 634 × 10⁻¹⁹ C exactly',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['gravitation', 'force', 'ohms-law'],
  examples: [
    {
      id: 'hydrogen',
      inputs: { q1: 1, u1: 'e', q2: -1, u2: 'e', r: 5.3e-11 },
      expect: { force: 8.21316322812e-8 },
    },
    {
      id: 'bohr',
      inputs: { q1: 1, u1: 'e', q2: -1, u2: 'e', r: 5.29e-11 },
      expect: { force: 8.24424423433e-8 },
    },
    {
      id: 'microcoulombs',
      inputs: { q1: 1, u1: 'uC', q2: 1, u2: 'uC', r: 1 },
      expect: { force: 0.00898755178617 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
