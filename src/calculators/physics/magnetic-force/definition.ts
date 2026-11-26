import type { CalculatorDefinition } from '@/calculators/types';

const custom = { input: 'particle', in: ['custom'] } as const;

export const definition: CalculatorDefinition = {
  id: 'magnetic-force',
  slug: { en: 'magnetic-force-calculator' },
  category: 'physics',
  tags: [
    'magnetic force',
    'F = qvB sin θ',
    'cyclotron radius',
    'charged particle in a magnetic field',
    'Larmor radius',
    'cyclotron frequency',
  ],
  difficulty: 'advanced',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'particle',
      param: 'p',
      type: 'select',
      labelKey: 'particle',
      default: 'electron',
      options: ['electron', 'proton', 'alpha', 'custom'].map((v) => ({
        value: v,
        labelKey: `particle.${v}`,
      })),
    },
    {
      id: 'mass',
      param: 'm',
      type: 'number',
      labelKey: 'mass',
      default: 6.64e-27,
      min: 0,
      max: 1e30,
      showIf: custom,
    },
    {
      id: 'charge',
      param: 'c',
      type: 'number',
      labelKey: 'charge',
      default: 2,
      allowNegative: true,
      min: -1e30,
      max: 1e30,
      row: { id: 'ch', legendKey: 'chRow' },
      showIf: custom,
    },
    {
      id: 'qu',
      param: 'qu',
      type: 'select',
      labelKey: 'unit',
      default: 'e',
      options: [
        { value: 'e', labelKey: 'unit.e' },
        { value: 'C', labelKey: 'unit.C' },
      ],
      row: { id: 'ch', legendKey: 'chRow' },
      showIf: custom,
    },
    { id: 'v', param: 'v', type: 'number', labelKey: 'v', default: 6e7, min: 0, max: 3e8 },
    { id: 'b', param: 'b', type: 'number', labelKey: 'b', default: 0.5, min: 0, max: 1e6 },
    {
      id: 'angle',
      param: 'a',
      type: 'number',
      labelKey: 'angle',
      default: 90,
      min: 0,
      max: 180,
      advanced: true,
      helpKey: 'angle.help',
    },
  ],
  outputs: [
    { id: 'radius', labelKey: 'out.radius', format: 'sig', decimals: 6, primary: true },
    { id: 'force', labelKey: 'out.force', format: 'sig', decimals: 6 },
    { id: 'period', labelKey: 'out.period', format: 'sig', decimals: 6 },
    { id: 'freq', labelKey: 'out.freq', format: 'sig', decimals: 6 },
    { id: 'pitch', labelKey: 'out.pitch', format: 'sig', decimals: 6 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 22.4 Magnetic Field Strength and 22.5 Force on a Moving Charge: Examples',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/22-5-force-on-a-moving-charge-in-a-magnetic-field-examples-and-applications',
      accessed: '2026-11-26',
      locator:
        'F = qvB sin θ (Eq. 22.1), r = mv/(qB) (Eq. 22.7); Example 22.1: 20 nC at 10 m/s across 5 × 10⁻⁵ T → 1 × 10⁻¹¹ N; Example 22.2: electron at 6.00 × 10⁷ m/s in 0.500 T (m 9.11 × 10⁻³¹ kg, q 1.60 × 10⁻¹⁹ C) → r = 6.83 × 10⁻⁴ m',
    },
    {
      title: 'University Physics Volume 2, 11.3 Motion of a Charged Particle in a Magnetic Field',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-2/pages/11-3-motion-of-a-charged-particle-in-a-magnetic-field',
      accessed: '2026-11-26',
      locator:
        'r = mv/(qB) (Eq. 11.5), T = 2πm/(qB) (Eq. 11.6), pitch p = v∥T (Eq. 11.8); Example 11.2: alpha particle 6.64 × 10⁻²⁷ kg, 3.2 × 10⁻¹⁹ C, 0.050 T → T 2.61 × 10⁻⁶ s, quarter turn 6.5 × 10⁻⁷ s; Example 11.3: proton at 5 × 10⁵ m/s in 1.0 × 10⁻⁴ T, pitch = radius at θ = 81.0°',
    },
    {
      title: 'CODATA Values: electron, proton and alpha particle mass',
      publisher: 'NIST Physical Measurement Laboratory',
      url: 'https://physics.nist.gov/cgi-bin/cuu/Value?mal',
      accessed: '2026-11-26',
      locator:
        'm_α = 6.644 657 3450 × 10⁻²⁷ kg, mₑ = 9.109 383 7139 × 10⁻³¹ kg, mₚ = 1.672 621 925 95 × 10⁻²⁷ kg (CODATA 2022); e = 1.602 176 634 × 10⁻¹⁹ C (exact)',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-26', note: 'First published.' }],
  related: ['centripetal', 'coulomb', 'electric-potential'],
  examples: [
    {
      id: 'electron',
      inputs: { particle: 'electron', v: 6e7, b: 0.5, angle: 90 },
      expect: { radius: 0.000682275613357 },
    },
    {
      id: 'alpha',
      inputs: {
        particle: 'custom',
        mass: 6.64e-27,
        charge: 3.2e-19,
        qu: 'C',
        v: 1e5,
        b: 0.05,
        angle: 90,
      },
      expect: { period: 2.60752190248e-6 },
    },
    {
      id: 'rod',
      inputs: { particle: 'custom', mass: 1, charge: 20e-9, qu: 'C', v: 10, b: 5e-5, angle: 90 },
      expect: { force: 1e-11 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-26',
};
