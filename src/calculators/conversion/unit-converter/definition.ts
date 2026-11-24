import type { CalculatorDefinition } from '@/calculators/types';
import { UNITS, type Quantity } from '@/engine/units';

export const UNIT_SOURCES: CalculatorDefinition['sources'] = [
  {
    title:
      'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
    publisher: 'National Institute of Standards and Technology',
    url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
    accessed: '2026-11-24',
    locator: 'conversion factors used as test references',
  },
  {
    title: 'The International System of Units (SI Brochure), 9th edition',
    publisher: 'Bureau International des Poids et Mesures (BIPM)',
    url: 'https://www.bipm.org/en/publications/si-brochure',
    accessed: '2026-11-24',
    locator: 'SI base units and decimal prefixes',
  },
  {
    title:
      'Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices (Handbook 44), Appendix C',
    publisher: 'National Institute of Standards and Technology',
    url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition',
    accessed: '2026-11-24',
    locator: 'US customary units: 1 yd = 0.9144 m, 1 lb = 0.453 592 37 kg, 1 gal = 231 in³',
  },
  {
    title: 'Prefixes for binary multiples',
    publisher: 'National Institute of Standards and Technology',
    url: 'https://physics.nist.gov/cuu/Units/binary.html',
    accessed: '2026-11-24',
    locator: 'kibi (2¹⁰), mebi (2²⁰), gibi (2³⁰), tebi (2⁴⁰); IEC 80000-13',
  },
];

export const QUANTITIES = Object.keys(UNITS) as Quantity[];

/** Default pair shown when a quantity is chosen. */
export const PAIRS: Record<Quantity, readonly [string, string]> = {
  length: ['mi', 'km'],
  mass: ['lb', 'kg'],
  volume: ['gal_us', 'l'],
  temperature: ['f', 'c'],
  area: ['acre', 'ha'],
  speed: ['mph', 'kmh'],
  pressure: ['psi', 'bar'],
  energy: ['kcal', 'kj'],
  power: ['hp', 'kw'],
  data: ['gb', 'gib'],
  time: ['h', 'min'],
  fuel: ['mpg_us', 'l100km'],
};

const byQuantity = Object.fromEntries(QUANTITIES.map((q) => [q, UNITS[q].map((u) => u.id)]));
const allUnits = QUANTITIES.flatMap((q) =>
  UNITS[q].map((u) => ({ value: u.id, labelKey: `u.${u.id}` })),
);

export const definition: CalculatorDefinition = {
  id: 'unit-converter',
  slug: { en: 'unit-converter' },
  category: 'conversion',
  tags: [
    'unit converter',
    'metric conversion',
    'length',
    'weight',
    'volume',
    'temperature',
    'area',
    'speed',
    'pressure',
    'energy',
    'data size',
    'fuel economy',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'q',
      param: 'q',
      type: 'select',
      labelKey: 'q',
      default: 'length',
      options: QUANTITIES.map((q) => ({ value: q, labelKey: `q.${q}` })),
    },
    {
      id: 'v',
      param: 'v',
      type: 'number',
      labelKey: 'v',
      default: 1,
      allowNegative: true,
      min: -1e300,
      max: 1e300,
    },
    {
      id: 'from',
      param: 'from',
      type: 'select',
      labelKey: 'from',
      default: 'mi',
      options: allUnits,
      optionsBy: {
        input: 'q',
        map: byQuantity,
        fallback: Object.fromEntries(QUANTITIES.map((q) => [q, PAIRS[q][0]])),
      },
      swapWith: 'to',
    },
    {
      id: 'to',
      param: 'to',
      type: 'select',
      labelKey: 'to',
      default: 'km',
      options: allUnits,
      optionsBy: {
        input: 'q',
        map: byQuantity,
        fallback: Object.fromEntries(QUANTITIES.map((q) => [q, PAIRS[q][1]])),
      },
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'sig', decimals: 10, primary: true },
    { id: 'relation', labelKey: 'out.relation', format: 'text' },
    { id: 'exact', labelKey: 'out.exact', format: 'text' },
  ],
  sources: UNIT_SOURCES,

  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['currency-converter', 'bmi', 'scientific-calculator'],
  examples: [
    {
      id: 'oven',
      inputs: { q: 'temperature', v: 350, from: 'f', to: 'c' },
      expect: { result: 176.666666667 },
    },
    {
      id: 'drive',
      inputs: { q: 'data', v: 1, from: 'tb', to: 'gib' },
      expect: { result: 931.322574615 },
    },
    {
      id: 'fuel',
      inputs: { q: 'fuel', v: 30, from: 'mpg_us', to: 'l100km' },
      expect: { result: 7.84048611111 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
