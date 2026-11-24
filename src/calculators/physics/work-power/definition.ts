import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'work-power',
  slug: { en: 'work-and-power-calculator' },
  category: 'physics',
  tags: ['work', 'power', 'W = Fd cos θ', 'P = W/t', 'joules', 'watts', 'horsepower'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'force', param: 'f', type: 'number', labelKey: 'force', default: 75, min: 0, max: 1e15 },
    {
      id: 'distance',
      param: 'd',
      type: 'number',
      labelKey: 'distance',
      default: 25,
      min: 0,
      max: 1e15,
    },
    {
      id: 'angle',
      param: 'a',
      type: 'number',
      labelKey: 'angle',
      default: 35,
      min: 0,
      max: 180,
      helpKey: 'angle.help',
    },
    {
      id: 'time',
      param: 't',
      type: 'number',
      labelKey: 'time',
      default: 0,
      min: 0,
      max: 1e12,
      helpKey: 'time.help',
    },
  ],
  outputs: [
    { id: 'work', labelKey: 'out.work', format: 'sig', decimals: 8, primary: true },
    { id: 'kj', labelKey: 'out.kj', format: 'sig', decimals: 8 },
    { id: 'power', labelKey: 'out.power', format: 'sig', decimals: 8 },
    { id: 'hp', labelKey: 'out.hp', format: 'sig', decimals: 8 },
    { id: 'wh', labelKey: 'out.wh', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 7.1 Work: The Scientific Definition and 7.7 Power',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/7-1-work-the-scientific-definition',
      accessed: '2026-11-25',
      locator:
        'W = Fd cos θ (Eq. 7.3); Example 7.1: 75.0 N at 35.0° over 25.0 m → 1.54 × 10³ J; P = W/t (§7.7, Eq. 7.69), 1 hp = 746 W; Example 7.11: 1884 J in 3.50 s → 538 W',
    },
    {
      title: 'University Physics Volume 1, 7.4 Power',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/7-4-power',
      accessed: '2026-11-25',
      locator:
        'P = ΔW/Δt (Eq. 7.10); Example 7.11: 0.9 × 80 kg × 9.8 m/s² × 0.60 m in 0.8 s → 529 W',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-25',
      locator: 'horsepower (550 ft·lbf/s) = 7.456999 E+02 W',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['force', 'kinetic-energy', 'power-converter'],
  examples: [
    {
      id: 'mower',
      inputs: { force: 75, distance: 25, angle: 35, time: 0 },
      expect: { work: 1535.91008304 },
    },
    {
      id: 'pullup',
      inputs: { force: 705.6, distance: 0.6, angle: 0, time: 0.8 },
      expect: { work: 423.36, power: 529.2 },
    },
    {
      id: 'lift',
      inputs: { force: 1000, distance: 10, angle: 0, time: 20 },
      expect: { power: 500 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
