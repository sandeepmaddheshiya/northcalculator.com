import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'gamma') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Time Dilation Calculator',
  promise: 'Lorentz factor, time dilation and length contraction at any speed below light.',
  title: 'Time Dilation Calculator: Lorentz Factor and Contraction',
  description:
    'Find the Lorentz factor γ for any speed, how much a moving clock slows, and how much a moving length shrinks, from everyday speeds up to just below light.',
  summary:
    'In special relativity a moving clock runs slow and a moving object is shortened along its motion, both by the Lorentz factor γ = 1/√(1 − v²/c²). At 95% of light speed γ is 3.20: a muon’s 2.2 µs lifetime stretches to 7.05 µs as seen from the ground. At airliner speeds the effect is real but parts per trillion.',
  synonyms: [
    'Lorentz factor calculator',
    'gamma factor calculator',
    'length contraction calculator',
    'special relativity calculator',
    'twin paradox calculator',
    'relativistic time calculator',
  ],
  ui: {
    spRow: 'Speed',
    speed: 'Speed',
    unit: 'Unit',
    'unit.c': '× c',
    'unit.kms': 'km/s',
    'unit.ms': 'm/s',
    t0: 'Proper time Δt₀ (any unit)',
    't0.help': 'The time measured by a clock moving with the object; results use the same unit.',
    l0: 'Proper length L₀ (any unit)',
    'l0.help': 'The length measured at rest relative to the object or distance.',
    'out.gamma': 'Lorentz factor γ',
    'out.dilated': 'Dilated time Δt = γΔt₀',
    'out.contracted': 'Contracted length L = L₀/γ',
    'out.lag': 'Extra time Δt − Δt₀',
    'out.beta': 'Speed as a fraction of c (β)',
    'out.excess': 'γ − 1',
    explain: 'At {b} of light speed, γ = {g}: moving clocks run that many times slower.',
    'step.gamma': 'γ = 1 ÷ √(1 − v²/c²).',
    'step.t': 'Time dilation: Δt = γ × Δt₀.',
    'step.l': 'Length contraction: L = L₀ ÷ γ.',
    'warn.negative': 'Speed cannot be negative.',
    'warn.light': 'Nothing with mass reaches the speed of light; enter a speed below c.',
    rounding:
      'c = 299,792,458 m/s exactly. γ − 1 is computed stably, so tiny effects at everyday speeds are accurate.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Lorentz factor">{'γ = 1 ÷ √(1 − v² ÷ c²)'}</Formula>
      <Formula label="Time dilation and length contraction">{'Δt = γ × Δt₀\nL = L₀ ÷ γ'}</Formula>
      <p>
        Proper time is the one measured by a clock travelling with the event; every other observer
        measures a longer interval. Proper length is measured at rest relative to the object;
        observers who see it moving measure it shorter, but only along the direction of motion.
      </p>
      <p>
        At everyday speeds γ is so close to 1 that subtracting gives rounding noise; the calculator
        computes γ − 1 directly so the extra time stays accurate.
      </p>
    </>
  ),
  examples: [
    {
      id: 'muon',
      title: 'A muon at 0.950c with a 2.20 µs lifetime',
      body: (r, fmt) => (
        <p>
          γ = {fmt.sig(o(r), 3)}, so on the ground it lives{' '}
          <strong>{fmt.sig(o(r, 'dilated'), 3)} µs</strong>, and the 2.01 km it travels is only{' '}
          {fmt.sig(o(r, 'contracted'), 3)} km in its own frame, as in OpenStax{' '}
          <em>University Physics</em> Examples 5.3 and 5.4.
        </p>
      ),
    },
    {
      id: 'star',
      title: 'Alpha Centauri, 4.300 light-years away, at γ = 30.00',
      body: (r, fmt) => (
        <p>
          A traveller at 0.99944c measures the distance as{' '}
          <strong>{fmt.sig(o(r, 'contracted'), 4)} ly</strong> (OpenStax <em>College Physics</em>{' '}
          Example 28.2).
        </p>
      ),
    },
    {
      id: 'jet',
      title: 'A hypersonic glider at 5830 m/s for 1 second',
      body: (r, fmt) => (
        <p>
          The ground sees 1 s + <strong>{fmt.sig(o(r, 'lag'), 3)} s</strong>: real, but a fraction
          of a nanosecond (University Physics Example 5.1).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>The twin paradox:</strong> at γ = 30, a 2-year trip for the traveller is 60 years on
        Earth; the travelling twin is the one who accelerates and so ages less.
      </li>
      <li>
        <strong>Muons prove it:</strong> without time dilation, muons made high in the atmosphere
        would decay long before reaching the ground; dilated, many arrive.
      </li>
      <li>
        <strong>Only along the motion:</strong> a moving object contracts in length, not in width or
        height.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate time dilation?',
      a: 'Find γ = 1/√(1 − v²/c²) and multiply the proper time by it. At 0.950c, γ = 3.20, so a muon’s 2.20 µs lifetime appears as 7.05 µs to a ground observer. At 0.650c, γ is only 1.32.',
    },
    {
      q: 'What is the Lorentz factor?',
      a: 'It is γ = 1/√(1 − v²/c²), the factor by which time stretches and lengths shrink for a moving observer. It is 1 at rest, 1.15 at half light speed, 3.20 at 0.950c and grows without limit as v approaches c.',
    },
    {
      q: 'How does length contraction work?',
      a: 'An object moving relative to you is shortened along its direction of motion: L = L₀/γ. A 2.50 km distance passed at 0.750c measures 1.65 km for the moving observer; 4.300 light-years at γ = 30.00 becomes 0.1433 light-years.',
    },
    {
      q: 'Does time dilation happen at everyday speeds?',
      a: 'Yes, but it is tiny. At 5830 m/s, a hypersonic glider’s clock loses only 1.89 × 10⁻¹⁰ seconds per second. Only precise atomic clocks can detect an effect this small, which is why relativity goes unnoticed in daily life.',
    },
  ],
  ogSample: (r, fmt) =>
    `0.95c → γ = ${fmt.sig(o(r), 3)}; 2.2 µs becomes ${fmt.sig(o(r, 'dilated'), 3)} µs`,
};
