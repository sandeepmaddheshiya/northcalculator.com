import type { CalculatorDefinition } from '@/calculators/types';

const FIND = ['image', 'focal', 'object'] as const;
const unless = (f: string) => ({ input: 'find', in: FIND.filter((x) => x !== f) });

export const definition: CalculatorDefinition = {
  id: 'thin-lens',
  slug: { en: 'thin-lens-equation-calculator' },
  category: 'physics',
  tags: [
    'thin lens equation',
    'lens formula',
    '1/f = 1/do + 1/di',
    'magnification',
    'focal length',
    'diopters',
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
      default: 'image',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    {
      id: 'object',
      param: 'o',
      type: 'number',
      labelKey: 'object',
      default: 0.75,
      allowNegative: true,
      min: -1e9,
      max: 1e9,
      showIf: unless('object'),
    },
    {
      id: 'image',
      param: 'i',
      type: 'number',
      labelKey: 'image',
      default: 1.5,
      allowNegative: true,
      min: -1e9,
      max: 1e9,
      showIf: unless('image'),
      helpKey: 'image.help',
    },
    {
      id: 'focal',
      param: 'f',
      type: 'number',
      labelKey: 'focal',
      default: 0.5,
      allowNegative: true,
      min: -1e9,
      max: 1e9,
      showIf: unless('focal'),
      helpKey: 'focal.help',
    },
    {
      id: 'unit',
      param: 'u',
      type: 'select',
      labelKey: 'unit',
      default: 'm',
      options: [
        { value: 'm', labelKey: 'unit.m' },
        { value: 'cm', labelKey: 'unit.cm' },
        { value: 'mm', labelKey: 'unit.mm' },
      ],
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
    { id: 'magnification', labelKey: 'out.magnification', format: 'sig', decimals: 8 },
    { id: 'kind', labelKey: 'out.kind', format: 'text' },
    { id: 'power', labelKey: 'out.power', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 25.6 Image Formation by Lenses',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses',
      accessed: '2026-11-25',
      locator:
        '1/d_o + 1/d_i = 1/f, m = −d_i/d_o, P = 1/f in diopters; Example 25.5: f = 8.00 cm → 12.5 D; Example 25.6: d_o = 0.750 m, f = 0.500 m → d_i = 1.50 m, m = −2.00; Example 25.7: 7.50 cm, f = 10.0 cm → −30.0 cm, m = 4.00; Example 25.8: f = −10.0 cm → −4.29 cm, m = 0.571',
    },
    {
      title: 'University Physics Volume 3, 2.4 Thin Lenses',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses',
      accessed: '2026-11-25',
      locator:
        'Eq. 2.19 and 2.22; Example 2.4 (f = 10.0 cm): d_o = 50.0 → 12.5 cm, m = −0.250; d_o = 5.00 → −10.0 cm, m = +2.00; d_o = 20.0 → 20.0 cm, m = −1.00; Example 2.5: d_o = 0.75 m, d_i = 1.5 m → f = 0.50 m',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['wave', 'trigonometry', 'fraction'],
  examples: [
    {
      id: 'bulb',
      inputs: { find: 'image', object: 0.75, focal: 0.5, unit: 'm' },
      expect: { result: 1.5, magnification: -2 },
    },
    {
      id: 'magnifier',
      inputs: { find: 'image', object: 7.5, focal: 10, unit: 'cm' },
      expect: { result: -30, magnification: 4 },
    },
    {
      id: 'diverging',
      inputs: { find: 'image', object: 7.5, focal: -10, unit: 'cm' },
      expect: { result: -4.28571428571 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
