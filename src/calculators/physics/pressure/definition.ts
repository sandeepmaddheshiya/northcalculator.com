import type { CalculatorDefinition } from '@/calculators/types';

const forMode = (...m: string[]) => ({ input: 'mode', in: m }) as const;

export const definition: CalculatorDefinition = {
  id: 'pressure',
  slug: { en: 'pressure-calculator' },
  category: 'physics',
  tags: ['pressure', 'P = F/A', 'hydrostatic pressure', 'pressure at depth', 'pascal', 'ρgh'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'mode',
      param: 'm',
      type: 'segmented',
      labelKey: 'mode',
      default: 'depth',
      options: [
        { value: 'force', labelKey: 'mode.force' },
        { value: 'depth', labelKey: 'mode.depth' },
      ],
    },
    {
      id: 'force',
      param: 'f',
      type: 'number',
      labelKey: 'force',
      default: 122000,
      min: 0,
      max: 1e15,
      showIf: forMode('force'),
    },
    {
      id: 'area',
      param: 'a',
      type: 'number',
      labelKey: 'area',
      default: 0.0177,
      min: 0,
      max: 1e12,
      showIf: forMode('force'),
    },
    {
      id: 'depth',
      param: 'h',
      type: 'number',
      labelKey: 'depth',
      default: 10.3,
      min: 0,
      max: 1e6,
      showIf: forMode('depth'),
    },
    {
      id: 'density',
      param: 'r',
      type: 'number',
      labelKey: 'density',
      default: 1000,
      min: 0,
      max: 1e6,
      showIf: forMode('depth'),
      helpKey: 'density.help',
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
      showIf: forMode('depth'),
    },
  ],
  outputs: [
    { id: 'pa', labelKey: 'out.pa', labelBy: 'mode', format: 'sig', decimals: 8, primary: true },
    { id: 'kpa', labelKey: 'out.kpa', format: 'sig', decimals: 8 },
    { id: 'atm', labelKey: 'out.atm', format: 'sig', decimals: 8 },
    { id: 'psi', labelKey: 'out.psi', format: 'sig', decimals: 8 },
    { id: 'absolute', labelKey: 'out.absolute', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 11.3 Pressure and 11.4 Variation of Pressure with Depth in a Fluid',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/11-4-variation-of-pressure-with-depth-in-a-fluid',
      accessed: '2026-11-25',
      locator:
        'P = F/A (§11.3, Eq. 11.7; Example 11.2: 6.90 × 10⁶ Pa on a 0.150 m disk → 1.22 × 10⁵ N); P = hρg (Eq. 11.17); Example 11.3: 40.0 m average depth → 392 kPa; Example 11.5: 1.00 atm of water pressure at 10.3 m',
    },
    {
      title: 'University Physics Volume 1, 14.1 Fluids, Density, and Pressure',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure',
      accessed: '2026-11-25',
      locator:
        'p = F/A (Eq. 14.3), p = p₀ + ρgh (Eq. 14.4); Example 14.1: p̄ = 40.0 m × 10³ kg/m³ × 9.80 m/s² = 392 kPa; water 1.000 × 10³ kg/m³ at 4 °C, sea water 1.030 × 10³',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-25',
      locator: 'standard atmosphere = 101 325 Pa; pound-force per square inch = 6.894757 kPa',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['force', 'density', 'pressure-converter'],
  examples: [
    {
      id: 'dam',
      inputs: { mode: 'depth', depth: 40, density: 1000, g: 9.8 },
      expect: { pa: 392000 },
    },
    {
      id: 'pool',
      inputs: { mode: 'depth', depth: 10.3, density: 1000, g: 9.8 },
      expect: { pa: 100940 },
    },
    {
      id: 'tank',
      inputs: { mode: 'force', force: 122000, area: 0.0176714586764 },
      expect: { pa: 6903787.75369 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
