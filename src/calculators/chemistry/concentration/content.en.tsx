import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'pct') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Solution Concentration Calculator',
  promise: 'Mass percent, ppm, molality, mole fraction and molarity from two masses.',
  title: 'Solution Concentration Calculator: Mass %, ppm, Molality',
  description:
    'Turn the masses of solute and solvent (or solution) into mass percent, ppm, ppb, molality, mole fraction and, with a density, molarity, with each step shown.',
  summary:
    'Concentration can be stated many ways, and each suits a different job. Mass percent and ppm compare masses. Molality, moles per kilogram of solvent, does not change with temperature and drives freezing and boiling points. Mole fraction counts particles. Molarity, per litre of solution, needs the solution’s density to convert from masses.',
  synonyms: [
    'mass percent calculator',
    'ppm calculator chemistry',
    'molality calculator',
    'mole fraction calculator',
    'concentration unit converter',
    'parts per million from mass',
  ],
  ui: {
    solute: 'Solute mass (g)',
    basis: 'Second mass is',
    'basis.solvent': 'The solvent',
    'basis.solution': 'The whole solution',
    other: 'Mass (g)',
    'other.solvent': 'Solvent mass (g)',
    'other.solution': 'Solution mass (g)',
    mm: 'Solute molar mass (g/mol)',
    'mm.help': 'Needed for molality, mole fraction and molarity; 0 to skip.',
    mmSolvent: 'Solvent molar mass (g/mol)',
    'mmSolvent.help': 'Water is 18.015 g/mol.',
    density: 'Solution density (g/mL), optional',
    'density.help': 'Gives molarity, since molarity is per litre of solution.',
    'out.pct': 'Mass percent (%)',
    'out.molality': 'Molality (mol/kg solvent)',
    'out.x': 'Mole fraction of solute',
    'out.molarity': 'Molarity (mol/L)',
    'out.ppm': 'Parts per million (ppm)',
    'out.ppb': 'Parts per billion (ppb)',
    'out.solution': 'Solution mass (g)',
    'out.solvent': 'Solvent mass (g)',
    explain: 'The solute is {p}% of the {m} g of solution by mass.',
    'step.pct': 'Mass percent = solute ÷ solution × 100.',
    'step.mol': 'Moles of solute = mass ÷ molar mass.',
    'step.molality': 'Molality = moles of solute ÷ kilograms of solvent.',
    'step.x': 'Mole fraction = moles of solute ÷ total moles.',
    'step.molarity': 'Molarity = moles ÷ litres of solution (mass ÷ density).',
    'warn.mass': 'Enter a solute mass of 0 or more and a second mass above zero.',
    'warn.order': 'The solution mass must be at least the solute mass.',
    rounding: 'Results are shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="By mass">
        {'mass % = solute ÷ solution × 100\nppm = × 10⁶,  ppb = × 10⁹'}
      </Formula>
      <Formula label="By amount">
        {'molality = mol solute ÷ kg solvent\nmole fraction = mol solute ÷ total mol'}
      </Formula>
      <Formula label="By volume">{'molarity = mol solute ÷ (solution mass ÷ density)'}</Formula>
      <p>
        Solution mass is solute plus solvent. Mass percent, ppm, molality and mole fraction need
        only masses, so they are independent of temperature; molarity changes slightly as a solution
        expands when warmed.
      </p>
    </>
  ),
  examples: [
    {
      id: 'antifreeze',
      title: 'Antifreeze: 2.22 kg of ethylene glycol in 2.00 kg of water',
      body: (r, fmt) => (
        <p>
          35.8 mol of glycol in 2.00 kg of water is{' '}
          <strong>{fmt.sig(o(r, 'molality'), 3)} mol/kg</strong>, with a mole fraction of{' '}
          {fmt.sig(o(r, 'x'), 3)}, as in OpenStax <em>Chemistry 2e</em> Example 11.3.
        </p>
      ),
    },
    {
      id: 'saline',
      title: '36.5 g of NaCl in 355 g of saline solution',
      body: (r, fmt) => (
        <p>
          36.5 ÷ 355 × 100 = <strong>{fmt.sig(o(r), 3)}%</strong> NaCl by mass, as in the LibreTexts
          mass percent example.
        </p>
      ),
    },
    {
      id: 'mercury',
      title: '0.48 mg of mercury in 50.0 g of wastewater',
      body: (r, fmt) => (
        <p>
          0.00048 ÷ 50.0 × 10⁶ = <strong>{fmt.sig(o(r, 'ppm'), 2)} ppm</strong>, or{' '}
          {fmt.int(o(r, 'ppb'))} ppb (OpenStax §3.4).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Solvent or solution?</strong> Mass percent divides by the whole solution; molality
        divides by the solvent only. Choose which mass you entered.
      </li>
      <li>
        <strong>ppm in water:</strong> for dilute water solutions, 1 ppm is about 1 mg per litre,
        because a litre of water has a mass close to 1 kg.
      </li>
      <li>
        <strong>Molality for colligative properties:</strong> the freezing point depression
        calculator uses molality, the unit this calculator produces.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate mass percent?',
      a: 'Divide the solute’s mass by the solution’s total mass and multiply by 100. For 25.0 g of sugar dissolved in 100.0 g of water, the solution is 125.0 g and the sugar is 25.0 ÷ 125.0 × 100 = 20.0% by mass.',
    },
    {
      q: 'How do I convert to ppm and ppb?',
      a: 'Multiply the mass fraction by a million for ppm or a billion for ppb. 0.48 mg of mercury in 50.0 g of water is 0.00048 ÷ 50.0 = 9.6 × 10⁻⁶, which is 9.6 ppm or 9600 ppb.',
    },
    {
      q: 'What is the difference between molality and molarity?',
      a: 'Molality is moles of solute per kilogram of solvent; molarity is moles per litre of solution. Molality uses masses only and does not change with temperature. Converting between them requires the solution’s density.',
    },
    {
      q: 'How do I find the mole fraction?',
      a: 'Convert both components to moles and divide the solute’s moles by the total. 0.850 g of ammonia (17.03 g/mol) in 125 g of water gives 0.0499 mol and 6.94 mol, a mole fraction of about 7.14 × 10⁻³.',
    },
  ],
  ogSample: (r, fmt) => `2.22 kg glycol in 2.00 kg water → ${fmt.sig(o(r, 'molality'), 3)} mol/kg`,
};
