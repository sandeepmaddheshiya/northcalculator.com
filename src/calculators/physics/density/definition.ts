import type { CalculatorDefinition, NumberInput, SelectInput } from '@/calculators/types';

const showFor = (...m: string[]) => ({ input: 'find', in: m }) as const;
const qty = (id: string, param: string, def: number, modes: string[]): NumberInput => ({
  id,
  param,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e30,
  row: { id, legendKey: `${id}Row` },
  showIf: showFor(...modes),
});
const unit = (
  id: string,
  param: string,
  row: string,
  def: string,
  values: string[],
): SelectInput => ({
  id,
  param,
  type: 'select',
  labelKey: id,
  default: def,
  options: values.map((v) => ({ value: v, labelKey: `unit.${v}` })),
  row: { id: row, legendKey: `${row}Row` },
});

export const definition: CalculatorDefinition = {
  id: 'density',
  slug: { en: 'density-calculator' },
  category: 'physics',
  tags: ['density', 'ρ = m/V', 'mass', 'volume', 'g/cm³', 'kg/m³', 'specific gravity'],
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
      default: 'density',
      options: [
        { value: 'density', labelKey: 'find.density' },
        { value: 'mass', labelKey: 'find.mass' },
        { value: 'volume', labelKey: 'find.volume' },
      ],
    },
    qty('density', 'd', 1000, ['mass', 'volume']),
    unit('densityUnit', 'du', 'density', 'gcm3', ['gcm3', 'kgm3', 'gL', 'lbft3']),
    qty('mass', 'm', 90.7, ['density', 'volume']),
    unit('massUnit', 'mu', 'mass', 'g', ['g', 'kg', 'lb']),
    qty('volume', 'v', 8, ['density', 'mass']),
    unit('volumeUnit', 'vu', 'volume', 'cm3', ['cm3', 'L', 'm3', 'ft3', 'galUS']),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'find', format: 'text', primary: true },
    { id: 'gcm3', labelKey: 'out.gcm3', format: 'sig', decimals: 8 },
    { id: 'kgm3', labelKey: 'out.kgm3', format: 'sig', decimals: 8 },
    { id: 'kg', labelKey: 'out.kg', format: 'sig', decimals: 8 },
    { id: 'L', labelKey: 'out.L', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'College Physics 2e, 11.2 Density',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/11-2-density',
      accessed: '2026-11-24',
      locator:
        'ρ = m/V (Eq. 11.2); Table 11.1: water 1.000 × 10³ kg/m³, aluminum 2.7, iron 7.8, lead 11.3, gold 19.32 × 10³ kg/m³; Example 11.1: 2.00 × 10⁹ m³ of water → 2.00 × 10¹² kg',
    },
    {
      title: 'Chemistry 2e, 1.4 Measurements',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/1-4-measurements',
      accessed: '2026-11-24',
      locator:
        'density = mass ÷ volume; Example 1.1: 90.7 g lead cube with 2.00 cm edges → 11.3 g/cm³; check: 5.34 g in 0.599 cm³ → 8.91 g/cm³; Example 1.2: 31.48 g iron displacing 4.0 mL → 7.9 g/mL; 1.95 g wood in 3.0 mL → 0.65 g/mL',
    },
    {
      title:
        'NIST Guide to the SI (Special Publication 811), Appendix B.8: Factors for Units Listed Alphabetically',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',
      accessed: '2026-11-24',
      locator: 'pound = 0.45359237 kg; cubic foot = 0.028316846592 m³; gallon (US) = 3.785411784 L',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['volume', 'kinetic-energy', 'molar-mass'],
  examples: [
    {
      id: 'lead',
      inputs: {
        find: 'density',
        mass: 90.7,
        massUnit: 'g',
        volume: 8,
        volumeUnit: 'cm3',
        densityUnit: 'gcm3',
      },
      expect: { result: '11.3375 g/cm³' },
    },
    {
      id: 'iron',
      inputs: {
        find: 'density',
        mass: 31.48,
        massUnit: 'g',
        volume: 4,
        volumeUnit: 'cm3',
        densityUnit: 'gcm3',
      },
      expect: { result: '7.87 g/cm³' },
    },
    {
      id: 'reservoir',
      inputs: {
        find: 'mass',
        density: 1000,
        densityUnit: 'kgm3',
        volume: 2e9,
        volumeUnit: 'm3',
        massUnit: 'kg',
      },
      expect: { kg: 2e12 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
