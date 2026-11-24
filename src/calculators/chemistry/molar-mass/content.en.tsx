import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'molarMass') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Molar Mass Calculator',
  promise: 'Type a chemical formula to get its molar mass and convert grams to moles.',
  title: 'Molar Mass Calculator: Molecular Weight and Grams to Moles',
  description:
    'Enter a chemical formula such as C9H8O4, Ca3(PO4)2 or CuSO4·5H2O to get its molar mass in g/mol from IUPAC atomic weights, plus moles and particles.',
  summary:
    'The molar mass of a compound is the sum of the atomic weights of every atom in its formula, in grams per mole. Aspirin, C₉H₈O₄, has 9 carbons, 8 hydrogens and 4 oxygens, so its molar mass is 9 × 12.011 + 8 × 1.008 + 4 × 15.999 = 180.159 g/mol. Dividing a mass in grams by the molar mass gives moles.',
  synonyms: [
    'molecular weight calculator',
    'formula mass calculator',
    'grams to moles calculator',
    'g/mol calculator',
    'molar mass of a compound',
    'molecular mass calculator',
  ],
  ui: {
    formula: 'Chemical formula',
    'formula.help':
      'Case matters: Co is cobalt, CO is carbon monoxide. Use ( ) and · for hydrates.',
    mass: 'Mass of sample (g)',
    'mass.help': 'Optional, to convert grams to moles.',
    'out.molarMass': 'Molar mass (g/mol)',
    'out.moles': 'Moles in the sample',
    'out.particles': 'Molecules or formula units',
    'out.atoms': 'Atoms per formula',
    explain: 'One mole of this substance weighs {m} grams.',
    'step.element': '{el}: atoms × atomic weight (share of the mass)',
    'step.sum': 'Add the contributions.',
    'step.moles': 'Moles = mass ÷ molar mass.',
    'warn.syntax':
      'This doesn’t look like a chemical formula. Use element symbols and numbers, such as H2SO4.',
    'warn.element': '“{at}” is not an element symbol. Check the capital letters.',
    'warn.paren': 'The brackets don’t match.',
    'warn.unstable':
      '{at} has no standard atomic weight because it has no stable isotopes, so the molar mass depends on the isotope.',
    rounding:
      'Uses the IUPAC abridged standard atomic weights (2024), mostly to 5 significant figures. The molar mass is shown to 4 decimals.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Molar mass">
        {
          'M = Σ (number of atoms × atomic weight)\nmoles = mass ÷ M\nparticles = moles × 6.02214076 × 10²³'
        }
      </Formula>
      <p>
        Atomic weights are the IUPAC abridged standard values. They are averages over each element’s
        natural isotopes, which is why chlorine is 35.45 and not a whole number. Groups in brackets
        are multiplied by the number after them, and a hydrate such as CuSO₄·5H₂O adds five waters.
        OpenStax <em>Chemistry</em> rounds carbon to 12.01 and oxygen to 16.00, so its answers can
        differ from these in the second decimal.
      </p>
    </>
  ),
  examples: [
    {
      id: 'aspirin',
      title: 'Aspirin, C9H8O4',
      body: (r, fmt) => (
        <p>
          9 × 12.011 + 8 × 1.008 + 4 × 15.999 = <strong>{fmt.num(o(r), 3)} g/mol</strong>. PubChem
          lists 180.16; OpenStax gets 180.15 using C = 12.01.
        </p>
      ),
    },
    {
      id: 'hydrate',
      title: 'Copper(II) sulfate pentahydrate, CuSO4·5H2O',
      body: (r, fmt) => (
        <p>
          CuSO₄ is 159.602 g/mol and five waters add 5 × 18.015 = 90.075, so the hydrate is{' '}
          <strong>{fmt.num(o(r), 3)} g/mol</strong>.
        </p>
      ),
    },
    {
      id: 'potassium',
      title: 'Moles in 4.7 g of potassium',
      body: (r, fmt) => (
        <p>
          4.7 g ÷ 39.098 g/mol = <strong>{fmt.sig(o(r, 'moles'), 4)} mol</strong>, which OpenStax
          Example 3.3 gives as 0.12 mol.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Capital letters matter.</strong> CO is carbon monoxide (28.01 g/mol); Co is cobalt
        (58.933 g/mol).
      </li>
      <li>
        <strong>Ions use the neutral atom weights.</strong> An electron’s mass is too small to
        matter, so enter NaCl for sodium chloride and SO4 for sulfate.
      </li>
      <li>
        <strong>Match your course.</strong> If your textbook’s table rounds atomic weights, your
        answer may differ in the last digit.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between molar mass and molecular weight?',
      a: 'They have the same number. Molecular weight, or molecular mass, is the mass of one molecule in atomic mass units (u). Molar mass is the mass of a mole of molecules in grams per mole. Water is 18.015 u per molecule and 18.015 g/mol.',
    },
    {
      q: 'How do I convert grams to moles?',
      a: 'Divide the mass in grams by the molar mass. 36 g of water is 36 ÷ 18.015 ≈ 2 moles. To go back, multiply moles by the molar mass: 0.5 mol of glucose (180.156 g/mol) weighs about 90.08 g.',
    },
    {
      q: 'Why are atomic weights not whole numbers?',
      a: 'Most elements are a mix of isotopes with different numbers of neutrons. The atomic weight is the average weighted by how common each isotope is in nature. Chlorine is about three quarters chlorine-35 and one quarter chlorine-37, giving 35.45.',
    },
    {
      q: 'How do I enter a hydrate or a formula with brackets?',
      a: 'Use brackets for groups, such as Ca3(PO4)2 or Al2(SO4)3. For hydrates, separate the water with a dot or an asterisk and put the number first: CuSO4·5H2O, CuSO4.5H2O or CuSO4*5H2O all work.',
    },
  ],
  ogSample: (r, fmt) => `C9H8O4 → ${fmt.num(o(r), 3)} g/mol`,
};
