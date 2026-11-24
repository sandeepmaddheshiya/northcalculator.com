import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Ohm’s Law Calculator',
  promise: 'Voltage, current, resistance and power from any two of them.',
  title: 'Ohm’s Law Calculator: Voltage, Current, Resistance, Power',
  description:
    'Enter any two of voltage, current, resistance and power to get the other two, using Ohm’s law V = IR and the power formulas P = IV, I²R and V²/R.',
  summary:
    'Ohm’s law says the voltage across a resistor equals the current through it times its resistance, V = IR. Electric power is voltage times current, P = IV, which combines with Ohm’s law to give P = I²R and P = V²/R. So any two of the four quantities fix the other two. Enter values in volts, amps, ohms and watts.',
  synonyms: [
    'V = IR calculator',
    'voltage calculator',
    'current calculator',
    'resistance calculator',
    'watts to amps calculator',
    'power formula electricity',
  ],
  ui: {
    known: 'I know',
    'known.vi': 'Voltage and current',
    'known.vr': 'Voltage and resistance',
    'known.ir': 'Current and resistance',
    'known.pv': 'Power and voltage',
    'known.pi': 'Power and current',
    'known.pr': 'Power and resistance',
    v: 'Voltage (V)',
    i: 'Current (A)',
    r: 'Resistance (Ω)',
    p: 'Power (W)',
    'out.result': 'Resistance (Ω)',
    'out.result.vi': 'Resistance (Ω)',
    'out.result.vr': 'Current (A)',
    'out.result.ir': 'Voltage (V)',
    'out.result.pv': 'Current (A)',
    'out.result.pi': 'Voltage (V)',
    'out.result.pr': 'Voltage (V)',
    'out.v': 'Voltage (V)',
    'out.i': 'Current (A)',
    'out.r': 'Resistance (Ω)',
    'out.p': 'Power (W)',
    explain: '{v} V across {r} Ω drives {i} A and dissipates {p} W.',
    'explain.open': 'With no current, no power flows: {v} V, {i} A, {p} W.',
    'step.formula': 'Rearrange V = IR and P = IV for the two unknowns.',
    'warn.zero': 'The second value must be greater than zero, or the circuit is open or shorted.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Ohm’s law">{'V = I × R\nI = V ÷ R\nR = V ÷ I'}</Formula>
      <Formula label="Electric power">{'P = I × V\nP = I² × R\nP = V² ÷ R'}</Formula>
      <p>
        V is voltage in volts, I current in amperes, R resistance in ohms and P power in watts.
        Ohm’s law holds for ohmic materials such as metal resistors at a steady temperature. A bulb
        filament’s resistance rises as it heats up, so its cold and hot readings differ.
      </p>
    </>
  ),
  examples: [
    {
      id: 'headlight',
      title: 'A car headlight drawing 2.5 A at 12 V',
      body: (r, fmt) => (
        <p>
          R = 12 ÷ 2.5 = <strong>{fmt.sig(o(r), 8)} Ω</strong> and P = 12 × 2.5 ={' '}
          {fmt.sig(o(r, 'p'), 8)} W, as in OpenStax <em>College Physics</em> Examples 20.4 and 20.7.
        </p>
      ),
    },
    {
      id: 'cold',
      title: 'The same headlight when cold, at 0.35 Ω',
      body: (r, fmt) => (
        <p>
          I = 12 ÷ 0.35 = <strong>{fmt.sig(o(r), 6)} A</strong> and P = 12² ÷ 0.35 ={' '}
          {fmt.sig(o(r, 'p'), 6)} W for an instant after switching on. Example 20.7 rounds these to
          34.3 A and 411 W.
        </p>
      ),
    },
    {
      id: 'resistor',
      title: 'A resistor passing 3 mA from a 9 V battery',
      body: (r, fmt) => (
        <p>
          Enter 3 mA as 0.003 A: R = 9 ÷ 0.003 = <strong>{fmt.sig(o(r), 8)} Ω</strong>, or 3 kΩ, as
          in OpenStax <em>University Physics</em> Example 9.8.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Convert prefixes first:</strong> 1 mA = 0.001 A, 1 kΩ = 1,000 Ω, 1 kW = 1,000 W.
      </li>
      <li>
        <strong>Check the power rating.</strong> A resistor must be rated above the power it
        dissipates: 0.25 W resistors are common, so a 100 Ω resistor on 12 V (1.44 W) would
        overheat.
      </li>
      <li>
        <strong>Mains AC:</strong> with RMS voltage and current these formulas work for heaters and
        bulbs. Motors and electronics add a power factor, so V × I can overstate the real power.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is Ohm’s law?',
      a: 'Ohm’s law says the current through a conductor is proportional to the voltage across it: V = IR. For a fixed resistance, doubling the voltage doubles the current. Resistance is the ratio of voltage to current, measured in ohms.',
    },
    {
      q: 'How do I convert watts to amps?',
      a: 'Divide the power by the voltage: I = P ÷ V. A 1,500 W kettle on 230 V draws about 6.52 A; on 120 V it draws 12.5 A. That is why the same appliance needs heavier wiring in countries with lower mains voltage.',
    },
    {
      q: 'How do I find resistance from power and voltage?',
      a: 'Use R = V² ÷ P. A 60 W bulb designed for 120 V has a hot resistance of 120² ÷ 60 = 240 Ω. The same formula gives about 881.67 Ω for a 60 W bulb rated at 230 V.',
    },
    {
      q: 'Does Ohm’s law always apply?',
      a: 'No. It holds for ohmic materials, where resistance stays constant. Diodes, transistors and gas discharge lamps are non-ohmic, and even a metal filament’s resistance changes as it heats. For those, V ÷ I still gives the resistance at that moment, but it changes with the conditions.',
    },
  ],
  ogSample: (r, fmt) => `12 V, 2.5 A → ${fmt.sig(o(r), 8)} Ω`,
};
