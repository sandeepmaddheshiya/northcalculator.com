import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Kinetic Energy Calculator',
  promise: 'Kinetic energy from mass and speed, or mass or speed from the energy.',
  title: 'Kinetic Energy Calculator: KE = ½mv², Mass and Speed',
  description:
    'Find the kinetic energy of a moving object from its mass and speed, or solve KE = ½mv² for mass or speed, with kg, g, lb, m/s, km/h and mph.',
  summary:
    'Kinetic energy is the energy an object has because it is moving. It equals half the mass times the speed squared, KE = ½mv², measured in joules when mass is in kilograms and speed in metres per second. Because speed is squared, doubling the speed makes the kinetic energy four times larger, which is why braking distance grows so quickly.',
  synonyms: [
    'KE calculator',
    'kinetic energy formula',
    '1/2mv2 calculator',
    'joules calculator',
    'velocity from kinetic energy',
    'mass from kinetic energy',
  ],
  ui: {
    find: 'Find',
    'find.energy': 'Energy',
    'find.mass': 'Mass',
    'find.speed': 'Speed',
    massRow: 'Mass',
    mass: 'Mass',
    massUnit: 'Mass unit',
    'unit.kg': 'kg',
    'unit.g': 'g',
    'unit.lb': 'lb',
    spdRow: 'Speed',
    speed: 'Speed',
    speedUnit: 'Speed unit',
    'unit.ms': 'm/s',
    'unit.kmh': 'km/h',
    'unit.mph': 'mph',
    energy: 'Kinetic energy (J)',
    'out.result': 'Kinetic energy (J)',
    'out.result.energy': 'Kinetic energy (J)',
    'out.result.mass': 'Mass (kg)',
    'out.result.speed': 'Speed (m/s)',
    'out.kj': 'Energy in kJ',
    'out.kg': 'Mass in kg',
    'out.ms': 'Speed in m/s',
    'out.kmh': 'Speed in km/h',
    explain: 'A mass of {m} kg moving at {v} m/s has {k} J of kinetic energy.',
    'step.kg': 'Convert the mass to kilograms.',
    'step.ms': 'Convert the speed to metres per second.',
    'step.energy': 'KE = ½mv².',
    'step.mass': 'm = 2KE ÷ v².',
    'step.speed': 'v = √(2KE ÷ m).',
    'warn.speed': 'Enter a speed greater than zero.',
    'warn.mass': 'Enter a mass greater than zero.',
    'warn.relativistic':
      'This is over a tenth of the speed of light, where ½mv² starts to underestimate the true kinetic energy.',
    rounding:
      'Uses exact unit factors (1 lb = 0.45359237 kg, 1 mph = 0.44704 m/s). Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Kinetic energy">{'KE = ½ m v²\nm = 2KE ÷ v²\nv = √(2KE ÷ m)'}</Formula>
      <p>
        With m in kilograms and v in metres per second, KE comes out in joules (1 J = 1 kg·m²/s²).
        The work-energy theorem says the net work done on an object equals its change in kinetic
        energy, so these joules are also the work needed to bring it up to speed from rest, or to
        stop it.
      </p>
    </>
  ),
  examples: [
    {
      id: 'athlete',
      title: 'An 80 kg sprinter at 10 m/s',
      body: (r, fmt) => (
        <p>
          ½ × 80 × 10² = <strong>{fmt.sig(o(r), 8)} J</strong>, which OpenStax{' '}
          <em>University Physics</em> Example 7.6 gives as 4.0 kJ.
        </p>
      ),
    },
    {
      id: 'package',
      title: 'A 30 kg package at 0.5 m/s',
      body: (r, fmt) => (
        <p>
          ½ × 30 × 0.5² = <strong>{fmt.sig(o(r), 8)} J</strong>, matching Example 7.2 in OpenStax{' '}
          <em>College Physics</em>.
        </p>
      ),
    },
    {
      id: 'speed',
      title: 'The speed of a 30 kg package with 95.75 J',
      body: (r, fmt) => (
        <p>
          v = √(2 × 95.75 ÷ 30) = <strong>{fmt.sig(o(r), 6)} m/s</strong>. Example 7.4 rounds it to
          2.53 m/s.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Speed matters most.</strong> A car at 100 km/h has four times the kinetic energy it
        has at 50 km/h, and needs about four times the distance to stop with the same braking.
      </li>
      <li>
        <strong>Use kilograms and metres per second</strong> if you work by hand. Grams or km/h
        without converting give answers that are off by factors of 1,000 or 13.
      </li>
      <li>
        <strong>Kinetic energy depends on the frame.</strong> A passenger walking down a moving
        train has a small kinetic energy relative to the train and a much larger one relative to the
        ground.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for kinetic energy?',
      a: 'KE = ½mv², half the mass times the speed squared. A 1,000 kg car at 20 m/s (72 km/h) has ½ × 1,000 × 20² = 200,000 J, or 200 kJ, of kinetic energy.',
    },
    {
      q: 'What units is kinetic energy measured in?',
      a: 'The SI unit is the joule, which is one kilogram times metre squared per second squared. You get joules when the mass is in kilograms and the speed in metres per second. Food energy uses kilocalories, where 1 kcal is about 4,184 J.',
    },
    {
      q: 'What happens to kinetic energy if speed doubles?',
      a: 'It quadruples, because speed is squared. Tripling the speed makes it nine times larger. Doubling the mass at the same speed only doubles it. This is why a small increase in driving speed makes crashes much more severe.',
    },
    {
      q: 'Can kinetic energy be negative?',
      a: 'No. Mass is positive and the speed is squared, so kinetic energy is always zero or positive. It is zero only for an object at rest in the frame you are measuring from. A change in kinetic energy can be negative, when something slows down.',
    },
  ],
  ogSample: (r, fmt) => `80 kg at 10 m/s → ${fmt.sig(o(r), 8)} J`,
};
