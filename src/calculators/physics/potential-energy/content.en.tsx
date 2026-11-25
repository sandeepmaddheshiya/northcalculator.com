import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Potential Energy Calculator',
  promise: 'Gravitational potential energy from mass and height, or solve for either one.',
  title: 'Potential Energy Calculator: PE = mgh, Mass or Height',
  description:
    'Find gravitational potential energy from mass and height with PE = mgh, or solve for mass or height, in kg, lb, metres or feet, with the fall speed.',
  summary:
    'Gravitational potential energy is the energy an object has because of its height: mass times gravity times height. Lifting 1 kg by 1 m on Earth stores about 9.8 joules. Height is measured from any reference level you choose, so only differences in potential energy have physical meaning. Released from rest, that energy becomes speed.',
  synonyms: [
    'gravitational potential energy calculator',
    'PE = mgh calculator',
    'mgh calculator',
    'potential energy formula',
    'energy from height calculator',
    'how high to store energy',
  ],
  ui: {
    find: 'Solve for',
    'find.energy': 'Energy',
    'find.mass': 'Mass',
    'find.height': 'Height',
    massRow: 'Mass',
    mass: 'Mass',
    massUnit: 'Unit',
    'unit.kg': 'kg',
    'unit.g': 'grams',
    'unit.lb': 'pounds',
    htRow: 'Height above the reference level (negative if below)',
    height: 'Height',
    heightUnit: 'Unit',
    'unit.m': 'metres',
    'unit.ft': 'feet',
    energy: 'Potential energy (J)',
    g: 'Gravity, g (m/s²)',
    'g.help': '9.80665 is standard gravity; OpenStax uses 9.80. The Moon is about 1.62.',
    'out.result': 'Result',
    'out.result.energy': 'Potential energy (J)',
    'out.result.mass': 'Mass (kg)',
    'out.result.height': 'Height',
    'out.kj': 'Potential energy (kJ)',
    'out.kg': 'Mass (kg)',
    'out.m': 'Height (m)',
    'out.speed': 'Speed after falling that height from rest (m/s)',
    explain: '{m} kg at {h} m above the reference level stores {e} J.',
    'explain.below': '{m} kg at {h} m below the reference level has {e} J relative to it.',
    'step.kg': 'Convert the mass to kilograms.',
    'step.m': 'Convert the height to metres (1 ft = 0.3048 m).',
    'step.energy': 'PE = m × g × h.',
    'step.mass': 'm = PE ÷ (g × h).',
    'step.height': 'h = PE ÷ (m × g).',
    'step.speed': 'Falling from rest with no air resistance, v = √(2gh).',
    'warn.height': 'The height cannot be zero when solving for mass.',
    'warn.sign': 'Energy and height must have the same sign to give a positive mass.',
    'warn.mass': 'Enter a mass above zero.',
    'warn.far':
      'Over 100 km, g is noticeably weaker than at the surface, so mgh overstates the energy.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Potential energy">{'PE = m × g × h'}</Formula>
      <Formula label="Speed after a fall from rest">{'v = √(2 × g × h)'}</Formula>
      <p>
        PE is in joules when mass is in kilograms, g in m/s² and height in metres. The formula
        assumes g is constant, which holds near the surface: at 100 km up, g is about 3% lower. For
        orbits and planets, use the gravitation calculator instead.
      </p>
      <p>
        The fall speed assumes all the potential energy turns into kinetic energy, ½mv² = mgh, so
        mass cancels out. Air resistance makes real objects slower.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hiker',
      title: 'A 75 kg hiker on a summit 147 m above the trail head',
      body: (r, fmt) => (
        <p>
          75 × 9.8 × 147 = <strong>{fmt.sig(o(r), 6)} J</strong>, about {fmt.sig(o(r, 'kj'), 3)} kJ,
          as in OpenStax <em>University Physics</em> Example 8.2. With sea level as the reference
          instead, the same summit gives a different number; only the change between two points
          matters.
        </p>
      ),
    },
    {
      id: 'clock',
      title: 'Winding a cuckoo clock: 0.500 kg raised 1.00 m',
      body: (r, fmt) => (
        <p>
          0.500 × 9.80 × 1.00 = <strong>{fmt.sig(o(r), 3)} J</strong> stored, released slowly as the
          weight falls (OpenStax <em>College Physics</em> §7.3).
        </p>
      ),
    },
    {
      id: 'rock',
      title: 'How high is a 10 kg rock that has 980 J?',
      body: (r, fmt) => (
        <p>
          h = 980 ÷ (10 × 9.8) = <strong>{fmt.sig(o(r), 3)} m</strong>, as in the OpenStax{' '}
          <em>Physics</em> falling-rock example.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Pick the reference level once.</strong> The floor, the ground or sea level all work,
        but use the same one for every point you compare.
      </li>
      <li>
        <strong>Mass does not change fall speed.</strong> A dropped 1 kg and 10 kg object reach the
        same speed from the same height if air resistance is negligible.
      </li>
      <li>
        <strong>Scale check:</strong> lifting a 1 kg bag of sugar onto a 1 m table stores about 10
        J, roughly what a phone charger delivers in a second or two.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for gravitational potential energy?',
      a: 'PE = mgh: mass in kilograms times the acceleration due to gravity (about 9.8 m/s² on Earth) times height in metres gives joules. A 75 kg hiker 147 m above the trail head has 75 × 9.8 × 147 ≈ 108,000 J, or 108 kJ.',
    },
    {
      q: 'Can potential energy be negative?',
      a: 'Yes. Height is measured from a reference level you choose, so a point below it has negative potential energy. The OpenStax hiker example gives −35.3 kJ at sea level when the trail head, 48 m above sea level, is the zero. Only differences between points matter.',
    },
    {
      q: 'How fast will something fall from a given height?',
      a: 'From rest with no air resistance, v = √(2gh). A roller coaster dropping 20.0 m reaches √(2 × 9.80 × 20.0) ≈ 19.8 m/s, as in OpenStax College Physics Example 7.7. Mass cancels out, so heavy and light objects reach the same speed.',
    },
    {
      q: 'What value of g should I use?',
      a: 'Standard gravity is 9.80665 m/s². Textbooks often use 9.80 or 9.81, and real values on Earth range from about 9.78 at the equator to 9.83 at the poles. Change g under More options to use the Moon’s 1.62 m/s² or Mars’s 3.71 m/s².',
    },
  ],
  ogSample: (r, fmt) => `75 kg at 147 m → ${fmt.sig(o(r, 'kj'), 4)} kJ`,
};
