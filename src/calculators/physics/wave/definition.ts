import type { CalculatorDefinition, NumberInput, SelectInput } from '@/calculators/types';

const FIND = ['speed', 'frequency', 'wavelength'] as const;
const qty = (id: (typeof FIND)[number], param: string, def: number): NumberInput => ({
  id,
  param,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e30,
  row: { id, legendKey: `${id}Row` },
  showIf: { input: 'find', in: FIND.filter((f) => f !== id) },
});
const unit = (id: string, row: string, def: string, values: string[]): SelectInput => ({
  id,
  param: id,
  type: 'select',
  labelKey: id,
  default: def,
  options: values.map((v) => ({ value: v, labelKey: `unit.${v}` })),
  row: { id: row, legendKey: `${row}Row` },
});

export const definition: CalculatorDefinition = {
  id: 'wave',
  slug: { en: 'wavelength-frequency-calculator' },
  category: 'physics',
  tags: ['wavelength', 'frequency', 'wave speed', 'v = fλ', 'period', 'speed of light'],
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
      default: 'wavelength',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    qty('speed', 'v', 299792458),
    unit('vu', 'speed', 'ms', ['ms', 'kms', 'c']),
    qty('frequency', 'f', 100),
    unit('fu', 'frequency', 'MHz', ['Hz', 'kHz', 'MHz', 'GHz', 'THz']),
    qty('wavelength', 'l', 2.5),
    unit('lu', 'wavelength', 'm', ['km', 'm', 'cm', 'mm', 'um', 'nm']),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'find', format: 'text', primary: true },
    { id: 'ms', labelKey: 'out.ms', format: 'sig', decimals: 10 },
    { id: 'hz', labelKey: 'out.hz', format: 'sig', decimals: 10 },
    { id: 'm', labelKey: 'out.m', format: 'sig', decimals: 10 },
    { id: 'period', labelKey: 'out.period', format: 'sig', decimals: 10 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 16.9 Waves',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/16-9-waves',
      accessed: '2026-11-25',
      locator:
        'v_w = λ/T = fλ (Eq. 16.66–16.67), for all waves; Example 16.8: λ = 10.0 m, T = 5.00 s → 2.00 m/s',
    },
    {
      title: 'University Physics Volume 1, 16.1 Traveling Waves',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-1/pages/16-1-traveling-waves',
      accessed: '2026-11-25',
      locator:
        'v = λ/T = λf (Eq. 16.1); c = 2.99792458 × 10⁸ m/s; Example 16.1: 5.00 m/s at 2.00 Hz → T = 0.50 s, λ = 2.50 m; Example 16.2: λ = 8.00 cm at 2.00 cm/s → T = 4.00 s, f = 0.25 Hz',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['speed-distance-time', 'trigonometry', 'scientific-notation'],
  examples: [
    {
      id: 'radio',
      inputs: {
        find: 'wavelength',
        speed: 299792458,
        vu: 'ms',
        frequency: 100,
        fu: 'MHz',
        lu: 'm',
      },
      expect: { result: '2.99792458 m' },
    },
    {
      id: 'string',
      inputs: { find: 'wavelength', speed: 5, vu: 'ms', frequency: 2, fu: 'Hz', lu: 'm' },
      expect: { result: '2.5 m', period: 0.5 },
    },
    {
      id: 'gull',
      inputs: { find: 'speed', wavelength: 10, lu: 'm', frequency: 0.2, fu: 'Hz', vu: 'ms' },
      expect: { result: '2 m/s' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
