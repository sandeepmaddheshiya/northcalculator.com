import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Freezing Point Depression Calculator',
  promise: 'New freezing and boiling points of a solution, or a molar mass from them.',
  title: 'Freezing Point Depression and Boiling Point Calculator',
  description:
    'Find how much a dissolved solute lowers the freezing point and raises the boiling point of water or another solvent, or work out an unknown molar mass.',
  summary:
    'Dissolving a solute lowers a solvent’s freezing point and raises its boiling point by amounts proportional to the solute’s molality: ΔT_f = i K_f m and ΔT_b = i K_b m. Only the number of dissolved particles matters, so salt, which splits into two ions, has about twice the effect of the same molality of sugar.',
  synonyms: [
    'boiling point elevation calculator',
    'colligative properties calculator',
    'van t Hoff factor calculator',
    'molar mass from freezing point',
    'salt water freezing point',
    'antifreeze freezing point',
  ],
  ui: {
    mode: 'Start from',
    'mode.mass': 'Masses',
    'mode.molality': 'Molality',
    'mode.molarMass': 'Find molar mass',
    solvent: 'Solvent',
    'solvent.water': 'Water (K_f 1.86, K_b 0.512)',
    'solvent.acetic': 'Acetic acid (3.9, 3.07)',
    'solvent.benzene': 'Benzene (5.12, 2.53)',
    'solvent.chloroform': 'Chloroform (4.68, 3.63)',
    'solvent.nitrobenzene': 'Nitrobenzene (8.1, 5.24)',
    'solvent.custom': 'Other: enter constants',
    kRow: 'Constants (°C·kg/mol)',
    kb: 'K_b',
    kf: 'K_f',
    tRow: 'Pure solvent (°C)',
    bp: 'Boiling point',
    fp: 'Freezing point',
    molality: 'Molality (mol solute per kg solvent)',
    solute: 'Solute mass (g)',
    mm: 'Solute molar mass (g/mol)',
    'mm.help': 'Use the molar mass calculator for a formula, e.g. NaCl is 58.44.',
    solventG: 'Solvent mass (g)',
    observed: 'Measured freezing point (°C)',
    i: 'Van ’t Hoff factor i',
    'i.help': '1 for sugar or other non-electrolytes, 2 for NaCl, 3 for CaCl₂ (ideal values).',
    'out.result': 'Result',
    'out.result.mass': 'New freezing point (°C)',
    'out.result.molality': 'New freezing point (°C)',
    'out.result.molarMass': 'Molar mass of the solute (g/mol)',
    'out.bp': 'New boiling point (°C)',
    'out.dTf': 'Freezing point depression ΔT_f (°C)',
    'out.dTb': 'Boiling point elevation ΔT_b (°C)',
    'out.molality': 'Molality (mol/kg)',
    'out.particles': 'Particle molality i × m (mol/kg)',
    explain: 'The solution freezes at {fp} °C and boils at {bp} °C.',
    'explain.M': 'The solute’s molar mass is about {M} g/mol.',
    'step.m': 'Molality = moles of solute ÷ kilograms of solvent.',
    'step.dTb': 'ΔT_b = i × K_b × m.',
    'step.dTfCalc': 'ΔT_f = i × K_f × m.',
    'step.dTf': 'ΔT_f = pure freezing point − measured freezing point.',
    'step.mFromT': 'm = ΔT_f ÷ (i × K_f).',
    'step.M': 'Molar mass = grams ÷ (molality × kg of solvent).',
    'warn.i': 'The van ’t Hoff factor must be above zero.',
    'warn.mass': 'Masses and molar mass must be above zero.',
    'warn.noDepression': 'The measured freezing point must be below the pure solvent’s.',
    'warn.dilute':
      'Above about 2 mol/kg solutions stop behaving ideally, so the real change is somewhat different.',
    rounding:
      'Constants are from OpenStax Chemistry 2e Table 11.2. The equations assume a dilute, ideal solution and a non-volatile solute.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Freezing point depression">{'ΔT_f = i × K_f × m'}</Formula>
      <Formula label="Boiling point elevation">{'ΔT_b = i × K_b × m'}</Formula>
      <Formula label="Molality">{'m = (grams ÷ molar mass) ÷ kg of solvent'}</Formula>
      <p>
        Molality uses the mass of solvent, not the volume of solution, so it does not change with
        temperature. The constants K_f and K_b depend only on the solvent.
      </p>
      <p>
        The van ’t Hoff factor counts particles per formula unit. Real ionic solutions have a
        slightly smaller effective i because ions pair up, especially at higher concentrations.
      </p>
    </>
  ),
  examples: [
    {
      id: 'salt',
      title: '4.2 g of NaCl in 125 g of water',
      body: (r, fmt) => (
        <p>
          0.072 mol NaCl gives 1.15 mol/kg of ions, so ΔT_f = 1.86 × 1.15 ={' '}
          <strong>{fmt.sig(o(r, 'dTf'), 2)} °C</strong> and the water freezes at about −2.1 °C, as
          in OpenStax <em>Chemistry 2e</em> Example 11.13.
        </p>
      ),
    },
    {
      id: 'iodine',
      title: '92.1 g of iodine dissolved in 800.0 g of chloroform',
      body: (r, fmt) => (
        <p>
          0.454 mol/kg raises the boiling point by 3.63 × 0.454 = 1.65 °C, to{' '}
          <strong>{fmt.sig(o(r, 'bp'), 4)} °C</strong> (Example 11.8).
        </p>
      ),
    },
    {
      id: 'unknown',
      title: 'An unknown: 4.00 g in 55.0 g of benzene freezes at 2.32 °C',
      body: (r, fmt) => (
        <p>
          ΔT_f = 5.5 − 2.32 = 3.18 °C, so m = 0.621 mol/kg and M ={' '}
          <strong>{fmt.sig(o(r), 3)} g/mol</strong>; OpenStax Example 11.11 rounds the steps and
          reports 1.1 × 10² g/mol.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Road salt:</strong> calcium chloride (i = 3) lowers the freezing point more per mole
        than sodium chloride (i = 2).
      </li>
      <li>
        <strong>Salting pasta water barely matters:</strong> a typical pinch raises the boiling
        point by a fraction of a degree, because K_b for water is only 0.512.
      </li>
      <li>
        <strong>Antifreeze</strong> protects engines by depression and elevation together: the
        coolant freezes lower and boils higher than water.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate freezing point depression?',
      a: 'Find the molality of dissolved particles and multiply by the solvent’s K_f: ΔT_f = i K_f m. For 4.2 g of NaCl in 125 g of water, 0.072 mol per 0.125 kg is 0.575 m, doubled to 1.15 m of ions, and 1.86 × 1.15 ≈ 2.1 °C lower, so it freezes at −2.1 °C.',
    },
    {
      q: 'How do I calculate boiling point elevation?',
      a: 'Use ΔT_b = i K_b m with the solvent’s boiling point constant. For water K_b is 0.512 °C·kg/mol, so a 1.0 m sugar solution boils about 0.51 °C higher. A 0.33 m solution in benzene (K_b 2.53) boils at 80.9 °C instead of 80.1 °C.',
    },
    {
      q: 'What is the van ’t Hoff factor?',
      a: 'The number of particles each formula unit produces in solution: 1 for sugar or ethylene glycol, 2 for NaCl, 3 for CaCl₂. Colligative properties depend on the number of particles, not their identity, so i multiplies the effect.',
    },
    {
      q: 'How can freezing point find a molar mass?',
      a: 'Measure how far a known mass of the substance lowers a solvent’s freezing point. ΔT_f ÷ K_f gives the molality, which with the solvent mass gives the moles; grams divided by moles is the molar mass. Solvents with a large K_f, such as benzene, give the most precise results.',
    },
  ],
  ogSample: (r, fmt) => `4.2 g NaCl in 125 g water → freezes at ${fmt.sig(o(r), 2)} °C`,
};
