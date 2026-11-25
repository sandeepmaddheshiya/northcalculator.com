import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'impulse') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Momentum and Impulse Calculator',
  promise: 'Momentum, impulse and the average force of an impact from mass and speeds.',
  title: 'Momentum and Impulse Calculator: p = mv and Average Force',
  description:
    'Find an object’s momentum before and after, the impulse and the average force of a collision or push, from mass, velocities and contact time.',
  summary:
    'Momentum is mass times velocity, p = mv, measured in kilogram metres per second. A force acting for a time changes it: the impulse, force times time, equals the change in momentum. So the average force of an impact is the change in momentum divided by the contact time, which is why stretching a stop over a longer time, as airbags do, lowers the force.',
  synonyms: [
    'momentum calculator',
    'impulse calculator',
    'p = mv calculator',
    'impact force calculator',
    'change in momentum',
    'average force collision',
  ],
  ui: {
    mass: 'Mass (kg)',
    v1: 'Starting velocity (m/s)',
    v2: 'Final velocity (m/s)',
    time: 'Contact time (s)',
    'time.help': 'Optional, for the average force.',
    'v2.help': 'Use a minus sign for motion in the opposite direction, such as a rebound.',
    'out.impulse': 'Impulse, Δp (kg·m/s or N·s)',
    'out.p1': 'Starting momentum (kg·m/s)',
    'out.p2': 'Final momentum (kg·m/s)',
    'out.force': 'Average force (N)',
    'out.gs': 'Force as a multiple of the weight',
    explain: 'The momentum changes by {dp} kg·m/s.',
    'explain.force': 'The momentum changes by {dp} kg·m/s, which takes an average force of {f} N.',
    'step.p': 'Momentum = mass × velocity, before and after.',
    'step.dp': 'Impulse = final momentum − starting momentum.',
    'step.force': 'Average force = impulse ÷ contact time.',
    'warn.mass': 'The mass must be greater than zero.',
    rounding:
      'Results keep 12 significant digits and are shown to 8. Velocities are along one line.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Momentum">{'p = m × v'}</Formula>
      <Formula label="Impulse">{'J = F × Δt = Δp = m(v₂ − v₁)\nF = Δp ÷ Δt'}</Formula>
      <p>
        Velocity has a direction, so a ball that bounces back has a negative final velocity and a
        larger change in momentum than one that just stops. A negative force means it acts against
        the starting direction of motion.
      </p>
    </>
  ),
  examples: [
    {
      id: 'serve',
      title: 'A 57 g tennis ball served to 58 m/s in 5 ms',
      body: (r, fmt) => (
        <p>
          Δp = 0.057 × 58 = <strong>{fmt.sig(o(r), 4)} kg·m/s</strong>, and the racquet pushes with
          an average {fmt.sig(o(r, 'force'), 4)} N, the 660 N of OpenStax <em>College Physics</em>{' '}
          Example 8.2.
        </p>
      ),
    },
    {
      id: 'player',
      title: 'A 110 kg player running at 8.00 m/s',
      body: (r, fmt) => (
        <p>
          p = 110 × 8 = <strong>{fmt.sig(o(r, 'p2'), 4)} kg·m/s</strong>, about 85 times the
          momentum of a football thrown at 25 m/s (Example 8.1).
        </p>
      ),
    },
    {
      id: 'airbag',
      title: 'A driver stopped from 27 m/s in 2.5 s',
      body: (r, fmt) => (
        <p>
          The 87.8 kg driver needs an average <strong>{fmt.sig(o(r, 'force'), 4)} N</strong>, about{' '}
          {fmt.sig(o(r, 'gs'), 2)} times the driver’s weight; stopping in 0.20 s would take 12.5
          times as much (OpenStax <em>University Physics</em> Example 9.2).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Bounces double up.</strong> A ball hitting a wall at 10 m/s and rebounding at 10 m/s
        changes velocity by 20 m/s.
      </li>
      <li>
        <strong>Longer stops, smaller forces:</strong> padding, crumple zones and bending your knees
        when landing all increase Δt.
      </li>
      <li>
        <strong>N·s and kg·m/s</strong> are the same unit, so impulse and momentum change can be
        compared directly.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for momentum?',
      a: 'Momentum is mass times velocity, p = mv. A 1,400 kg car at 15 m/s has 21,000 kg·m/s of momentum. Because velocity has a direction, so does momentum, and objects moving in opposite directions have momenta of opposite sign.',
    },
    {
      q: 'What is impulse?',
      a: 'Impulse is force multiplied by the time it acts, and it equals the change in momentum. A 0.057 kg ball sped up from rest to 58 m/s receives an impulse of about 3.3 N·s, whether from a short hard hit or a longer gentle push.',
    },
    {
      q: 'How do I calculate impact force?',
      a: 'Divide the change in momentum by the contact time. A 0.5 kg ball stopping from 10 m/s in 0.01 s feels an average 500 N. The peak force is higher than the average, because the force rises and falls during contact.',
    },
    {
      q: 'Is momentum conserved?',
      a: 'In a closed system with no outside forces, total momentum stays the same in any collision. That is why a gun recoils and why two skaters pushing apart move off with equal and opposite momenta.',
    },
  ],
  ogSample: (r, fmt) => `0.057 kg to 58 m/s → Δp = ${fmt.sig(o(r), 4)} kg·m/s`,
};
