import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'torque',
  slug: { en: 'torque-calculator' },
  category: 'physics',
  tags: ['torque', 'τ = rF sin θ', 'moment of force', 'lever arm', 'newton-metre', 'wrench torque'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'force', param: 'f', type: 'number', labelKey: 'force', default: 40, min: 0, max: 1e15 },
    {
      id: 'distance',
      param: 'r',
      type: 'number',
      labelKey: 'distance',
      default: 0.8,
      min: 0,
      max: 1e9,
    },
    {
      id: 'angle',
      param: 'a',
      type: 'number',
      labelKey: 'angle',
      default: 90,
      min: 0,
      max: 180,
      helpKey: 'angle.help',
    },
  ],
  outputs: [
    { id: 'torque', labelKey: 'out.torque', format: 'sig', decimals: 8, primary: true },
    { id: 'lever', labelKey: 'out.lever', format: 'sig', decimals: 8 },
    { id: 'lbft', labelKey: 'out.lbft', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 9.2 The Second Condition for Equilibrium',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium',
      accessed: '2026-11-25',
      locator:
        'τ = rF sin θ (Eq. 9.3), lever arm r⊥ = r sin θ (Eq. 9.4); 40 N perpendicular at 0.800 m → 32 N·m, 20 N → 16 N·m; Example 9.1: 26.0 kg at 1.60 m balances 32.0 kg at 1.30 m',
    },
    {
      title: 'University Physics Volume 1, 10.6 Torque',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/10-6-torque',
      accessed: '2026-11-25',
      locator:
        '|τ| = r⊥F = rF sin θ (Eq. 10.23); Example 10.14: (4)(40) sin 90° = 160 N·m, (5)(30) sin 53° = 120 N·m, (1)(20) sin 30° = 10 N·m; Example 10.15: 0.5 m × 20 N × sin 150° = 5.0 N·m',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-25',
      locator: 'pound-force foot = 1.355818 N·m',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['force', 'work-power', 'trigonometry'],
  examples: [
    { id: 'door', inputs: { force: 40, distance: 0.8, angle: 90 }, expect: { torque: 32 } },
    {
      id: 'angled',
      inputs: { force: 30, distance: 5, angle: 53 },
      expect: { torque: 119.795326507 },
    },
    { id: 'flywheel', inputs: { force: 20, distance: 0.5, angle: 150 }, expect: { torque: 5 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
