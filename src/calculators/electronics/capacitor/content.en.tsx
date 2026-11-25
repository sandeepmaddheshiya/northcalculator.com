import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Capacitor Energy Calculator',
  promise: 'Energy and charge stored in a capacitor, or the capacitance or voltage needed.',
  title: 'Capacitor Energy Calculator: E = ½CV² and Charge Q = CV',
  description:
    'Find the energy and charge stored in a capacitor from its capacitance and voltage, or the capacitance or voltage needed for a given energy, in F to pF.',
  summary:
    'A capacitor stores charge Q = CV on its plates and energy E = ½CV². The energy grows with the square of the voltage, so doubling the voltage stores four times the energy. That is why high-voltage capacitors in camera flashes and defibrillators can release a lot of energy quickly. Capacitance is measured in farads; practical values are usually microfarads or smaller.',
  synonyms: [
    'capacitor charge calculator',
    'energy stored in a capacitor',
    'Q = CV calculator',
    '1/2 CV^2 calculator',
    'capacitance from energy',
    'capacitor joules calculator',
  ],
  ui: {
    find: 'Find',
    'find.energy': 'Energy',
    'find.capacitance': 'Capacitance',
    'find.voltage': 'Voltage',
    cRow: 'Capacitance',
    c: 'Capacitance C',
    cu: 'Unit',
    'unit.F': 'F',
    'unit.mF': 'mF',
    'unit.uF': 'µF',
    'unit.nF': 'nF',
    'unit.pF': 'pF',
    v: 'Voltage V (V)',
    e: 'Energy E (J)',
    'out.result': 'Energy (J)',
    'out.result.energy': 'Energy stored (J)',
    'out.result.capacitance': 'Capacitance (in the chosen unit)',
    'out.result.voltage': 'Voltage (V)',
    'out.charge': 'Charge Q (C)',
    'out.joules': 'Energy (J)',
    'out.farads': 'Capacitance (F)',
    explain: '{c} F charged to {v} V holds {q} C and {e} J.',
    'step.energy': 'E = ½CV².',
    'step.capacitance': 'C = 2E ÷ V².',
    'step.voltage': 'V = √(2E ÷ C).',
    'step.charge': 'Q = C × V.',
    'warn.zero': 'The divisor must be greater than zero.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Charge">{'Q = C × V'}</Formula>
      <Formula label="Energy">{'E = ½CV² = ½QV = Q² ÷ 2C'}</Formula>
      <p>
        The energy is half of QV, not all of it, because the voltage rises from zero to V as the
        capacitor charges. 1 F = 1 C/V; 1 µF = 10⁻⁶ F, 1 nF = 10⁻⁹ F and 1 pF = 10⁻¹² F.
      </p>
    </>
  ),
  examples: [
    {
      id: 'defib',
      title: 'A defibrillator delivering 400 J at 10,000 V',
      body: (r, fmt) => (
        <p>
          C = 2 × 400 ÷ 10,000² = <strong>{fmt.sig(o(r), 3)} µF</strong>, as in OpenStax{' '}
          <em>College Physics</em> Example 19.11 and <em>University Physics</em> Example 8.9.
        </p>
      ),
    },
    {
      id: 'plates',
      title: 'An 8.85 nF capacitor at 3,000 V',
      body: (r, fmt) => (
        <p>
          It holds Q = {fmt.sig(o(r, 'charge') * 1e6, 3)} µC (Example 19.8: 26.6 µC) and{' '}
          <strong>{fmt.sig(o(r), 4)} J</strong> of energy.
        </p>
      ),
    },
    {
      id: 'small',
      title: 'A 12.0 µF capacitor at 4.0 V',
      body: (r, fmt) => (
        <p>
          E = ½ × 12 × 10⁻⁶ × 4² = <strong>{fmt.sig(o(r) * 1e6, 2)} µJ</strong>, as in OpenStax{' '}
          <em>University Physics</em> Example 8.8.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Voltage rating:</strong> never exceed it. The dielectric breaks down; OpenStax notes
        a 1 mm air gap fails at about 3,000 V.
      </li>
      <li>
        <strong>Stored energy lingers:</strong> large capacitors can stay charged after power is
        off. Discharge them through a resistor before handling.
      </li>
      <li>
        <strong>Capacitors in parallel add</strong>; in series, their reciprocals add, the opposite
        of resistors.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the energy stored in a capacitor?',
      a: 'Use E = ½CV², with C in farads and V in volts, to get joules. A 1,000 µF capacitor charged to 50 V stores ½ × 0.001 × 2,500 = 1.25 J. Doubling the voltage to 100 V would store 5 J, four times as much.',
    },
    {
      q: 'What is the charge on a capacitor?',
      a: 'Q = CV. An 8.85 nF capacitor at 3,000 V holds 2.655 × 10⁻⁵ C, about 26.6 µC. The plates carry equal and opposite charges, +Q and −Q, so the capacitor as a whole stays neutral.',
    },
    {
      q: 'Why is the energy ½QV and not QV?',
      a: 'Charge is moved onto the capacitor against a voltage that starts at zero and climbs to V, so on average each bit of charge is moved through V ÷ 2. The work done, and the energy stored, is therefore ½QV.',
    },
    {
      q: 'What size capacitor do I need for a given energy?',
      a: 'Rearrange to C = 2E ÷ V². To store 400 J at 10,000 V you need 8 µF, the defibrillator example; at a tenth of the voltage, 1,000 V, you would need 800 µF, a hundred times more.',
    },
  ],
  ogSample: (r, fmt) => `400 J at 10 kV → C = ${fmt.sig(o(r), 3)} µF`,
};
