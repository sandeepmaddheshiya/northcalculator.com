import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'tau') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'RL Time Constant Calculator',
  promise: 'The time constant of an inductor and resistor, and the current at any moment.',
  title: 'RL Time Constant Calculator: τ = L/R, Current and Energy',
  description:
    'Find the time constant τ = L/R of an RL circuit and the current, inductor voltage and stored energy at any time as the current rises or decays.',
  summary:
    'An inductor resists changes in current, so in a circuit with a resistor the current rises and falls exponentially with time constant τ = L/R. After one time constant a rising current reaches 63% of its final value V/R, and a decaying one falls to 37%. After about five time constants the change is essentially complete.',
  synonyms: [
    'inductor time constant calculator',
    'L/R time constant',
    'RL circuit current calculator',
    'inductor current rise',
    'inductor energy calculator',
    'RL decay calculator',
  ],
  ui: {
    mode: 'Current is',
    'mode.rise': 'Switched on',
    'mode.decay': 'Switched off',
    indRow: 'Inductance',
    L: 'Inductance',
    unit: 'Unit',
    'unit.H': 'H',
    'unit.mH': 'mH',
    'unit.uH': 'µH',
    R: 'Total resistance (Ω)',
    V: 'Source voltage (V)',
    'V.help': 'Sets the final current V/R; for decay, the steady current before switching off.',
    timeRow: 'Time after switching',
    t: 'Time',
    'unit.s': 's',
    'unit.ms': 'ms',
    'unit.us': 'µs',
    'out.tau': 'Time constant τ (s)',
    'out.i': 'Current at that time (A)',
    'out.i.rise': 'Current at that time, rising (A)',
    'out.i.decay': 'Current at that time, decaying (A)',
    'out.pct': 'Current as % of V/R',
    'out.i0': 'Final or starting current V/R (A)',
    'out.vL': 'Inductor voltage at that time (V)',
    'out.energy': 'Energy stored in the inductor (J)',
    'out.half': 'Time to halve while decaying (s)',
    'out.five': 'Five time constants (s)',
    explain: 'τ = {tau} s; the current is within 1% of its final value after about {five} s.',
    'step.tau': 'Time constant τ = L ÷ R.',
    'step.i0': 'Final current I₀ = V ÷ R.',
    'step.rise': 'Rising: I = I₀(1 − e^(−t/τ)).',
    'step.decay': 'Decaying: I = I₀ e^(−t/τ).',
    'warn.positive': 'Inductance and resistance must be above zero.',
    rounding: 'Results are shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Time constant">{'τ = L ÷ R'}</Formula>
      <Formula label="Current">
        {'rising: I = (V ÷ R)(1 − e^(−t/τ))\ndecaying: I = I₀ e^(−t/τ)'}
      </Formula>
      <Formula label="Stored energy">{'U = ½ L I²'}</Formula>
      <p>
        One henry divided by one ohm is one second. R is the total resistance in the loop, including
        the coil’s own wire. The decay formula assumes the current keeps a path through the resistor
        after the source is removed.
      </p>
    </>
  ),
  examples: [
    {
      id: 'rise',
      title: 'A 4.0 H coil and 4.0 Ω on a 2.0 V source, 2.0 s after switching on',
      body: (r, fmt) => (
        <p>
          τ = 4.0 ÷ 4.0 = 1.0 s, and after two time constants I = 0.50 × (1 − e⁻²) ={' '}
          <strong>{fmt.sig(o(r, 'i'), 2)} A</strong> of the final 0.50 A, as in OpenStax{' '}
          <em>University Physics</em> Example 14.4.
        </p>
      ),
    },
    {
      id: 'coil',
      title: 'A 7.50 mH coil with 3.00 Ω carrying 10.0 A, switched off',
      body: (r, fmt) => (
        <p>
          τ = <strong>{fmt.sig(o(r) * 1000, 3)} ms</strong>; the current falls to 3.68 A at 2.50 ms
          and {fmt.sig(o(r, 'i'), 3)} A at 5.00 ms, as in OpenStax <em>College Physics</em> Example
          23.9.
        </p>
      ),
    },
    {
      id: 'half',
      title: 'How long does the 1.0 s coil take to lose half its current?',
      body: (r, fmt) => (
        <p>
          τ ln 2 = <strong>{fmt.sig(o(r, 'half'), 2)} s</strong>, as in University Physics Example
          14.5.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>63% and 37%:</strong> after one τ a rising current is at 63% of V/R; a decaying one
        is down to 37%.
      </li>
      <li>
        <strong>Energy falls twice as fast</strong> as current while decaying, since U ∝ I²: in
        University Physics Example 14.5 it drops to 1% in 2.3 s.
      </li>
      <li>
        <strong>Bigger coil or smaller resistance</strong> means a longer time constant.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the RL time constant?',
      a: 'Divide the inductance in henries by the total resistance in ohms: τ = L/R, in seconds. A 7.50 mH coil with 3.00 Ω has τ = 0.0075 ÷ 3 = 2.50 ms.',
    },
    {
      q: 'How does current rise in an RL circuit?',
      a: 'When switched on, I = (V/R)(1 − e^(−t/τ)). It starts at zero, reaches 63% of V/R after one time constant, 86% after two and over 99% after five. A 2.0 V, 4.0 Ω, 4.0 H circuit reaches 0.43 A after 2.0 s.',
    },
    {
      q: 'How does it decay when switched off?',
      a: 'If the loop stays closed through the resistor, I = I₀ e^(−t/τ). 10.0 A in a 2.50 ms circuit falls to 3.68 A after 2.50 ms and 1.35 A after 5.00 ms.',
    },
    {
      q: 'How much energy does an inductor store?',
      a: 'U = ½LI². A 4.0 H coil carrying 0.50 A stores ½ × 4.0 × 0.25 = 0.50 J. That energy is released when the current falls, mostly as heat in the resistor.',
    },
  ],
  ogSample: (r, fmt) => `4.0 H and 4.0 Ω → τ = ${fmt.sig(o(r), 2)} s`,
};
