import type { CalculatorDefinition } from '@/calculators/types';

const FIND = ['energy', 'capacitance', 'voltage'] as const;
const unless = (f: string) => ({ input: 'find', in: FIND.filter((x) => x !== f) });

export const definition: CalculatorDefinition = {
  id: 'capacitor',
  slug: { en: 'capacitor-energy-calculator' },
  category: 'electronics',
  tags: ['capacitor energy', 'Q = CV', 'E = ½CV²', 'capacitance', 'stored charge', 'farad'],
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
      default: 'energy',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    {
      id: 'c',
      param: 'c',
      type: 'number',
      labelKey: 'c',
      default: 8,
      min: 0,
      max: 1e15,
      row: { id: 'c', legendKey: 'cRow' },
      showIf: unless('capacitance'),
    },
    {
      id: 'cu',
      param: 'cu',
      type: 'select',
      labelKey: 'cu',
      default: 'uF',
      options: ['F', 'mF', 'uF', 'nF', 'pF'].map((u) => ({ value: u, labelKey: `unit.${u}` })),
      row: { id: 'c', legendKey: 'cRow' },
    },
    {
      id: 'v',
      param: 'v',
      type: 'number',
      labelKey: 'v',
      default: 10000,
      min: 0,
      max: 1e12,
      showIf: unless('voltage'),
    },
    {
      id: 'e',
      param: 'e',
      type: 'number',
      labelKey: 'e',
      default: 400,
      min: 0,
      max: 1e15,
      showIf: unless('energy'),
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
    { id: 'charge', labelKey: 'out.charge', format: 'sig', decimals: 8 },
    { id: 'joules', labelKey: 'out.joules', format: 'sig', decimals: 8 },
    { id: 'farads', labelKey: 'out.farads', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 19.5 Capacitors and Dielectrics and 19.7 Energy Stored in Capacitors',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/19-7-energy-stored-in-capacitors',
      accessed: '2026-11-25',
      locator:
        'Q = CV (Eq. 19.48); E = QV/2 = CV²/2 = Q²/2C (Eq. 19.75); Example 19.8: 8.85 nF at 3.00 × 10³ V → 26.6 µC; Teflon, 2.1 × 8.85 nF at 6.0 × 10⁴ V → 1.1 mC; Example 19.11: 4.00 × 10² J at 1.00 × 10⁴ V → 8.00 µF',
    },
    {
      title:
        'University Physics Volume 2, 8.1 Capacitors and Capacitance and 8.3 Energy Stored in a Capacitor',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-2/pages/8-3-energy-stored-in-a-capacitor',
      accessed: '2026-11-25',
      locator:
        'C = Q/V (Eq. 8.1); U = ½CV² = Q²/2C = ½QV (Eq. 8.10); Example 8.8: 12.0 µF at 4.0 V → 96 µJ, 2.0 µF at 8.0 V → 64 µJ; Example 8.9: 8.00 µF',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['rc-time-constant', 'ohms-law', 'electricity-cost'],
  examples: [
    {
      id: 'defib',
      inputs: { find: 'capacitance', v: 10000, e: 400, cu: 'uF' },
      expect: { result: 8 },
    },
    {
      id: 'plates',
      inputs: { find: 'energy', c: 8.85, cu: 'nF', v: 3000 },
      expect: { result: 0.039825, charge: 0.00002655 },
    },
    {
      id: 'small',
      inputs: { find: 'energy', c: 12, cu: 'uF', v: 4 },
      expect: { result: 0.000096 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
