import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'empirical-formula',
  slug: { en: 'empirical-formula-calculator' },
  category: 'chemistry',
  tags: [
    'empirical formula',
    'molecular formula',
    'percent composition to formula',
    'mole ratio',
    'elemental analysis',
    'simplest formula',
  ],
  difficulty: 'advanced',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'amounts',
      param: 'a',
      type: 'text',
      labelKey: 'amounts',
      default: 'C 74.02, H 8.710, N 17.27',
      maxLength: 2000,
      helpKey: 'amounts.help',
    },
    {
      id: 'molar',
      param: 'm',
      type: 'number',
      labelKey: 'molar',
      default: 162.3,
      min: 0,
      max: 1e7,
      helpKey: 'molar.help',
    },
  ],
  outputs: [
    { id: 'empirical', labelKey: 'out.empirical', format: 'text', primary: true },
    { id: 'molecular', labelKey: 'out.molecular', format: 'text' },
    { id: 'efm', labelKey: 'out.efm', format: 'number', decimals: 4 },
    { id: 'n', labelKey: 'out.n', format: 'integer' },
    { id: 'multiplier', labelKey: 'out.multiplier', format: 'integer' },
  ],
  sources: [
    {
      title: 'Chemistry 2e, 3.2 Determining Empirical and Molecular Formulas',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-2-determining-empirical-and-molecular-formulas',
      accessed: '2026-11-25',
      locator:
        'Convert to moles, divide by the smallest, multiply by an integer if needed; Example 3.11: 34.97 g Fe, 15.03 g O → Fe₁O₁.₅ × 2 = Fe₂O₃; Example 3.12: 27.29% C, 72.71% O → CO₂; Example 3.13: 74.02% C, 8.710% H, 17.27% N → C₅H₇N (81.13), 162.3 g/mol → C₁₀H₁₄N₂; checks: CH₂O, N₂O₅, C₈H₁₀N₄O₂',
    },
    {
      title:
        'Introductory Chemistry (LibreTexts), 6.8 Calculating Empirical Formulas and 6.9 Calculating Molecular Formulas',
      publisher: 'LibreTexts (adapted from CK-12)',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/06%3A_Chemical_Composition/6.08%3A_Calculating_Empirical_Formulas_for_Compounds',
      accessed: '2026-11-25',
      locator:
        'Assume 100 g, convert to moles, divide by the smallest, multiply to whole numbers; Example 6.8.1: 69.94% Fe, 30.06% O → 1.252 and 1.879 mol → Fe₂O₃; Exercise: 73.9% Hg, 26.1% Cl → HgCl₂; §6.9: BH₃, 27.7 g/mol ÷ 13.84 = 2 → B₂H₆; vitamin C 40.92% C, 4.58% H, 54.50% O, 176 amu → C₃H₄O₃, C₆H₈O₆',
    },
    {
      title: 'Standard Atomic Weights (abridged, 2024)',
      publisher: 'IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW)',
      url: 'https://www.ciaaw.org/abridged-atomic-weights.htm',
      accessed: '2026-11-25',
      locator:
        'Abridged values to five significant figures, e.g. H 1.008, C 12.011, N 14.007, O 15.999',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['percent-composition', 'molar-mass', 'molarity'],
  examples: [
    {
      id: 'nicotine',
      inputs: { amounts: 'C 74.02, H 8.710, N 17.27', molar: 162.3 },
      expect: { empirical: 'C5H7N', molecular: 'C10H14N2', n: 2 },
    },
    {
      id: 'rust',
      inputs: { amounts: 'Fe 69.94, O 30.06', molar: 0 },
      expect: { empirical: 'Fe2O3', multiplier: 2 },
    },
    {
      id: 'vitaminC',
      inputs: { amounts: 'C 40.92, H 4.58, O 54.50', molar: 176 },
      expect: { empirical: 'C3H4O3', molecular: 'C6H8O6' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
