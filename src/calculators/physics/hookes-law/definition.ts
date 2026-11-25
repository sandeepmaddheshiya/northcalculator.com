import type { CalculatorDefinition } from '@/calculators/types';

const FIND = ['force', 'k', 'x'] as const;
const showUnless = (id: string) => ({ input: 'find', in: FIND.filter((f) => f !== id) });

export const definition: CalculatorDefinition = {
  id: 'hookes-law',
  slug: { en: 'hookes-law-spring-calculator' },
  category: 'physics',
  tags: [
    'Hooke’s law',
    'spring constant',
    'F = kx',
    'spring force',
    'elastic potential energy',
    'spring period',
  ],
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
      default: 'k',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    {
      id: 'force',
      param: 'f',
      type: 'number',
      labelKey: 'force',
      default: 784,
      min: 0,
      max: 1e15,
      showIf: showUnless('force'),
    },
    {
      id: 'k',
      param: 'k',
      type: 'number',
      labelKey: 'k',
      default: 50,
      min: 0,
      max: 1e15,
      showIf: showUnless('k'),
    },
    {
      id: 'x',
      param: 'x',
      type: 'number',
      labelKey: 'x',
      default: 0.012,
      min: 0,
      max: 1e6,
      showIf: showUnless('x'),
    },
    {
      id: 'mass',
      param: 'm',
      type: 'number',
      labelKey: 'mass',
      default: 0,
      min: 0,
      max: 1e9,
      advanced: true,
      helpKey: 'mass.help',
    },
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'find',
      format: 'sig',
      decimals: 8,
      primary: true,
    },
    { id: 'energy', labelKey: 'out.energy', format: 'sig', decimals: 8 },
    { id: 'period', labelKey: 'out.period', format: 'sig', decimals: 8 },
    { id: 'frequency', labelKey: 'out.frequency', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 16.1 Hooke’s Law: Stress and Strain Revisited',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/16-1-hookes-law-stress-and-strain-revisited',
      accessed: '2026-11-25',
      locator:
        'F = −kx (Eq. 16.1), PE_el = ½kx² (Eq. 16.4); Example 16.1: 784 N compressing 1.20 cm → k = 6.53 × 10⁴ N/m; Example 16.2: k = 50.0 N/m, x = 0.150 m → 0.563 J',
    },
    {
      title: 'University Physics Volume 1, 7.1 Work and 15.1 Simple Harmonic Motion',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion',
      accessed: '2026-11-25',
      locator:
        'work to stretch a spring ½k(x_B² − x_A²) (§7.1, Example 7.5: 0.54 J for 6 cm → k = 3 N/cm; 6 → 12 cm takes 1.62 J); T = 2π√(m/k) (§15.1, Eq. 15.10; Example 15.2: 2.00 kg on 32.00 N/m → 1.57 s)',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['force', 'work-power', 'kinetic-energy'],
  examples: [
    {
      id: 'suspension',
      inputs: { find: 'k', force: 784, x: 0.012, mass: 0 },
      expect: { result: 65333.3333333 },
    },
    {
      id: 'toyGun',
      inputs: { find: 'force', k: 50, x: 0.15, mass: 0 },
      expect: { result: 7.5, energy: 0.5625 },
    },
    {
      id: 'oscillator',
      inputs: { find: 'force', k: 32, x: 0.02, mass: 2 },
      expect: { period: 1.57079632679 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
