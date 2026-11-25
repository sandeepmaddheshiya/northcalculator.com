import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Voltage Divider Calculator',
  promise: 'Output voltage of a two-resistor divider, or the resistor needed for a target voltage.',
  title: 'Voltage Divider Calculator: Vout = Vin × R2 ÷ (R1 + R2)',
  description:
    'Calculate a resistor voltage divider’s output voltage, or the second resistor for a target output, with the current and the power in each resistor.',
  summary:
    'Two resistors in series share the input voltage in proportion to their resistances, because the same current flows through both. The voltage across the bottom resistor R2 is Vin × R2 ÷ (R1 + R2). Equal resistors give half the input. Dividers set reference voltages and scale signals, but connecting a load across R2 draws current and lowers the output.',
  synonyms: [
    'resistor divider calculator',
    'potential divider calculator',
    'Vout calculator',
    'voltage divider formula',
    'resistor ratio calculator',
    'divider resistor values',
  ],
  ui: {
    find: 'Find',
    'find.vout': 'Output voltage',
    'find.r2': 'Resistor R2',
    vin: 'Input voltage Vin (V)',
    r1: 'Top resistor R1 (Ω)',
    r2: 'Bottom resistor R2 (Ω)',
    vout: 'Target output Vout (V)',
    'out.result': 'Output voltage (V)',
    'out.result.vout': 'Output voltage across R2 (V)',
    'out.result.r2': 'Resistor R2 (Ω)',
    'out.v1': 'Voltage across R1 (V)',
    'out.current': 'Current (A)',
    'out.p1': 'Power in R1 (W)',
    'out.p2': 'Power in R2 (W)',
    'out.ratio': 'Division ratio R2 ÷ (R1 + R2)',
    explain: 'The divider gives {vout} V across R2 = {r2} Ω, with {i} A flowing.',
    'step.current': 'Current = Vin ÷ (R1 + R2).',
    'step.vout': 'Vout = Vin × R2 ÷ (R1 + R2).',
    'step.r2': 'R2 = R1 × Vout ÷ (Vin − Vout).',
    'warn.r1': 'The resistances must be greater than zero.',
    'warn.vout': 'The target must lie between 0 and the input voltage.',
    rounding:
      'Assumes nothing is connected across R2. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Voltage divider">
        {'Vout = Vin × R2 ÷ (R1 + R2)\nI = Vin ÷ (R1 + R2)'}
      </Formula>
      <Formula label="Choosing R2">{'R2 = R1 × Vout ÷ (Vin − Vout)'}</Formula>
      <p>
        This is Ohm’s law applied to series resistors: each takes V = IR of the supply. With a load
        of resistance R_L across R2, use R2 in parallel with R_L instead of R2; keep the divider
        resistors well below R_L for a steady output.
      </p>
    </>
  ),
  examples: [
    {
      id: 'textbook',
      title: '12 V across 1 + 6 Ω on top and 13 Ω below',
      body: (r, fmt) => (
        <p>
          I = 12 ÷ 20 = {fmt.sig(o(r, 'current'), 3)} A and Vout = 0.6 × 13 ={' '}
          <strong>{fmt.sig(o(r), 3)} V</strong>, the 7.80 V across the 13.0 Ω resistor in OpenStax{' '}
          <em>College Physics</em> Example 21.1.
        </p>
      ),
    },
    {
      id: 'battery',
      title: '9 V across 80 Ω and 10 Ω',
      body: (r, fmt) => (
        <p>
          Vout = 9 × 10 ÷ 90 = <strong>{fmt.sig(o(r), 3)} V</strong>, the 1 V drop across the 10 Ω
          resistor in OpenStax <em>University Physics</em> Example 10.2.
        </p>
      ),
    },
    {
      id: 'design',
      title: 'Getting 5 V from 12 V with R1 = 7 kΩ',
      body: (r, fmt) => (
        <p>
          R2 = 7,000 × 5 ÷ (12 − 5) = <strong>{fmt.sig(o(r), 4)} Ω</strong>, 5 kΩ.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Loads matter:</strong> a divider is fine for feeding an input with high resistance,
        but not for powering a device that draws current.
      </li>
      <li>
        <strong>Pick standard values:</strong> after finding R2, choose the nearest available
        resistor and recheck Vout.
      </li>
      <li>
        <strong>Power rating:</strong> check P = I²R for each resistor; small resistors are often
        rated at 0.25 W.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the voltage divider formula?',
      a: 'Vout = Vin × R2 ÷ (R1 + R2), where R2 is the resistor the output is taken across. With 10 V in, R1 = 3 kΩ and R2 = 2 kΩ, the output is 10 × 2 ÷ 5 = 4 V.',
    },
    {
      q: 'How do I choose resistors for a voltage divider?',
      a: 'Pick R1, then R2 = R1 × Vout ÷ (Vin − Vout). For 3.3 V from 5 V with R1 = 10 kΩ, R2 ≈ 19.4 kΩ. Larger values waste less current; smaller values hold the output steadier when a load is attached.',
    },
    {
      q: 'Why does my divider output drop when I connect something?',
      a: 'The load is in parallel with R2, lowering the effective bottom resistance and so the output voltage. A 10 kΩ load across a 10 kΩ R2 halves the bottom resistance to 5 kΩ, a big change. Use smaller divider resistors or a buffer.',
    },
    {
      q: 'Can a voltage divider power a circuit?',
      a: 'Not well. Its output changes with the current drawn and it wastes power in the resistors all the time. For powering devices, use a voltage regulator; dividers suit reference voltages and measurement inputs that draw little current.',
    },
  ],
  ogSample: (r, fmt) => `12 V, 7 Ω and 13 Ω → Vout = ${fmt.sig(o(r), 3)} V`,
};
