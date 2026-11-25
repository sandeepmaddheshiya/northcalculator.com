import type { CalculatorDefinition } from '@/calculators/types';

const dir = (id: string, param: string) => ({
  id,
  param,
  type: 'segmented' as const,
  labelKey: id,
  default: 'toward',
  options: [
    { value: 'toward', labelKey: 'dir.toward' },
    { value: 'away', labelKey: 'dir.away' },
  ],
});

export const definition: CalculatorDefinition = {
  id: 'doppler',
  slug: { en: 'doppler-effect-calculator' },
  category: 'physics',
  tags: [
    'Doppler effect',
    'observed frequency',
    'sound',
    'moving source',
    'moving observer',
    'pitch shift',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'fs', param: 'f', type: 'number', labelKey: 'fs', default: 150, min: 0, max: 1e12 },
    {
      id: 'vw',
      param: 'w',
      type: 'number',
      labelKey: 'vw',
      default: 340,
      min: 0.001,
      max: 1e9,
      helpKey: 'vw.help',
    },
    { id: 'vs', param: 's', type: 'number', labelKey: 'vs', default: 35, min: 0, max: 1e9 },
    dir('sdir', 'sd'),
    { id: 'vo', param: 'o', type: 'number', labelKey: 'vo', default: 0, min: 0, max: 1e9 },
    dir('odir', 'od'),
  ],
  outputs: [
    { id: 'fo', labelKey: 'out.fo', format: 'sig', decimals: 8, primary: true },
    { id: 'shift', labelKey: 'out.shift', format: 'sig', decimals: 8 },
    { id: 'ratio', labelKey: 'out.ratio', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 17.4 Doppler Effect and Sonic Booms',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/17-4-doppler-effect-and-sonic-booms',
      accessed: '2026-11-25',
      locator:
        'f_obs = f_s v_w/(v_w ∓ v_s) for a moving source (Eq. 17.20), f_obs = f_s(v_w ± v_obs)/v_w for a moving observer (Eq. 17.21); Example 17.4: 150 Hz horn, train at 35.0 m/s, sound at 340 m/s → 167 Hz approaching, 136 Hz receding',
    },
    {
      title: 'University Physics Volume 1, 17.7 The Doppler Effect',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect',
      accessed: '2026-11-25',
      locator:
        'f_o = f_s (v ± v_o)/(v ∓ v_s), top signs for approaching (Eq. 17.20, Table 17.4); Example 17.8: 167 Hz and 136 Hz; the engineer on the train hears 150 Hz',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['wave', 'speed-distance-time', 'speed-converter'],
  examples: [
    {
      id: 'approach',
      inputs: { fs: 150, vw: 340, vs: 35, sdir: 'toward', vo: 0, odir: 'toward' },
      expect: { fo: 167.213114754 },
    },
    {
      id: 'recede',
      inputs: { fs: 150, vw: 340, vs: 35, sdir: 'away', vo: 0, odir: 'toward' },
      expect: { fo: 136 },
    },
    {
      id: 'engineer',
      inputs: { fs: 150, vw: 340, vs: 35, sdir: 'away', vo: 35, odir: 'toward' },
      expect: { fo: 150 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
