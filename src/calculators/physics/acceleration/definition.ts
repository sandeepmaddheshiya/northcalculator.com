import type { CalculatorDefinition } from '@/calculators/types';

const showFor = (...modes: string[]) => ({ input: 'find', in: modes }) as const;

export const definition: CalculatorDefinition = {
  id: 'acceleration',
  slug: { en: 'acceleration-calculator' },
  category: 'physics',
  tags: ['acceleration', 'a = Δv ÷ Δt', 'm/s²', 'deceleration', 'kinematics', 'g-force'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'q',
      type: 'segmented',
      labelKey: 'find',
      default: 'a',
      options: [
        { value: 'a', labelKey: 'find.a' },
        { value: 'v', labelKey: 'find.v' },
        { value: 't', labelKey: 'find.t' },
      ],
    },
    {
      id: 'v0',
      param: 'u',
      type: 'number',
      labelKey: 'v0',
      default: 0,
      allowNegative: true,
      min: -3e8,
      max: 3e8,
    },
    {
      id: 'v',
      param: 'v',
      type: 'number',
      labelKey: 'v',
      default: 30,
      allowNegative: true,
      min: -3e8,
      max: 3e8,
      showIf: showFor('a', 't'),
    },
    {
      id: 'su',
      param: 'su',
      type: 'select',
      labelKey: 'su',
      default: 'kmh',
      options: [
        { value: 'ms', labelKey: 'unit.ms' },
        { value: 'kmh', labelKey: 'unit.kmh' },
        { value: 'mph', labelKey: 'unit.mph' },
      ],
    },
    {
      id: 'a',
      param: 'a',
      type: 'number',
      labelKey: 'a',
      default: 2,
      allowNegative: true,
      min: -1e12,
      max: 1e12,
      helpKey: 'a.help',
      showIf: showFor('v', 't'),
    },
    {
      id: 't',
      param: 't',
      type: 'number',
      labelKey: 't',
      default: 20,
      min: 0,
      max: 1e12,
      showIf: showFor('a', 'v'),
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'find', format: 'text', primary: true },
    { id: 'accel', labelKey: 'out.accel', format: 'sig', decimals: 8 },
    { id: 'vf', labelKey: 'out.vf', format: 'sig', decimals: 8 },
    { id: 'time', labelKey: 'out.time', format: 'sig', decimals: 8 },
    { id: 'distance', labelKey: 'out.distance', format: 'sig', decimals: 8 },
    { id: 'gs', labelKey: 'out.gs', format: 'sig', decimals: 6 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 2.4 Acceleration and 2.5 Motion Equations for Constant Acceleration',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/2-4-acceleration',
      accessed: '2026-11-25',
      locator:
        'ā = Δv ÷ Δt (Eq. 2.10); Example 2.1: 0 to −15.0 m/s in 1.80 s → −8.33 m/s²; Example 2.4: 0 to 30.0 km/h in 20.0 s → 0.417 m/s²; Example 2.5: 30.0 km/h to 0 in 8.00 s → −1.04 m/s²; Example 2.7: −20.0 km/h to 0 in 10.0 s → +0.556 m/s²; §2.5 v = v₀ + at, x = v̄t: Example 2.9: 70.0 m/s at −1.50 m/s² for 40.0 s → 10.0 m/s; Example 2.10: 26.0 m/s² for 5.56 s → 402 m',
    },
    {
      title: 'University Physics Volume 1, 3.3 Average and Instantaneous Acceleration',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration',
      accessed: '2026-11-25',
      locator:
        'ā = Δv ÷ Δt = (v_f − v₀) ÷ (t_f − t₀) (Eq. 3.8); Example 3.5: racehorse 0 to −15.0 m/s in 1.80 s → −8.33 m/s²',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-25',
      locator:
        'mile per hour = 0.44704 m/s; kilometer per hour = 0.2777778 m/s (1/3.6); standard acceleration of gravity gₙ = 9.80665 m/s²',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['speed-distance-time', 'force', 'free-fall'],
  examples: [
    {
      id: 'subway',
      inputs: { find: 'a', v0: 0, v: 30, su: 'kmh', t: 20 },
      expect: { accel: 0.416666666667 },
    },
    {
      id: 'horse',
      inputs: { find: 'a', v0: 0, v: -15, su: 'ms', t: 1.8 },
      expect: { accel: -8.33333333333 },
    },
    {
      id: 'landing',
      inputs: { find: 'v', v0: 70, su: 'ms', a: -1.5, t: 40 },
      expect: { vf: 10, distance: 1600 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
