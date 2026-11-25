import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Transformer Calculator',
  promise: 'Secondary voltage, turns ratio and currents for an ideal transformer.',
  title: 'Transformer Calculator: Turns Ratio, Voltage and Current',
  description:
    'Find a transformer’s secondary voltage from its turns, or the turns needed for a voltage, with the turns ratio, primary and secondary current, and power.',
  summary:
    'A transformer changes AC voltage in proportion to its turns: V_s ÷ V_p = N_s ÷ N_p. A step-down transformer with 200 primary and 25 secondary turns turns 120 V into 15 V. Because power is (ideally) conserved, current changes the opposite way, so the low-voltage side carries the larger current.',
  synonyms: [
    'transformer turns ratio calculator',
    'step-down transformer calculator',
    'step-up transformer calculator',
    'transformer voltage calculator',
    'primary and secondary current',
    'Vs/Vp = Ns/Np',
  ],
  ui: {
    find: 'Solve for',
    'find.vs': 'Secondary voltage',
    'find.ns': 'Secondary turns',
    priRow: 'Primary (input)',
    vp: 'Voltage (V)',
    np: 'Turns',
    secRow: 'Secondary (output)',
    vs: 'Voltage (V)',
    ns: 'Turns',
    curRow: 'Known current (optional)',
    side: 'On the',
    'side.p': 'primary',
    'side.s': 'secondary',
    current: 'Current (A)',
    'out.result': 'Result',
    'out.result.vs': 'Secondary voltage (V)',
    'out.result.ns': 'Secondary turns',
    'out.kind': 'Type',
    'out.ratio': 'Turns ratio N_s ÷ N_p',
    'out.ip': 'Primary current (A)',
    'out.is': 'Secondary current (A)',
    'out.power': 'Power through it (W)',
    'kind.up': 'Step-up',
    'kind.down': 'Step-down',
    'kind.iso': 'One-to-one (isolation)',
    explain: 'A {kind} transformer with a ratio of {r} : 1 gives {vs} V at the output.',
    'explain.iso': 'Equal turns: the output stays at {vs} V.',
    'step.vs': 'V_s = V_p × N_s ÷ N_p.',
    'step.ns': 'N_s = N_p × V_s ÷ V_p.',
    'step.is': 'I_s = I_p × N_p ÷ N_s (power in = power out).',
    'step.ip': 'I_p = I_s × N_s ÷ N_p (power in = power out).',
    'step.p': 'Power = I_p × V_p = I_s × V_s.',
    'warn.positive': 'Voltages and turns must be above zero.',
    'warn.whole': 'Turns must be a whole number; {n} turns gives the closest voltage.',
    rounding:
      'Ideal transformer: no losses. Real ones lose a few percent, so output power is slightly lower.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Voltage">{'V_s ÷ V_p = N_s ÷ N_p'}</Formula>
      <Formula label="Current">{'I_s ÷ I_p = N_p ÷ N_s'}</Formula>
      <Formula label="Power (ideal)">{'P = I_p × V_p = I_s × V_s'}</Formula>
      <p>
        A transformer works only with alternating current: the changing current in the primary coil
        creates a changing magnetic flux in the iron core, which induces a voltage in every turn of
        the secondary. A steady DC current produces no output.
      </p>
      <p>
        Voltages and currents here are rms values, as printed on equipment. Using peak values works
        too, as long as you use them on both sides.
      </p>
    </>
  ),
  examples: [
    {
      id: 'charger',
      title: 'A battery charger: 120 V to 15.0 V, 200-turn primary, 16.0 A charging',
      body: (r, fmt) => (
        <p>
          N_s = 200 × 15 ÷ 120 = <strong>{fmt.sig(o(r), 3)} turns</strong>, and the primary draws
          only {fmt.sig(o(r, 'ip'), 3)} A while the battery gets 16.0 A; both sides carry{' '}
          {fmt.sig(o(r, 'power'), 3)} W, as in OpenStax <em>College Physics</em> Example 23.6.
        </p>
      ),
    },
    {
      id: 'stepup',
      title: 'Stepping 120 V up to 100 kV with a 50-turn primary',
      body: (r, fmt) => (
        <p>
          The secondary needs <strong>{fmt.sig(o(r), 3)} turns</strong>, and 10.00 A in the primary
          becomes just {fmt.sig(o(r, 'is') * 1000, 3)} mA at 100 kV (Example 23.5).
        </p>
      ),
    },
    {
      id: 'pole',
      title: 'A utility-pole transformer: 12 kV down to 240 V',
      body: (r, fmt) => (
        <p>
          A 50 : 1 ratio gives <strong>{fmt.sig(o(r), 3)} V</strong>, and 2.0 A on the line becomes{' '}
          {fmt.sig(o(r, 'is'), 3)} A for the house, as in OpenStax <em>University Physics</em>{' '}
          Example 15.6.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Why grids use high voltage:</strong> line loss is I²R, so carrying power at high
        voltage and low current cuts losses dramatically: 800 W instead of 2 MW in the utility-pole
        example.
      </li>
      <li>
        <strong>The thin-wire side is high voltage:</strong> it carries less current, so the winding
        with more turns uses finer wire.
      </li>
      <li>
        <strong>Never connect to DC:</strong> a transformer on DC gives no output and its primary
        can overheat, since only the wire’s resistance limits the current.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a transformer’s output voltage?',
      a: 'Multiply the input voltage by the turns ratio, secondary turns ÷ primary turns. A transformer with 200 primary and 25 secondary turns on 120 V gives 120 × 25 ÷ 200 = 15 V, as in OpenStax College Physics Example 23.6.',
    },
    {
      q: 'How many turns do I need for a given voltage?',
      a: 'Secondary turns = primary turns × output voltage ÷ input voltage. To step 120 V up to 100 kV with 50 primary turns, you need 50 × 100,000 ÷ 120 ≈ 41,700 secondary turns.',
    },
    {
      q: 'How does current change through a transformer?',
      a: 'Opposite to voltage, because power in equals power out for an ideal transformer. Stepping 12 kV down to 240 V (50 : 1) turns 2.0 A on the primary into 100 A on the secondary.',
    },
    {
      q: 'What is the difference between step-up and step-down?',
      a: 'A step-up transformer has more secondary turns than primary and raises the voltage, as at a power station. A step-down has fewer and lowers it, as on a utility pole or in a phone charger.',
    },
  ],
  ogSample: (r, fmt) => `120 V to 15 V with a 200-turn primary → ${fmt.sig(o(r), 3)} turns`,
};
