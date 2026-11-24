import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Series and Parallel Resistor Calculator',
  promise: 'Total resistance of resistors in series or parallel, plus current and power.',
  title: 'Resistor Calculator: Series and Parallel Total Resistance',
  description:
    'Enter resistor values, with k and M prefixes, to get the equivalent resistance in series and in parallel, and the current and power at a given voltage.',
  summary:
    'Resistors in series add up: R = R₁ + R₂ + …, because the same current flows through each one. In parallel, the reciprocals add: 1/R = 1/R₁ + 1/R₂ + …, so the total is always smaller than the smallest resistor. Two equal resistors in parallel give half the value of one.',
  synonyms: [
    'parallel resistor calculator',
    'series resistor calculator',
    'equivalent resistance calculator',
    'total resistance calculator',
    'resistors in parallel formula',
    'combined resistance calculator',
  ],
  ui: {
    mode: 'Connected in',
    'mode.series': 'Series',
    'mode.parallel': 'Parallel',
    values: 'Resistor values (Ω)',
    'values.help': 'Separate with commas or spaces. 4.7k = 4,700 Ω, 1M = 1,000,000 Ω.',
    voltage: 'Supply voltage (V)',
    'voltage.help': 'Optional, for the total current and power.',
    'out.result': 'Equivalent resistance (Ω)',
    'out.result.series': 'Series resistance (Ω)',
    'out.result.parallel': 'Parallel resistance (Ω)',
    'out.series': 'If in series (Ω)',
    'out.parallel': 'If in parallel (Ω)',
    'out.current': 'Total current (A)',
    'out.power': 'Total power (W)',
    'out.count': 'Resistors',
    'explain.series': '{n} resistors in series act like a single {r} Ω resistor.',
    'explain.parallel': '{n} resistors in parallel act like a single {r} Ω resistor.',
    'step.series': 'Series: add the resistances.',
    'step.parallel': 'Parallel: add the reciprocals, then take the reciprocal of the sum.',
    'step.current': 'Current = voltage ÷ equivalent resistance.',
    'warn.none': 'Enter at least one resistance greater than zero.',
    'warn.bad': 'Ignored: {bad}. Use numbers with an optional k or M.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Series">{'R = R₁ + R₂ + R₃ + …'}</Formula>
      <Formula label="Parallel">
        {'1/R = 1/R₁ + 1/R₂ + 1/R₃ + …\ntwo resistors: R = R₁R₂ ÷ (R₁ + R₂)'}
      </Formula>
      <p>
        In series the same current passes through every resistor and the voltages add. In parallel
        every resistor has the same voltage across it and the currents add. With a supply voltage,
        the total current is V ÷ R and the power drawn is V² ÷ R, from Ohm’s law.
      </p>
    </>
  ),
  examples: [
    {
      id: 'parallel',
      title: '1, 6 and 13 Ω in parallel on 12 V',
      body: (r, fmt) => (
        <p>
          1 ÷ (1/1 + 1/6 + 1/13) = <strong>{fmt.sig(o(r), 6)} Ω</strong>, drawing{' '}
          {fmt.sig(o(r, 'current'), 4)} A. OpenStax <em>College Physics</em> Example 21.2 gets 0.804
          Ω and 14.92 A; in series the same resistors make 20.0 Ω.
        </p>
      ),
    },
    {
      id: 'series',
      title: 'Four 20 Ω and one 10 Ω in series on 9 V',
      body: (r, fmt) => (
        <p>
          20 × 4 + 10 = <strong>{fmt.sig(o(r), 6)} Ω</strong>, so the current is 9 ÷ 90 ={' '}
          {fmt.sig(o(r, 'current'), 4)} A, as in OpenStax <em>University Physics</em> Example 10.2.
        </p>
      ),
    },
    {
      id: 'prefixes',
      title: '4.7 kΩ, 4.7 kΩ and 10 kΩ in parallel',
      body: (r, fmt) => (
        <p>
          The two 4.7 kΩ resistors make 2.35 kΩ, and with 10 kΩ the total is{' '}
          <strong>{fmt.sig(o(r), 6)} Ω</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Need an odd value?</strong> Combine standard resistors: two 1 kΩ in series give 2
        kΩ, and two in parallel give 500 Ω.
      </li>
      <li>
        <strong>Share the power.</strong> Parallel resistors split the current, so several small
        resistors can handle more power than one.
      </li>
      <li>
        <strong>Mixed circuits:</strong> work out each parallel group first, then add the groups
        that are in series.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate resistors in parallel?',
      a: 'Add the reciprocals of the resistances and take the reciprocal of the total. For 6 Ω and 3 Ω: 1/6 + 1/3 = 1/2, so the combination is 2 Ω. For just two resistors, the product over the sum gives the same: 18 ÷ 9 = 2 Ω.',
    },
    {
      q: 'Why is parallel resistance smaller than any single resistor?',
      a: 'Each extra resistor in parallel opens another path for the current, so more current flows at the same voltage, which means lower resistance. A 100 Ω resistor in parallel with a 1 Ω resistor gives about 0.99 Ω, slightly less than 1 Ω.',
    },
    {
      q: 'What happens with equal resistors in parallel?',
      a: 'n equal resistors of R in parallel give R ÷ n. Two 1 kΩ resistors make 500 Ω, and four 100 Ω resistors make 25 Ω. In series they would make nR instead.',
    },
    {
      q: 'How do I solve a circuit with both series and parallel parts?',
      a: 'Reduce it step by step. Replace each group of parallel resistors with its equivalent, then add the series parts. A 1 Ω resistor in series with 6 Ω and 13 Ω in parallel is 1 + 4.105 = 5.105 Ω, as in OpenStax Example 21.3.',
    },
  ],
  ogSample: (r, fmt) => `1, 6, 13 Ω in parallel → ${fmt.sig(o(r), 6)} Ω`,
};
