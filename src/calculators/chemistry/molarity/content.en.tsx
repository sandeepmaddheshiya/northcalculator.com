import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Molarity Calculator',
  promise: 'Molarity of a solution, or the solute or volume needed for a given molarity.',
  title: 'Molarity Calculator: Moles per Litre, Mass and Volume',
  description:
    'Find a solution’s molarity from grams or moles of solute and the volume, or the mass or volume needed to make a solution of a given concentration.',
  summary:
    'Molarity is moles of solute per litre of solution: M = mol ÷ L. To make 0.250 L of 1.00 M salt solution you need 0.250 mol, about 14.6 g of NaCl, dissolved and made up to 0.250 L. If you start from grams, divide by the molar mass first. The volume is that of the whole solution, not the water added.',
  synonyms: [
    'mol/L calculator',
    'concentration calculator',
    'grams to molarity',
    'how to make a molar solution',
    'moles from molarity',
    'solution preparation calculator',
  ],
  ui: {
    find: 'Find',
    'find.molarity': 'Molarity',
    'find.amount': 'Solute',
    'find.volume': 'Volume',
    amt: 'Solute',
    amount: 'Amount of solute',
    'amount.g': 'Mass of solute (g)',
    'amount.mol': 'Moles of solute',
    au: 'Unit',
    'au.g': 'grams',
    'au.mol': 'moles',
    mm: 'Molar mass (g/mol)',
    'mm.help': 'Use the molar mass calculator for a formula, e.g. NaCl is 58.44.',
    vol: 'Solution volume',
    volume: 'Volume',
    vu: 'Unit',
    'vu.mL': 'mL',
    'vu.L': 'L',
    molarity: 'Molarity (mol/L)',
    'out.result': 'Molarity',
    'out.result.molarity': 'Molarity',
    'out.result.amount': 'Solute needed',
    'out.result.volume': 'Volume of solution',
    'out.M': 'Molarity (mol/L)',
    'out.mol': 'Moles of solute',
    'out.grams': 'Mass of solute (g)',
    'out.L': 'Volume (L)',
    explain: '{mol} mol of solute in {L} L of solution is {M} mol/L.',
    'step.mol': 'Convert grams to moles with the molar mass.',
    'step.molarity': 'Molarity = moles ÷ litres.',
    'step.amount': 'Moles = molarity × litres.',
    'step.volume': 'Litres = moles ÷ molarity.',
    'warn.mm': 'Enter the molar mass to work in grams.',
    'warn.volume': 'The volume must be greater than zero.',
    'warn.molarity': 'The molarity must be greater than zero.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Molarity">
        {'M = moles of solute ÷ litres of solution\nmoles = grams ÷ molar mass'}
      </Formula>
      <p>
        To prepare a solution, weigh the solute, dissolve it in less solvent than needed, then add
        solvent up to the final volume, usually in a volumetric flask. Molarity changes slightly
        with temperature because the volume does.
      </p>
    </>
  ),
  examples: [
    {
      id: 'ammonium',
      title: '42.23 g of NH₄Cl in 500.0 mL',
      body: (r) => (
        <p>
          42.23 ÷ 53.50 = 0.7893 mol, and 0.7893 ÷ 0.5000 L = <strong>{String(o(r))}</strong>, the
          1.579 M of LibreTexts Example 13.6.1.
        </p>
      ),
    },
    {
      id: 'permanganate',
      title: 'Grams of KMnO₄ for 3.00 L of 0.250 M',
      body: (r) => (
        <p>
          0.250 × 3.00 = 0.750 mol × 158.04 g/mol = <strong>{String(o(r))}</strong>, which
          LibreTexts Example 13.6.4 rounds to 119 g.
        </p>
      ),
    },
    {
      id: 'sugar',
      title: '0.133 mol of sugar in 355 mL',
      body: (r) => (
        <p>
          0.133 ÷ 0.355 = <strong>{String(o(r))}</strong>, the 0.375 M of OpenStax{' '}
          <em>Chemistry</em> Example 3.14.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Convert mL to L:</strong> 250 mL is 0.250 L. Forgetting this is the most common
        error.
      </li>
      <li>
        <strong>Hydrates count their water:</strong> use the molar mass of the hydrated formula,
        such as CuSO₄·5H₂O, if that is what you weigh out.
      </li>
      <li>
        <strong>Diluting a stock?</strong> Use the dilution calculator, C₁V₁ = C₂V₂.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate molarity?',
      a: 'Divide the moles of solute by the litres of solution. If you have grams, first divide by the molar mass. 22.4 g of HCl (36.5 g/mol) is 0.614 mol; in 1.56 L that is about 0.393 M. LibreTexts rounds the moles first and gets 0.394 M.',
    },
    {
      q: 'How many grams do I need for a solution?',
      a: 'Multiply molarity × litres × molar mass. For 0.250 L of 5.30 M NaCl: 5.30 × 0.250 × 58.44 ≈ 77.4 g, the OpenStax Example 3.17 answer. Dissolve it and make the total up to 0.250 L.',
    },
    {
      q: 'What is the difference between molarity and molality?',
      a: 'Molarity is moles per litre of solution and changes slightly with temperature. Molality is moles per kilogram of solvent and does not. For dilute water solutions near room temperature the two are close.',
    },
    {
      q: 'What volume of solution contains a given amount?',
      a: 'Divide the moles by the molarity. 4.88 mol of CuSO₄ at 2.35 M is contained in 4.88 ÷ 2.35 = 2.08 L of solution, as in LibreTexts Example 13.6.3. Measure the total volume of solution, not of water.',
    },
  ],
  ogSample: (r) => `42.23 g NH₄Cl in 500 mL → ${String(o(r))}`,
};
