import type { CalculatorDefinition, NumberInput, SelectInput } from '@/calculators/types';

const FIND = ['force', 'mass', 'accel'] as const;
const qty = (id: (typeof FIND)[number], def: number): NumberInput => ({
  id,
  param: `${id[0]!}v`,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e30,
  row: { id, legendKey: `${id}Row` },
  showIf: { input: 'find', in: FIND.filter((f) => f !== id) },
});
const unit = (id: string, row: string, def: string, values: string[]): SelectInput => ({
  id,
  param: id,
  type: 'select',
  labelKey: id,
  default: def,
  options: values.map((v) => ({ value: v, labelKey: `unit.${v}` })),
  row: { id: row, legendKey: `${row}Row` },
});

export const definition: CalculatorDefinition = {
  id: 'force',
  slug: { en: 'force-calculator' },
  category: 'physics',
  tags: ['F = ma', 'Newton’s second law', 'force', 'acceleration', 'newtons', 'weight'],
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
      default: 'accel',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    qty('force', 51),
    unit('fu', 'force', 'N', ['N', 'kN', 'lbf']),
    qty('mass', 24),
    unit('mu', 'mass', 'kg', ['kg', 'g', 'lb']),
    qty('accel', 2),
    unit('au', 'accel', 'ms2', ['ms2', 'g', 'fts2']),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'find', format: 'text', primary: true },
    { id: 'N', labelKey: 'out.N', format: 'sig', decimals: 8 },
    { id: 'kg', labelKey: 'out.kg', format: 'sig', decimals: 8 },
    { id: 'ms2', labelKey: 'out.ms2', format: 'sig', decimals: 8 },
    { id: 'weight', labelKey: 'out.weight', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 4.3 Newton’s Second Law of Motion: Concept of a System',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/4-3-newtons-second-law-of-motion-concept-of-a-system',
      accessed: '2026-11-24',
      locator:
        'F_net = ma (Eq. 4.4), w = mg (Eq. 4.7) with g = 9.80 m/s²; Example 4.1: 51 N on 24 kg → 2.1 m/s²; Example 4.2: 2100 kg at 49 m/s² plus 650 N friction → T = 2.6 × 10⁴ N per rocket',
    },
    {
      title: 'University Physics Volume 1, 5.3 Newton’s Second Law',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law',
      accessed: '2026-11-24',
      locator:
        'F_net = ma (Eq. 5.4); Example 5.5: 0.400 kg with |a| = √(3.00² + 7.00²) → 3.05 N; Example 5.6: 600.0 N at 0.2 m/s² → 3000 kg; Example 5.4 prints the rocket thrust as 2.5 × 10⁴ N (exact 25,887.5 N)',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-24',
      locator:
        'standard acceleration of free fall gₙ = 9.80665 m/s²; pound-force = 4.448222 N; pound = 0.45359237 kg; foot = 0.3048 m',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['kinetic-energy', 'free-fall', 'speed-distance-time'],
  examples: [
    {
      id: 'mower',
      inputs: { find: 'accel', force: 51, fu: 'N', mass: 24, mu: 'kg', au: 'ms2' },
      expect: { result: '2.125 m/s²' },
    },
    {
      id: 'car',
      inputs: { find: 'mass', force: 600, fu: 'N', accel: 0.2, au: 'ms2', mu: 'kg' },
      expect: { result: '3,000 kg' },
    },
    {
      id: 'sled',
      inputs: { find: 'force', mass: 2100, mu: 'kg', accel: 49, au: 'ms2', fu: 'N' },
      expect: { result: '102,900 N' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
