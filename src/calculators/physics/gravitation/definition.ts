import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'gravitation',
  slug: { en: 'gravitational-force-calculator' },
  category: 'physics',
  tags: [
    'gravitational force',
    'Newton’s law of gravitation',
    'F = Gm₁m₂/r²',
    'gravitational constant',
    'surface gravity',
    'G',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'm1',
      param: 'a',
      type: 'number',
      labelKey: 'm1',
      default: 5.98e24,
      min: 0,
      max: 1e60,
      helpKey: 'mass.help',
    },
    { id: 'm2', param: 'b', type: 'number', labelKey: 'm2', default: 1, min: 0, max: 1e60 },
    {
      id: 'r',
      param: 'r',
      type: 'number',
      labelKey: 'r',
      default: 6.38e6,
      min: 0,
      max: 1e30,
      row: { id: 'r', legendKey: 'rRow' },
    },
    {
      id: 'ru',
      param: 'ru',
      type: 'select',
      labelKey: 'ru',
      default: 'm',
      options: [
        { value: 'm', labelKey: 'unit.m' },
        { value: 'km', labelKey: 'unit.km' },
      ],
      row: { id: 'r', legendKey: 'rRow' },
    },
  ],
  outputs: [
    { id: 'force', labelKey: 'out.force', format: 'sig', decimals: 8, primary: true },
    { id: 'a1', labelKey: 'out.a1', format: 'sig', decimals: 8 },
    { id: 'a2', labelKey: 'out.a2', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'CODATA Value: Newtonian constant of gravitation',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bg',
      accessed: '2026-11-25',
      locator:
        'G = 6.674 30(15) × 10⁻¹¹ m³ kg⁻¹ s⁻² (2022 CODATA), relative standard uncertainty 2.2 × 10⁻⁵',
    },
    {
      title: 'College Physics 2e, 6.5 Newton’s Universal Law of Gravitation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/6-5-newtons-universal-law-of-gravitation',
      accessed: '2026-11-25',
      locator:
        'F = GmM/r² (Eq. 6.40), g = GM/r² (Eq. 6.43); Earth M = 5.98 × 10²⁴ kg, r = 6.38 × 10⁶ m → g = 9.80 m/s²; Example 6.6: at the Moon’s 3.84 × 10⁸ m, g = 2.70 × 10⁻³ m/s²; two 1.000 kg masses 1.000 m apart → 6.674 × 10⁻¹¹ N',
    },
    {
      title: 'University Physics Volume 1, 13.1 Newton’s Law of Universal Gravitation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation',
      accessed: '2026-11-25',
      locator:
        'Example 13.1: two 9000 kg spacecraft 10.0 m apart → 5.4 × 10⁻⁵ N, 6.0 × 10⁻⁹ m/s²; Example 13.2: two galaxies of 1.6 × 10⁴² kg, 2.375 × 10²² m apart → 3.0 × 10²⁹ N',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['force', 'free-fall', 'scientific-notation'],
  examples: [
    {
      id: 'surface',
      inputs: { m1: 5.98e24, m2: 1, r: 6.38e6, ru: 'm' },
      expect: { force: 9.80540531245 },
    },
    {
      id: 'spacecraft',
      inputs: { m1: 9000, m2: 9000, r: 10, ru: 'm' },
      expect: { force: 0.00005406183 },
    },
    { id: 'unit', inputs: { m1: 1, m2: 1, r: 1, ru: 'm' }, expect: { force: 6.6743e-11 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
