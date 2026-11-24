import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'work') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Work and Power Calculator',
  promise: 'Work done by a force over a distance, and the power if you know the time.',
  title: 'Work and Power Calculator: W = Fd cos θ, P = W/t, Horsepower',
  description:
    'Calculate the work done by a force over a distance at any angle, in joules, and the average power in watts and horsepower when you know how long it took.',
  summary:
    'Work is force times distance moved in the direction of the force: W = Fd cos θ, where θ is the angle between them. Pushing at an angle wastes part of the force, and a force at right angles to the motion does no work at all. Power is how fast the work is done: P = W ÷ t, in watts, where one horsepower is about 746 watts.',
  synonyms: [
    'work calculator physics',
    'power calculator physics',
    'joules to watts',
    'horsepower calculator',
    'work done formula',
    'force times distance',
  ],
  ui: {
    force: 'Force (N)',
    distance: 'Distance moved (m)',
    angle: 'Angle between force and motion (°)',
    'angle.help': '0 when pushing straight along the motion.',
    time: 'Time taken (s)',
    'time.help': 'Optional, for the power.',
    'out.work': 'Work (J)',
    'out.kj': 'Work (kJ)',
    'out.power': 'Average power (W)',
    'out.hp': 'Power (horsepower)',
    'out.wh': 'Energy (Wh)',
    explain: 'The force does {w} J of work.',
    'explain.power': 'The force does {w} J of work, an average power of {p} W.',
    'step.work': 'Work = force × distance × cos(angle).',
    'step.power': 'Power = work ÷ time.',
    'warn.angle': 'The angle must be between 0° and 180°.',
    'warn.negative':
      'Above 90° the force opposes the motion, so the work is negative: it takes energy away.',
    rounding:
      'Horsepower is the mechanical 745.7 W (OpenStax rounds to 746 W). Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Work">{'W = F × d × cos θ'}</Formula>
      <Formula label="Power">{'P = W ÷ t\n1 W = 1 J/s, 1 hp ≈ 745.7 W'}</Formula>
      <p>
        Only the part of the force along the motion, F cos θ, does work. Lifting at a steady speed
        needs a force equal to the weight, mg, so raising a mass m by a height h takes mgh of work.
        Holding a heavy box still does no work in the physics sense, however tiring it is.
      </p>
    </>
  ),
  examples: [
    {
      id: 'mower',
      title: 'Pushing a mower with 75.0 N at 35° for 25.0 m',
      body: (r, fmt) => (
        <p>
          W = 75.0 × 25.0 × cos 35° = <strong>{fmt.sig(o(r), 6)} J</strong>, the 1.54 × 10³ J of
          OpenStax <em>College Physics</em> Example 7.1.
        </p>
      ),
    },
    {
      id: 'pullup',
      title: 'A pull-up: 705.6 N raised 0.60 m in 0.8 s',
      body: (r, fmt) => (
        <p>
          Lifting 90% of an 80 kg body (0.9 × 80 × 9.8 = 705.6 N) takes {fmt.sig(o(r), 5)} J, so the
          power is <strong>{fmt.sig(o(r, 'power'), 5)} W</strong>, about {fmt.sig(o(r, 'hp'), 2)} hp
          (OpenStax <em>University Physics</em> Example 7.11: 529 W).
        </p>
      ),
    },
    {
      id: 'lift',
      title: 'Raising 1,000 N by 10 m in 20 s',
      body: (r, fmt) => (
        <p>
          10,000 J in 20 s is <strong>{fmt.sig(o(r, 'power'), 4)} W</strong>, about{' '}
          {fmt.sig(o(r, 'hp'), 3)} hp.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use the angle to the motion,</strong> not to the ground, if they differ: on a slope,
        measure from the direction of travel.
      </li>
      <li>
        <strong>Lifting:</strong> use the weight in newtons (mass × 9.81) as the force and the
        height as the distance.
      </li>
      <li>
        <strong>Electrical energy</strong> is the same quantity: 3,600 J is one watt-hour.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for work?',
      a: 'W = Fd cos θ: force times distance times the cosine of the angle between them. Pushing a cart with 50 N for 10 m straight ahead does 500 J of work; pushing at 60° to the motion does only 250 J, because cos 60° = 0.5.',
    },
    {
      q: 'What is the difference between work and power?',
      a: 'Work is the energy transferred, in joules. Power is how quickly it is transferred, in watts, or joules per second. Climbing a flight of stairs takes the same work whether you walk or run, but running takes more power.',
    },
    {
      q: 'How many watts is one horsepower?',
      a: 'The mechanical horsepower, 550 foot-pounds per second, is about 745.7 W, which textbooks round to 746 W. The metric horsepower used for some car ratings is 735.5 W. OpenStax’s example of running up stairs produces 538 W, a little under 1 hp.',
    },
    {
      q: 'Can work be negative?',
      a: 'Yes, when the force points against the motion, at angles between 90° and 180°. Friction on a sliding box and the brakes on a car do negative work, removing kinetic energy. A force at exactly 90°, like a waiter carrying a tray across a room, does no work.',
    },
  ],
  ogSample: (r, fmt) => `75 N × 25 m × cos 35° → ${fmt.sig(o(r), 5)} J`,
};
