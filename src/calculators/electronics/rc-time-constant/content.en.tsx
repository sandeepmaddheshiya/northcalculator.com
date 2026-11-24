import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'tau') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'RC Time Constant Calculator',
  promise: 'Time constant, capacitor voltage over time and time to reach a voltage.',
  title: 'RC Time Constant Calculator: Charging and Discharging',
  description:
    'Find the RC time constant τ = RC, the capacitor voltage after any time while charging or discharging, and how long it takes to reach a chosen voltage.',
  summary:
    'In a circuit with a resistor R and capacitor C, the time constant τ = R × C sets the pace. While charging, the capacitor reaches 63.2% of the supply voltage after one τ; while discharging, it falls to 36.8% of its starting voltage. After five time constants it is within 1% of the end value, which is the usual rule for “fully” charged.',
  synonyms: [
    'tau calculator',
    'capacitor charge time calculator',
    'capacitor discharge calculator',
    'RC circuit calculator',
    'time constant formula',
    'RC charging curve',
  ],
  ui: {
    mode: 'Capacitor is',
    'mode.charging': 'Charging',
    'mode.discharging': 'Discharging',
    r: 'Resistance R (Ω)',
    cRow: 'Capacitance',
    c: 'Capacitance C',
    cu: 'Unit',
    'unit.F': 'F',
    'unit.mF': 'mF',
    'unit.uF': 'µF',
    'unit.nF': 'nF',
    'unit.pF': 'pF',
    v: 'Voltage (V)',
    'v.charging': 'Supply voltage (V)',
    'v.discharging': 'Starting voltage (V)',
    t: 'Time t (s)',
    't.help': 'Optional, for the voltage at that moment.',
    target: 'Target voltage (V)',
    'target.help': 'Optional, for the time to reach it.',
    'out.tau': 'Time constant τ (s)',
    'out.vAt': 'Capacitor voltage at t (V)',
    'out.percent': 'Charged at t',
    'out.percent.charging': 'Charged at t',
    'out.percent.discharging': 'Remaining at t',
    'out.tTarget': 'Time to reach the target (s)',
    'out.fiveTau': '5τ, over 99% (s)',
    'out.current': 'Current at t (A)',
    'explain.charging':
      'With τ = {tau} s the capacitor reaches 63.2% after one τ and over 99% after {five} s.',
    'explain.discharging':
      'With τ = {tau} s the voltage falls to 36.8% each τ and below 1% after {five} s.',
    'step.tau': 'Time constant τ = R × C.',
    'step.charge': 'Charging: V = V_s(1 − e^(−t/τ)).',
    'step.discharge': 'Discharging: V = V₀e^(−t/τ).',
    'step.target': 'Solve the exponential for the time.',
    'warn.zero': 'R and C must be greater than zero.',
    'warn.never':
      'A charging capacitor approaches the supply voltage but never reaches or exceeds it.',
    'warn.above': 'A discharging capacitor only falls below its starting voltage.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Time constant">{'τ = R × C (ohms × farads = seconds)'}</Formula>
      <Formula label="Voltage">
        {'charging: V = V_s(1 − e^(−t/τ))\ndischarging: V = V₀ e^(−t/τ)'}
      </Formula>
      <Formula label="Time to a voltage">
        {'charging: t = −τ ln(1 − V/V_s)\ndischarging: t = −τ ln(V/V₀)'}
      </Formula>
      <p>
        Each τ closes 63.2% of the remaining gap while charging, and removes 63.2% of what is left
        while discharging. The current is largest at the start, V ÷ R, and decays with the same τ.
      </p>
    </>
  ),
  examples: [
    {
      id: 'defibrillator',
      title: 'A defibrillator: 8.00 µF through 1.00 kΩ from 10.0 kV',
      body: (r, fmt) => (
        <p>
          τ = 1,000 × 8 × 10⁻⁶ = <strong>{fmt.sig(o(r) * 1000, 4)} ms</strong>, and after 24.0 ms
          (3τ) the voltage is {fmt.sig(o(r, 'vAt'), 4)} V, the 498 V of OpenStax{' '}
          <em>College Physics</em> Example 21.7.
        </p>
      ),
    },
    {
      id: 'neon',
      title: 'A neon flasher: 101 Ω, 50 mF, firing at 80 V from 100 V',
      body: (r, fmt) => (
        <p>
          τ = {fmt.sig(o(r), 4)} s, and the capacitor reaches 80 V after{' '}
          <strong>{fmt.sig(o(r, 'tTarget'), 4)} s</strong>, matching OpenStax{' '}
          <em>University Physics</em> Example 10.8 (8.13 s).
        </p>
      ),
    },
    {
      id: 'wiper',
      title: 'A wiper delay: 10 kΩ, 10 mF, switching at 10 V of 12 V',
      body: (r, fmt) => (
        <p>
          t = −100 × ln(1 − 10/12) = <strong>{fmt.sig(o(r, 'tTarget'), 6)} s</strong>, about 2.98
          minutes (Example 10.9).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Watch the prefixes:</strong> 1 µF = 10⁻⁶ F and 1 kΩ = 1,000 Ω, so 10 kΩ × 100 µF = 1
        s.
      </li>
      <li>
        <strong>Five τ is “done”</strong> for most purposes: 99.3% charged or 0.7% left.
      </li>
      <li>
        <strong>Large capacitors can stay charged</strong> after power is removed. Discharge them
        through a resistor before touching the terminals.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the RC time constant?',
      a: 'It is the product of resistance and capacitance, τ = RC, in seconds. It is the time for a charging capacitor to reach about 63.2% of the supply voltage, or for a discharging one to drop to about 36.8% of its starting voltage.',
    },
    {
      q: 'How long does a capacitor take to charge fully?',
      a: 'In theory forever, because the approach is exponential. In practice five time constants is used: after 5τ the capacitor is at 99.3%. A 10 kΩ resistor and a 100 µF capacitor have τ = 1 s, so about 5 seconds.',
    },
    {
      q: 'How do I find the time to reach a certain voltage?',
      a: 'While charging, t = −τ ln(1 − V ÷ V_s). Reaching half the supply voltage takes τ ln 2, about 0.693τ, and 90% takes about 2.3τ. While discharging, t = −τ ln(V ÷ V₀).',
    },
    {
      q: 'Why does the current fall over time?',
      a: 'At the start the uncharged capacitor has no voltage, so the full supply drives current through the resistor. As the capacitor charges, its voltage opposes the supply, leaving less across the resistor, so the current decays with the same time constant.',
    },
  ],
  ogSample: (r, fmt) => `1 kΩ × 8 µF → τ = ${fmt.sig(o(r) * 1000, 4)} ms`,
};
