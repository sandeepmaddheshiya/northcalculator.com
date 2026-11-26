import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Electric Potential Calculator',
  promise: 'Voltage and field near a point charge, or the charge that gives a voltage.',
  title: 'Electric Potential Calculator: V = kQ/r and Field Strength',
  description:
    'Find the electric potential and field at a distance from a point charge or charged sphere, the charge needed for a given voltage, and a test charge’s energy.',
  summary:
    'The electric potential at distance r from a point charge Q is V = kQ/r, where k ≈ 8.99 × 10⁹ N·m²/C². It falls off as 1/r, while the field E = k|Q|/r² falls off faster. Outside a charged metal sphere the same formulas apply, measured from the centre. A test charge q placed there has potential energy qV.',
  synonyms: [
    'voltage of a point charge',
    'V = kq/r calculator',
    'electric field of a point charge',
    'charge on a sphere from voltage',
    'electric potential energy calculator',
    'Van de Graaff charge calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.v': 'Potential',
    'find.q': 'Charge',
    chargeRow: 'Source charge',
    q: 'Charge Q',
    unit: 'Unit',
    'unit.C': 'C',
    'unit.uC': 'µC',
    'unit.nC': 'nC',
    'unit.pC': 'pC',
    v: 'Potential V (volts)',
    distRow: 'Distance from the charge',
    r: 'Distance r',
    'r.help': 'For a charged sphere, measure from its centre.',
    'unit.m': 'm',
    'unit.cm': 'cm',
    'unit.mm': 'mm',
    tqRow: 'Test charge at that point (optional)',
    test: 'Test charge q',
    'out.result': 'Result',
    'out.result.v': 'Electric potential V (volts)',
    'out.result.q': 'Charge Q (chosen unit)',
    'out.e': 'Electric field E (N/C)',
    'out.v': 'Potential (V)',
    'out.q': 'Charge (C)',
    'out.u': 'Test charge’s potential energy (J)',
    'out.f': 'Force on the test charge (N)',
    'explain.v': 'At {r} m the potential is {v} V.',
    'explain.q': 'A charge of {q} C gives {v} V at {r} m.',
    'step.v': 'V = kQ ÷ r.',
    'step.q': 'Q = rV ÷ k.',
    'step.e': 'E = k|Q| ÷ r².',
    'step.u': 'Potential energy U = qV.',
    'warn.r': 'The distance must be above zero.',
    rounding: 'k = 1/(4πε₀) with the 2022 CODATA ε₀; textbooks use 8.99 × 10⁹ or 9.0 × 10⁹.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Potential">{'V = k × Q ÷ r'}</Formula>
      <Formula label="Field">{'E = k × |Q| ÷ r²'}</Formula>
      <Formula label="Test charge">{'U = q × V,  F = |q| × E'}</Formula>
      <p>
        Potential is a scalar and keeps the sign of the charge: negative near a negative charge. The
        field’s direction points away from a positive charge and towards a negative one. The
        potential is measured relative to zero at infinite distance.
      </p>
    </>
  ),
  examples: [
    {
      id: 'sphere',
      title: 'A metal sphere carrying −3.00 nC, measured 5.00 cm from its centre',
      body: (r, fmt) => (
        <p>
          V = 8.99 × 10⁹ × (−3.00 × 10⁻⁹) ÷ 0.0500 = <strong>{fmt.sig(o(r), 3)} V</strong>, as in
          OpenStax <em>College Physics</em> Example 19.6 and <em>University Physics</em> Example
          7.10.
        </p>
      ),
    },
    {
      id: 'vandegraaff',
      title: 'A Van de Graaff dome 25.0 cm across at 100 kV',
      body: (r, fmt) => (
        <p>
          Q = 0.125 × 100,000 ÷ 8.99 × 10⁹ = <strong>{fmt.sig(o(r), 3)} µC</strong>, a surprisingly
          small charge for such a high voltage (Example 19.7).
        </p>
      ),
    },
    {
      id: 'field',
      title: 'A 2.00 nC charge, 5.00 mm away, with a −0.250 µC test charge',
      body: (r, fmt) => (
        <p>
          E = <strong>{fmt.sig(o(r, 'e'), 3)} N/C</strong>, and the test charge feels{' '}
          {fmt.sig(o(r, 'f'), 3)} N, as in College Physics Examples 18.2 and 18.3.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Volts are cheap, coulombs are rare:</strong> 100 kV on a laboratory dome needs only
        about 1.4 µC of excess charge.
      </li>
      <li>
        <strong>Potential vs field:</strong> double the distance and the potential halves, but the
        field drops to a quarter.
      </li>
      <li>
        <strong>Several charges:</strong> potentials simply add as numbers; fields add as vectors,
        so use the Coulomb’s law calculator for forces between two charges.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the electric potential of a point charge?',
      a: 'Multiply Coulomb’s constant by the charge and divide by the distance: V = kQ/r. A −3.00 nC charge 5.00 cm away gives 8.99 × 10⁹ × −3.00 × 10⁻⁹ ÷ 0.0500 ≈ −539 V.',
    },
    {
      q: 'What is the difference between electric potential and electric field?',
      a: 'Potential is energy per unit charge, in volts, and is a scalar. The field is force per unit charge, in N/C or V/m, and has a direction. Near a point charge V falls as 1/r and E as 1/r².',
    },
    {
      q: 'How much charge does a given voltage need?',
      a: 'Rearrange to Q = rV/k. A sphere of radius 0.125 m at 100 kV holds 0.125 × 10⁵ ÷ 8.99 × 10⁹ ≈ 1.39 × 10⁻⁶ C, as OpenStax shows for a Van de Graaff generator.',
    },
    {
      q: 'What value of Coulomb’s constant is used?',
      a: 'k = 1/(4πε₀) ≈ 8.98755 × 10⁹ N·m²/C², from the 2022 CODATA permittivity of free space. Textbooks round it to 8.99 × 10⁹ or 9.0 × 10⁹, which can change the third significant figure.',
    },
  ],
  ogSample: (r, fmt) => `−3.00 nC at 5.00 cm → ${fmt.sig(o(r), 3)} V`,
};
