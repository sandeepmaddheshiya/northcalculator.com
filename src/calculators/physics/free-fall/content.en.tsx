import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Free Fall Calculator',
  promise: 'How long a drop takes and how fast it lands, ignoring air resistance.',
  title: 'Free Fall Calculator: Fall Time, Distance and Impact Speed',
  description:
    'Find how long an object takes to fall a given height, or how far it falls in a given time, and its landing speed, with an optional starting speed and custom g.',
  summary:
    'Without air resistance, every object near the Earth’s surface speeds up at the same rate, g, about 9.81 metres per second every second. Dropped from rest, it falls ½gt² in a time t and reaches a speed of gt. So the fall time from a height h is √(2h ÷ g): about 2.47 seconds for a 30 m drop.',
  synonyms: [
    'falling object calculator',
    'drop time calculator',
    'impact velocity calculator',
    'how long to fall calculator',
    'gravity calculator',
    'kinematics free fall',
  ],
  ui: {
    known: 'I know the',
    'known.height': 'Height',
    'known.time': 'Fall time',
    hRow: 'Height',
    height: 'Height of the drop',
    hu: 'Unit',
    'unit.m': 'metres',
    'unit.ft': 'feet',
    time: 'Time falling (s)',
    v0: 'Starting speed, downward',
    'v0.help': 'In m/s, or ft/s when using feet. 0 if simply dropped.',
    g: 'Gravity, g (m/s²)',
    'g.help': '9.80665 is standard gravity; the Moon is about 1.625.',
    'out.result': 'Fall time (s)',
    'out.result.height': 'Fall time (s)',
    'out.result.time': 'Distance fallen',
    'out.speed': 'Landing speed (m/s)',
    'out.speed.m': 'Landing speed (m/s)',
    'out.speed.ft': 'Landing speed (ft/s)',
    'out.kmh': 'Landing speed (km/h)',
    'out.mph': 'Landing speed (mph)',
    'out.distance': 'Distance fallen (m)',
    'out.distance.m': 'Distance fallen (m)',
    'out.distance.ft': 'Distance fallen (ft)',
    'explain.m': 'Falling {d} m takes {t} s and ends at {v} m/s.',
    'explain.ft': 'Falling {d} ft takes {t} s and ends at {v} ft/s.',
    'step.time': 'Solve h = v₀t + ½gt² for t.',
    'step.distance': 'Distance = v₀t + ½gt².',
    'step.speed': 'Speed = v₀ + gt.',
    'warn.g': 'Gravity must be greater than zero.',
    'warn.air':
      'At this speed air resistance is significant for most objects, so a real fall is slower than this.',
    rounding: 'Ignores air resistance. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Free fall from rest">{'d = ½ g t²\nv = g t\nt = √(2h ÷ g)'}</Formula>
      <Formula label="With a downward starting speed v₀">{'d = v₀t + ½gt²\nv = v₀ + gt'}</Formula>
      <p>
        g varies from about 9.78 to 9.83 m/s² over the Earth’s surface; the calculator defaults to
        the standard value 9.80665 m/s², and OpenStax uses 9.80 or 9.8, so set g to match your
        course. Real objects fall more slowly once air resistance builds up.
      </p>
    </>
  ),
  examples: [
    {
      id: 'ice',
      title: 'A chunk of ice falling 30.0 m (g = 9.8)',
      body: (r, fmt) => (
        <p>
          t = √(2 × 30 ÷ 9.8) = <strong>{fmt.sig(o(r), 6)} s</strong>, which OpenStax{' '}
          <em>College Physics</em> gives as 2.47 s.
        </p>
      ),
    },
    {
      id: 'thrown',
      title: 'Thrown down at 4.9 m/s from a 98 m building',
      body: (r, fmt) => (
        <p>
          98 = 4.9t + 4.9t² gives <strong>t = {fmt.sig(o(r), 6)} s</strong>, landing at{' '}
          {fmt.sig(o(r, 'speed'), 6)} m/s (OpenStax <em>University Physics</em> Example 3.14).
        </p>
      ),
    },
    {
      id: 'baseball',
      title: 'Falling for 2.5 seconds from rest',
      body: (r, fmt) => (
        <p>
          d = ½ × 9.8 × 2.5² = <strong>{fmt.sig(o(r), 6)} m</strong> and v = 9.8 × 2.5 ={' '}
          {fmt.sig(o(r, 'speed'), 6)} m/s: the descent of the baseball in Example 3.15, which rose
          30.6 m.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Distance grows with the square of time.</strong> Twice as long a fall covers four
        times the distance.
      </li>
      <li>
        <strong>Mass doesn’t matter</strong> without air: a hammer and a feather fall together on
        the Moon.
      </li>
      <li>
        <strong>Estimating a drop:</strong> time a stone falling into a well; 2 seconds means about
        19.6 m, ignoring the time for the sound to return.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How long does it take to fall from a height?',
      a: 'From rest, t = √(2h ÷ g). With g = 9.81 m/s², a 5 m fall takes about 1.01 s, 20 m about 2.02 s and 100 m about 4.52 s, before air resistance. Four times the height doubles the time.',
    },
    {
      q: 'How fast does a falling object hit the ground?',
      a: 'From rest, v = √(2gh), or g times the fall time. A 20 m drop ends at about 19.8 m/s (71 km/h). Air resistance lowers this for long falls, and each object has a top speed at which drag balances its weight.',
    },
    {
      q: 'Do heavier objects fall faster?',
      a: 'Not in a vacuum: all objects have the same acceleration, g. In air, a dense, compact object such as a stone is barely slowed, while a feather or sheet of paper is slowed a lot because drag is large compared with its weight.',
    },
    {
      q: 'What value of g should I use?',
      a: 'Standard gravity is 9.80665 m/s², the conventional value. The actual value is about 9.78 m/s² at the equator and 9.83 m/s² at the poles. Many textbooks use 9.8 or 9.81; in feet it is about 32.2 ft/s².',
    },
  ],
  ogSample: (r, fmt) => `30 m drop → ${fmt.sig(o(r), 4)} s`,
};
