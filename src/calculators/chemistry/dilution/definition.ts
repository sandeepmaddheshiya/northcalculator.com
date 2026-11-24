import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const FIND = ['c1', 'v1', 'c2', 'v2'] as const;
const field = (id: (typeof FIND)[number], def: number): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e12,
  showIf: { input: 'find', in: FIND.filter((f) => f !== id) },
});

export const definition: CalculatorDefinition = {
  id: 'dilution',
  slug: { en: 'dilution-calculator' },
  category: 'chemistry',
  tags: ['dilution', 'C1V1 = C2V2', 'M1V1 = M2V2', 'stock solution', 'molarity', 'concentration'],
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
      default: 'v1',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    field('c1', 16),
    field('v1', 0.25),
    field('c2', 0.5),
    field('v2', 8),
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
    { id: 'solvent', labelKey: 'out.solvent', format: 'sig', decimals: 8 },
    { id: 'factor', labelKey: 'out.factor', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'Chemistry 2e, 3.3 Molarity',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity',
      accessed: '2026-11-24',
      locator:
        'C₁V₁ = C₂V₂ (any units that cancel); Example 3.19: 0.850 L of 5.00 M to 1.80 L → 2.36 M; Example 3.20: 11 mL of 0.45 M to 0.12 M → 41 mL; Example 3.21: 5.00 L of 0.100 M from 1.59 M → 0.314 L',
    },
    {
      title: 'Introductory Chemistry (LibreTexts), 13.7 Solution Dilution',
      publisher: 'Marisa Alviar-Agnew and Henry Agnew, Sacramento City College (LibreTexts)',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/13:_Solutions/13.07:_Solution_Dilution',
      accessed: '2026-11-24',
      locator:
        'M₁V₁ = M₂V₂; 100. mL of 2.0 M HCl to 500. mL → 0.40 M; Example 13.7.1: 8.00 L of 0.50 M HNO₃ from 16 M → 0.25 L; Exercise 13.7.1: 76.5 mL of 0.885 M KBr to 0.500 M → 135.4 mL',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['molar-mass', 'ratio', 'percentage'],
  examples: [
    {
      id: 'stock',
      inputs: { find: 'v1', c1: 16, c2: 0.5, v2: 8 },
      expect: { result: 0.25, solvent: 7.75 },
    },
    {
      id: 'diluted',
      inputs: { find: 'c2', c1: 5, v1: 0.85, v2: 1.8 },
      expect: { result: 2.36111111111 },
    },
    {
      id: 'final',
      inputs: { find: 'v2', c1: 0.885, v1: 76.5, c2: 0.5 },
      expect: { result: 135.405 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
