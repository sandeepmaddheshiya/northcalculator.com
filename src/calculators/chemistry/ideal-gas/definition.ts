import type { CalculatorDefinition, NumberInput, SelectInput } from '@/calculators/types';

const FIND = ['p', 'v', 'n', 't'] as const;
const qty = (id: (typeof FIND)[number], def: number, allowNegative = false): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  min: allowNegative ? -273.15 : 0,
  allowNegative,
  max: 1e12,
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
  id: 'ideal-gas',
  slug: { en: 'ideal-gas-law-calculator' },
  category: 'chemistry',
  tags: ['ideal gas law', 'PV = nRT', 'gas constant', 'moles of gas', 'pressure', 'STP'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'find',
      param: 'f',
      type: 'select',
      labelKey: 'find',
      default: 'v',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    qty('p', 745),
    unit('pu', 'p', 'torr', ['atm', 'kPa', 'bar', 'torr', 'psi']),
    qty('v', 1020),
    unit('vu', 'v', 'L', ['L', 'mL', 'm3']),
    qty('n', 40.8),
    qty('t', 25, true),
    unit('tu', 't', 'C', ['C', 'K', 'F']),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'find', format: 'text', primary: true },
    { id: 'atm', labelKey: 'out.atm', format: 'sig', decimals: 8 },
    { id: 'kPa', labelKey: 'out.kPa', format: 'sig', decimals: 8 },
    { id: 'L', labelKey: 'out.L', format: 'sig', decimals: 8 },
    { id: 'mol', labelKey: 'out.mol', format: 'sig', decimals: 8 },
    { id: 'K', labelKey: 'out.K', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'Chemistry 2e, 9.2 Relating Pressure, Volume, Amount, and Temperature: The Ideal Gas Law',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law',
      accessed: '2026-11-24',
      locator:
        'PV = nRT, R = 0.08206 L atm/(mol K) = 8.314 kPa L/(mol K); STP 273.15 K and 1 atm, about 22.4 L/mol; Example 9.9: 40.8 mol at 298 K and 0.980 atm → 1.02 × 10³ L; check: 2520 mol H₂ at 27 °C in 180 L → 350 bar',
    },
    {
      title: 'CODATA Value: molar gas constant',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r',
      accessed: '2026-11-24',
      locator: 'R = 8.314 462 618… J mol⁻¹ K⁻¹ (exact, 2022 CODATA)',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-24',
      locator:
        'atmosphere = 101.325 kPa; bar = 100 kPa; torr = 101.325/760 kPa; psi = 6.894757 kPa',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['molar-mass', 'dilution', 'pressure-converter'],
  examples: [
    {
      id: 'methane',
      inputs: { find: 'v', p: 745, pu: 'torr', n: 40.8, t: 25, tu: 'C', vu: 'L' },
      expect: { result: '1,018.2862 L' },
    },
    {
      id: 'tank',
      inputs: { find: 'p', v: 180, vu: 'L', n: 2520, t: 27, tu: 'C', pu: 'bar' },
      expect: { result: '349.38203 bar' },
    },
    {
      id: 'stp',
      inputs: { find: 'v', p: 1, pu: 'atm', n: 1, t: 0, tu: 'C', vu: 'L' },
      expect: { result: '22.41397 L' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
