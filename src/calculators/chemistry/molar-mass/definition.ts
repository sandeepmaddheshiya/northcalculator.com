import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'molar-mass',
  slug: { en: 'molar-mass-calculator' },
  category: 'chemistry',
  tags: [
    'molar mass',
    'molecular weight',
    'formula mass',
    'g/mol',
    'grams to moles',
    'atomic weight',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'formula',
      param: 'f',
      type: 'text',
      labelKey: 'formula',
      default: 'C9H8O4',
      maxLength: 200,
      helpKey: 'formula.help',
    },
    {
      id: 'mass',
      param: 'g',
      type: 'number',
      labelKey: 'mass',
      default: 10,
      min: 0,
      max: 1e12,
      helpKey: 'mass.help',
    },
  ],
  outputs: [
    { id: 'molarMass', labelKey: 'out.molarMass', format: 'number', decimals: 4, primary: true },
    { id: 'moles', labelKey: 'out.moles', format: 'sig', decimals: 8 },
    { id: 'particles', labelKey: 'out.particles', format: 'sig', decimals: 6 },
    { id: 'atoms', labelKey: 'out.atoms', format: 'number', decimals: 0 },
  ],
  sources: [
    {
      title: 'Abridged Standard Atomic Weights 2024',
      publisher: 'IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW)',
      url: 'https://www.ciaaw.org/abridged-atomic-weights.htm',
      accessed: '2026-11-24',
      locator:
        'five-figure values based on Atomic Weights 2021 with the 2024 revisions for Gd, Lu and Zr; e.g. H 1.0080, C 12.011, O 15.999, Cl 35.45',
    },
    {
      title: 'Chemistry 2e, 3.1 Formula Mass and the Mole Concept',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept',
      accessed: '2026-11-24',
      locator:
        'formula mass = Σ atoms × atomic mass; CHCl₃ 119.37, aspirin 180.15, ibuprofen 206.27, Al₂(SO₄)₃ 342.14, NaCl 58.44 amu (using C 12.01, O 16.00); Example 3.6: 28.35 g glycine ÷ 75.07 g/mol = 0.3776 mol; N_A = 6.02214076 × 10²³',
    },
    {
      title: 'PubChem PUG REST: compound properties (MolecularWeight)',
      publisher: 'National Center for Biotechnology Information, U.S. National Library of Medicine',
      url: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/property/MolecularFormula,MolecularWeight/JSON',
      accessed: '2026-11-24',
      locator:
        'aspirin 180.16, chloroform 119.37, glucose 180.16, caffeine 194.19, water 18.015, sucrose 342.30, CuSO₄·5H₂O 249.69 g/mol',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['scientific-notation', 'percentage', 'rounding'],
  examples: [
    { id: 'aspirin', inputs: { formula: 'C9H8O4', mass: 10 }, expect: { molarMass: 180.159 } },
    { id: 'hydrate', inputs: { formula: 'CuSO4·5H2O', mass: 10 }, expect: { molarMass: 249.677 } },
    {
      id: 'potassium',
      inputs: { formula: 'K', mass: 4.7 },
      expect: { molarMass: 39.098, moles: 0.120210752468 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
