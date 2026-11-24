import type { CalculatorDefinition } from '@/calculators/types';

const FIND = ['percent', 'actual', 'theoretical'] as const;

export const definition: CalculatorDefinition = {
  id: 'percent-yield',
  slug: { en: 'percent-yield-calculator' },
  category: 'chemistry',
  tags: ['percent yield', 'theoretical yield', 'actual yield', 'reaction yield', 'stoichiometry'],
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
      default: 'percent',
      options: FIND.map((f) => ({ value: f, labelKey: `find.${f}` })),
    },
    {
      id: 'actual',
      param: 'a',
      type: 'number',
      labelKey: 'actual',
      default: 0.392,
      min: 0,
      max: 1e12,
      showIf: { input: 'find', in: ['percent', 'theoretical'] },
    },
    {
      id: 'theoretical',
      param: 't',
      type: 'number',
      labelKey: 'theoretical',
      default: 0.5072,
      min: 0,
      max: 1e12,
      showIf: { input: 'find', in: ['percent', 'actual'] },
    },
    {
      id: 'percent',
      param: 'p',
      type: 'number',
      labelKey: 'percent',
      default: 77.3,
      min: 0,
      max: 1000,
      showIf: { input: 'find', in: ['actual', 'theoretical'] },
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
    { id: 'lost', labelKey: 'out.lost', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title: 'Chemistry 2e, 4.4 Reaction Yields',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields',
      accessed: '2026-11-24',
      locator:
        'percent yield = actual yield ÷ theoretical yield × 100%; Example 4.13: 0.392 g of a theoretical 0.5072 g Cu → 77.3%; check: 12.5 g CF₂Cl₂ from 32.9 g CCl₄ → 48.3%',
    },
    {
      title:
        'Introductory Chemistry (LibreTexts), 8.7 Limiting Reactant, Theoretical Yield, and Percent Yield from Initial Masses of Reactants',
      publisher: 'Marisa Alviar-Agnew and Henry Agnew, Sacramento City College (LibreTexts)',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/08%3A_Quantities_in_Chemical_Reactions/8.07%3A_Limiting_Reactant_Theoretical_Yield_and_Percent_Yield_from_Initial_Masses_of_Reactants',
      accessed: '2026-11-24',
      locator:
        'Example 8.7.1: 14.9 g O₂ of a theoretical 15.7 g → 94.9%; yields above 100% mean an impure product',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['molar-mass', 'percentage', 'percent-difference'],
  examples: [
    {
      id: 'copper',
      inputs: { find: 'percent', actual: 0.392, theoretical: 0.5072 },
      expect: { result: 77.2870662461 },
    },
    {
      id: 'oxygen',
      inputs: { find: 'percent', actual: 14.9, theoretical: 15.7 },
      expect: { result: 94.9044585987 },
    },
    {
      id: 'expected',
      inputs: { find: 'actual', theoretical: 25, percent: 80 },
      expect: { result: 20 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
