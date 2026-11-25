import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const FIND = ['p2', 'v2', 't2'] as const;
const q = (id: string, def: number, hideFor?: string): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  allowNegative: id.startsWith('t'),
  min: id.startsWith('t') ? -273.15 : 0,
  max: 1e12,
  row: {
    id: id.endsWith('1') ? 'before' : 'after',
    legendKey: id.endsWith('1') ? 'before' : 'after',
  },
  ...(hideFor ? { showIf: { input: 'find', in: FIND.filter((f) => f !== hideFor) } } : {}),
});

export const definition: CalculatorDefinition = {
  id: 'combined-gas',
  slug: { en: 'combined-gas-law-calculator' },
  category: 'chemistry',
  tags: [
    'combined gas law',
    'P1V1/T1 = P2V2/T2',
    'Boyle’s law',
    'Charles’s law',
    'Gay-Lussac’s law',
    'gas volume',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'f',
      type: 'segmented',
      labelKey: 'find',
      default: 'p2',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    q('p1', 1.82),
    q('v1', 8.33),
    q('t1', 286),
    q('p2', 1, 'p2'),
    q('v2', 5.72, 'v2'),
    q('t2', 355, 't2'),
    {
      id: 'tu',
      param: 'tu',
      type: 'segmented',
      labelKey: 'tu',
      default: 'K',
      options: [
        { value: 'K', labelKey: 'tu.K' },
        { value: 'C', labelKey: 'tu.C' },
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
    { id: 't1k', labelKey: 'out.t1k', format: 'sig', decimals: 8 },
    { id: 't2k', labelKey: 'out.t2k', format: 'sig', decimals: 8 },
    { id: 'constant', labelKey: 'out.constant', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'Introductory Chemistry (LibreTexts), 11.6 The Combined Gas Law',
      publisher: 'Marisa Alviar-Agnew and Henry Agnew, Sacramento City College (LibreTexts)',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/11%3A_Gases/11.06%3A_The_Combined_Gas_Law-_Pressure_Volume_and_Temperature',
      accessed: '2026-11-25',
      locator:
        'P₁V₁/T₁ = P₂V₂/T₂ at constant n, T in kelvin; Example 11.6.1: 8.33 L, 1.82 atm, 286 K → 5.72 L, 355 K is printed as 3.22 atm (the inputs give 3.29 atm); exercise: 46.7 mL at 662 torr, 266 K → 409 torr, 371 K gives 105 mL; §11.4 Boyle: 2.44 atm, 4.01 L → 1.93 atm gives 5.07 L; §11.5 Charles: 2.20 L at 22 °C → 71 °C gives 2.57 L',
    },
    {
      title:
        'Chemistry 2e, 9.2 Relating Pressure, Volume, Amount, and Temperature: The Ideal Gas Law',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law',
      accessed: '2026-11-25',
      locator:
        'P₁V₁/T₁ = P₂V₂/T₂; Example 9.10: 13.2 L at 153 atm, 300 K → 3.13 atm, 310 K gives 667 L; check: 0.250 L at 27 °C, 0.850 atm → 0 °C, 1.00 atm gives 0.193 L',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['ideal-gas', 'pressure-converter', 'temperature-converter'],
  examples: [
    {
      id: 'pressure',
      inputs: { find: 'p2', p1: 1.82, v1: 8.33, t1: 286, v2: 5.72, t2: 355, tu: 'K' },
      expect: { result: 3.28989987285 },
    },
    {
      id: 'scuba',
      inputs: { find: 'v2', p1: 153, v1: 13.2, t1: 300, p2: 3.13, t2: 310, tu: 'K' },
      expect: { result: 666.747603834 },
    },
    {
      id: 'boyle',
      inputs: { find: 'v2', p1: 2.44, v1: 4.01, t1: 300, p2: 1.93, t2: 300, tu: 'K' },
      expect: { result: 5.0696373057 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
