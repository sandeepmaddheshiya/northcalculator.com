import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'centripetal',
  slug: { en: 'centripetal-force-calculator' },
  category: 'physics',
  tags: [
    'centripetal force',
    'centripetal acceleration',
    'circular motion',
    'F = mv²/r',
    'banked curve',
    'g-force',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'mass', param: 'm', type: 'number', labelKey: 'mass', default: 900, min: 0, max: 1e30 },
    {
      id: 'speed',
      param: 'v',
      type: 'number',
      labelKey: 'speed',
      default: 25,
      min: 0,
      max: 3e8,
      row: { id: 'v', legendKey: 'vRow' },
    },
    {
      id: 'su',
      param: 'su',
      type: 'select',
      labelKey: 'su',
      default: 'ms',
      options: [
        { value: 'ms', labelKey: 'unit.ms' },
        { value: 'kmh', labelKey: 'unit.kmh' },
        { value: 'mph', labelKey: 'unit.mph' },
      ],
      row: { id: 'v', legendKey: 'vRow' },
    },
    {
      id: 'radius',
      param: 'r',
      type: 'number',
      labelKey: 'radius',
      default: 500,
      min: 0,
      max: 1e15,
    },
  ],
  outputs: [
    { id: 'force', labelKey: 'out.force', format: 'sig', decimals: 8, primary: true },
    { id: 'accel', labelKey: 'out.accel', format: 'sig', decimals: 8 },
    { id: 'friction', labelKey: 'out.friction', format: 'sig', decimals: 6 },
    { id: 'bank', labelKey: 'out.bank', format: 'sig', decimals: 6 },
    { id: 'period', labelKey: 'out.period', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 6.2 Centripetal Acceleration and 6.3 Centripetal Force',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/6-3-centripetal-force',
      accessed: '2026-11-25',
      locator:
        'a_c = v²/r (§6.2), F_c = mv²/r (Eq. 6.24), μ_s = v²/(rg) on a flat curve (Eq. 6.30), ideal bank tan θ = v²/(rg) (Eq. 6.36); Example 6.2: 25.0 m/s on a 500 m curve → 1.25 m/s², 0.128 g; Example 6.4: 900 kg → 1125 N, μ_s = 0.13; Example 6.5: 65.0° bank, 100 m → 45.8 m/s',
    },
    {
      title: 'University Physics Volume 1, 4.4 Uniform Circular Motion',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/4-4-uniform-circular-motion',
      accessed: '2026-11-25',
      locator:
        'a_c = v²/r (Eq. 4.27), ω = 2π/T; Example 4.10: 134.1 m/s at 1 g (9.8 m/s²) → r = 1835 m',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['force', 'speed-distance-time', 'gravitation'],
  examples: [
    {
      id: 'curve',
      inputs: { mass: 900, speed: 25, su: 'ms', radius: 500 },
      expect: { force: 1125, accel: 1.25 },
    },
    {
      id: 'jet',
      inputs: { mass: 1, speed: 134.1, su: 'ms', radius: 1835 },
      expect: { accel: 9.79989645777 },
    },
    {
      id: 'bank',
      inputs: { mass: 1, speed: 45.8, su: 'ms', radius: 100 },
      expect: { bank: 64.9435009664 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
