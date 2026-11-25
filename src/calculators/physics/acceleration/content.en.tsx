import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'accel') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Acceleration Calculator',
  promise: 'Acceleration from a change in speed, or the final speed or time it takes.',
  title: 'Acceleration Calculator: a = Δv ÷ t, Speed and Time',
  description:
    'Find average acceleration from start speed, end speed and time, or solve for final speed or time, in m/s, km/h or mph, with distance covered and g-force.',
  summary:
    'Acceleration is how fast velocity changes: the change in speed divided by the time it took, in metres per second squared. A train going from 0 to 30 km/h in 20 seconds accelerates at about 0.42 m/s². Slowing down gives a negative value, often called deceleration. With constant acceleration you can also solve for the final speed or the time needed.',
  synonyms: [
    'average acceleration calculator',
    'deceleration calculator',
    'how to calculate acceleration',
    'final velocity calculator',
    '0 to 60 acceleration',
    'm/s² calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.a': 'Acceleration',
    'find.v': 'Final speed',
    'find.t': 'Time',
    v0: 'Starting speed',
    v: 'Final speed',
    su: 'Speed unit',
    'unit.ms': 'm/s',
    'unit.kmh': 'km/h',
    'unit.mph': 'mph',
    a: 'Acceleration (m/s²)',
    'a.help': 'Negative when slowing down. 1 g = 9.80665 m/s².',
    t: 'Time (seconds)',
    'out.result': 'Result',
    'out.result.a': 'Acceleration',
    'out.result.v': 'Final speed',
    'out.result.t': 'Time taken',
    'out.accel': 'Acceleration (m/s²)',
    'out.vf': 'Final speed (m/s)',
    'out.time': 'Time (s)',
    'out.distance': 'Distance covered at constant acceleration (m)',
    'out.gs': 'Acceleration in g',
    'explain.up': 'Speeding up at {a} m/s², or {g} g, over {t} seconds.',
    'explain.down': 'Slowing at {a} m/s², or {g} g, over {t} seconds.',
    'explain.none': 'The speed does not change, so there is no acceleration.',
    'step.convert': 'Convert speeds to metres per second.',
    'step.a': 'a = (final speed − starting speed) ÷ time.',
    'step.v': 'v = starting speed + a × t.',
    'step.t': 't = (final speed − starting speed) ÷ a.',
    'step.distance': 'At constant acceleration, distance = the average of the two speeds × time.',
    'warn.time': 'Enter a time greater than zero.',
    'warn.zero': 'With zero acceleration the speed never changes, so it never reaches that speed.',
    'warn.same': 'The speeds are equal and the acceleration is zero, so any time works.',
    'warn.never':
      'With this acceleration the speed moves away from the final speed. Check the sign of the acceleration.',
    'warn.reverse':
      'The direction reverses, so the distance shown is the net displacement, not the total path.',
    'warn.relativistic': 'Near the speed of light these classical formulas no longer apply.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Average acceleration">{'a = (v − v₀) ÷ t'}</Formula>
      <Formula label="Rearranged">{'v = v₀ + a × t\nt = (v − v₀) ÷ a'}</Formula>
      <Formula label="Distance at constant acceleration">{'x = (v₀ + v) ÷ 2 × t'}</Formula>
      <p>
        Velocity has a direction, so a value in one direction is positive and the opposite direction
        negative. Acceleration is negative when it points the negative way, which slows a
        forward-moving object. The calculator works in m/s internally (1 km/h = 1/3.6 m/s and 1 mph
        = 0.44704 m/s exactly).
      </p>
    </>
  ),
  examples: [
    {
      id: 'subway',
      title: 'A subway train from rest to 30.0 km/h in 20.0 s',
      body: (r, fmt) => (
        <p>
          30.0 km/h is 8.333 m/s, so a = 8.333 ÷ 20.0 = <strong>{fmt.sig(o(r), 3)} m/s²</strong>, as
          in OpenStax <em>College Physics</em> Example 2.4.
        </p>
      ),
    },
    {
      id: 'horse',
      title: 'A racehorse reaching 15.0 m/s due west in 1.80 s',
      body: (r, fmt) => (
        <p>
          With west as negative, a = −15.0 ÷ 1.80 = <strong>{fmt.sig(o(r), 3)} m/s²</strong>: 8.33
          m/s² due west (OpenStax Example 2.1).
        </p>
      ),
    },
    {
      id: 'landing',
      title: 'An airliner landing at 70.0 m/s and braking at 1.50 m/s² for 40.0 s',
      body: (r, fmt) => (
        <p>
          v = 70.0 − 1.50 × 40.0 = <strong>{fmt.sig(o(r, 'vf'), 3)} m/s</strong> (Example 2.9),
          after rolling (70 + 10) ÷ 2 × 40 = {fmt.sig(o(r, 'distance'), 4)} m.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Car 0–60 mph:</strong> enter 0 and 60 mph and the time; 0–60 in 6 seconds is about
        4.5 m/s², or 0.46 g.
      </li>
      <li>
        <strong>Deceleration is still acceleration.</strong> A stopping car has a negative
        acceleration if its motion is positive. Its size, not its sign, says how hard it brakes.
      </li>
      <li>
        <strong>Average, not peak:</strong> this gives the average over the time interval. Real
        acceleration often varies, peaking above the average.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for acceleration?',
      a: 'Acceleration equals the change in velocity divided by the time taken: a = (v − v₀) ÷ t. A train going from 0 to 30.0 km/h, which is 8.33 m/s, in 20.0 seconds accelerates at 8.33 ÷ 20.0 = 0.417 m/s², as in OpenStax College Physics Example 2.4.',
    },
    {
      q: 'What does a negative acceleration mean?',
      a: 'It means the acceleration points in the negative direction. If the object moves in the positive direction, it is slowing down. A train slowing from 30.0 km/h to a stop in 8.00 s has an acceleration of −1.04 m/s².',
    },
    {
      q: 'How do I find the final speed from acceleration and time?',
      a: 'Multiply acceleration by time and add the starting speed: v = v₀ + at. An airliner touching down at 70.0 m/s and braking at −1.50 m/s² for 40.0 s slows to 70.0 − 60.0 = 10.0 m/s.',
    },
    {
      q: 'What is acceleration in g?',
      a: 'It is the acceleration divided by standard gravity, 9.80665 m/s². One g is what you feel standing still. A car accelerating at 4.5 m/s² pulls about 0.46 g, while a dragster at 26.0 m/s² pulls about 2.7 g.',
    },
  ],
  ogSample: (r, fmt) => `0 → 30 km/h in 20 s → ${fmt.sig(o(r), 3)} m/s²`,
};
