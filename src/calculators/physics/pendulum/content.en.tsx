import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Pendulum Period Calculator',
  promise: 'A simple pendulum’s period from its length, or the length or g from the period.',
  title: 'Pendulum Calculator: Period, Length and g, T = 2π√(L/g)',
  description:
    'Find how long a simple pendulum takes to swing there and back from its length, the length for a given period, or the local gravity measured by a pendulum.',
  summary:
    'A simple pendulum’s period, the time for one full swing there and back, is T = 2π√(L ÷ g). It depends only on the length and on gravity, not on the mass of the bob, and barely on how far it swings as long as the swing is small. A pendulum about 99.4 cm long ticks once a second each way, a 2-second period.',
  synonyms: [
    'simple pendulum calculator',
    'pendulum length calculator',
    'pendulum frequency calculator',
    'measure gravity with a pendulum',
    'seconds pendulum length',
    'pendulum formula',
  ],
  ui: {
    find: 'Find',
    'find.period': 'Period',
    'find.length': 'Length',
    'find.g': 'Gravity (g)',
    length: 'Length L (m)',
    period: 'Period T (s)',
    g: 'Gravity g (m/s²)',
    'g.help': '9.80665 is standard gravity; the Moon is about 1.625.',
    'out.result': 'Period (s)',
    'out.result.period': 'Period T (s)',
    'out.result.length': 'Length L (m)',
    'out.result.g': 'Gravity g (m/s²)',
    'out.frequency': 'Frequency (Hz)',
    'out.perMinute': 'Full swings per minute',
    explain: 'A {l} m pendulum under g = {g} m/s² swings there and back in {t} s.',
    'step.period': 'T = 2π√(L ÷ g).',
    'step.length': 'L = gT² ÷ (4π²).',
    'step.g': 'g = 4π²L ÷ T².',
    'warn.g': 'Gravity must be greater than zero.',
    'warn.period': 'The period must be greater than zero.',
    rounding:
      'Valid for small swings, under about 15°. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Simple pendulum">{'T = 2π √(L ÷ g)\nL = gT² ÷ 4π²\ng = 4π²L ÷ T²'}</Formula>
      <p>
        L is measured from the pivot to the centre of the bob. The formula is a small-angle
        approximation: for larger swings the period grows slightly. Timing many swings and dividing
        reduces the error from starting and stopping the clock.
      </p>
    </>
  ),
  examples: [
    {
      id: 'gravity',
      title: 'Measuring g: 75.000 cm, 1.7357 s per swing',
      body: (r, fmt) => (
        <p>
          g = 4π² × 0.75 ÷ 1.7357² = <strong>{fmt.sig(o(r), 5)} m/s²</strong>, the 9.8281 m/s² of
          OpenStax <em>College Physics</em> Example 16.5 and <em>University Physics</em> Example
          15.3.
        </p>
      ),
    },
    {
      id: 'metre',
      title: 'A 1 m pendulum',
      body: (r, fmt) => (
        <p>
          T = 2π√(1 ÷ 9.80665) = <strong>{fmt.sig(o(r), 6)} s</strong>, very nearly two seconds.
        </p>
      ),
    },
    {
      id: 'seconds',
      title: 'The length for a 2-second period',
      body: (r, fmt) => (
        <p>
          L = 9.80665 × 2² ÷ 4π² = <strong>{fmt.sig(o(r), 5)} m</strong>, a pendulum that takes one
          second for each swing in one direction.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Time ten swings</strong> and divide by ten for a more accurate period.
      </li>
      <li>
        <strong>Keep the swing small</strong>; OpenStax suggests under about 0.5° when measuring g
        precisely.
      </li>
      <li>
        <strong>Four times longer, twice as slow:</strong> the period grows with the square root of
        the length.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for the period of a pendulum?',
      a: 'T = 2π√(L ÷ g), where L is the length in metres and g the acceleration due to gravity. A 0.25 m pendulum on Earth has a period of about 1.0 s, and a 4 m pendulum about 4.0 s.',
    },
    {
      q: 'Does the mass of the bob change the period?',
      a: 'No. A heavier bob feels more gravitational force but also has more inertia, and the two cancel. OpenStax points out that pendulums with 10 kg and 100 kg bobs displaced by the same small angle swing identically.',
    },
    {
      q: 'How can I measure gravity with a pendulum?',
      a: 'Measure the length carefully, time many small swings to get the period, then use g = 4π²L ÷ T². With L = 0.75000 m and T = 1.7357 s, g = 9.8281 m/s², which is how the OpenStax example measures it.',
    },
    {
      q: 'Why does a pendulum clock run slow when it is hot?',
      a: 'Heat expands the rod, making the pendulum slightly longer, and a longer pendulum has a longer period. Each swing then takes a little more time, so the clock loses time. Precision clocks use materials or designs that compensate.',
    },
  ],
  ogSample: (r, fmt) => `L = 75 cm, T = 1.7357 s → g = ${fmt.sig(o(r), 5)} m/s²`,
};
