import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'percent-composition',
  slug: { en: 'percent-composition-calculator' },
  category: 'chemistry',
  tags: [
    'percent composition',
    'mass percent',
    'percent by mass',
    'chemical formula',
    'elemental analysis',
    'mass fraction',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'mode',
      param: 'q',
      type: 'segmented',
      labelKey: 'mode',
      default: 'formula',
      options: [
        { value: 'formula', labelKey: 'mode.formula' },
        { value: 'masses', labelKey: 'mode.masses' },
      ],
    },
    {
      id: 'formula',
      param: 'f',
      type: 'text',
      labelKey: 'formula',
      default: 'C9H8O4',
      maxLength: 200,
      helpKey: 'formula.help',
      showIf: { input: 'mode', in: ['formula'] },
    },
    {
      id: 'sample',
      param: 'g',
      type: 'number',
      labelKey: 'sample',
      default: 100,
      min: 0,
      max: 1e12,
      helpKey: 'sample.help',
      showIf: { input: 'mode', in: ['formula'] },
    },
    {
      id: 'masses',
      param: 'm',
      type: 'text',
      labelKey: 'masses',
      default: 'C 7.34, H 1.85, N 2.85',
      maxLength: 2000,
      helpKey: 'masses.help',
      showIf: { input: 'mode', in: ['masses'] },
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'text', primary: true },
    { id: 'molarMass', labelKey: 'out.molarMass', format: 'number', decimals: 4 },
    { id: 'total', labelKey: 'out.total', format: 'sig', decimals: 8 },
    { id: 'elements', labelKey: 'out.elements', format: 'integer' },
  ],
  sources: [
    {
      title: 'Chemistry 2e, 3.2 Determining Empirical and Molecular Formulas',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-2-determining-empirical-and-molecular-formulas',
      accessed: '2026-11-25',
      locator:
        '%X = mass of X ÷ mass of compound × 100%; Example 3.9: 7.34 g C, 1.85 g H, 2.85 g N in 12.04 g → 61.0% C, 15.4% H, 23.7% N; NH₃ (14.01, 1.008) → 82.27% N, 17.76% H; Example 3.10: aspirin C₉H₈O₄, 180.159 g/mol → 60.00% C, 4.476% H, 35.52% O; Fe₂O₃ → 69.9% Fe',
    },
    {
      title:
        'Introductory Chemistry (LibreTexts), 6.7 Mass Percent Composition from a Chemical Formula',
      publisher: 'LibreTexts (adapted from CK-12)',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/06%3A_Chemical_Composition/6.07%3A_Mass_Percent_Composition_from_a_Chemical_Formula',
      accessed: '2026-11-25',
      locator:
        '% by mass = mass of element in 1 mol ÷ molar mass × 100%; Example 6.7.1: Cl₂O₇ (Cl 35.45, O 16.00, 182.90 g/mol) → 38.76% Cl, 61.24% O; a 12.50 g sample holds 4.845 g Cl and 7.655 g O',
    },
    {
      title: 'Standard Atomic Weights (abridged, 2024)',
      publisher: 'IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW)',
      url: 'https://www.ciaaw.org/abridged-atomic-weights.htm',
      accessed: '2026-11-25',
      locator:
        'Abridged values to five significant figures, e.g. H 1.008, C 12.011, N 14.007, O 15.999, Cl 35.45',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['molar-mass', 'molarity', 'percent-yield'],
  examples: [
    {
      id: 'aspirin',
      inputs: { mode: 'formula', formula: 'C9H8O4', sample: 100 },
      expect: { result: 'C 60.00%, H 4.476%, O 35.52%', molarMass: 180.159 },
    },
    {
      id: 'analysis',
      inputs: { mode: 'masses', masses: 'C 7.34, H 1.85, N 2.85' },
      expect: { result: 'C 60.96%, H 15.37%, N 23.67%', total: 12.04 },
    },
    {
      id: 'rust',
      inputs: { mode: 'formula', formula: 'Fe2O3', sample: 100 },
      expect: { result: 'Fe 69.94%, O 30.06%' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
