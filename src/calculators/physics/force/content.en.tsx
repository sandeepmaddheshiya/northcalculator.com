import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Force Calculator',
  promise: 'Force, mass or acceleration from Newton’s second law, F = ma.',
  title: 'Force Calculator: F = ma for Force, Mass or Acceleration',
  description:
    'Use Newton’s second law, F = ma, to find force, mass or acceleration, in newtons, kilonewtons or pounds-force, with kg, g or lb and m/s², ft/s² or g.',
  summary:
    'Newton’s second law says the net force on an object equals its mass times its acceleration: F = ma. One newton is the force that accelerates one kilogram at one metre per second squared. Rearranged, a = F ÷ m and m = F ÷ a. Weight is the special case where the acceleration is gravity, about 9.81 m/s².',
  synonyms: [
    'F = ma calculator',
    'Newton’s second law calculator',
    'acceleration calculator',
    'newton calculator',
    'mass from force and acceleration',
    'net force calculator',
  ],
  ui: {
    find: 'Find',
    'find.force': 'Force',
    'find.mass': 'Mass',
    'find.accel': 'Acceleration',
    forceRow: 'Net force',
    force: 'Force',
    fu: 'Force unit',
    massRow: 'Mass',
    mass: 'Mass',
    mu: 'Mass unit',
    accelRow: 'Acceleration',
    accel: 'Acceleration',
    au: 'Acceleration unit',
    'unit.N': 'N',
    'unit.kN': 'kN',
    'unit.lbf': 'lbf',
    'unit.kg': 'kg',
    'unit.g': 'g',
    'unit.lb': 'lb',
    'unit.ms2': 'm/s²',
    'unit.fts2': 'ft/s²',
    'sym.N': 'N',
    'sym.kN': 'kN',
    'sym.lbf': 'lbf',
    'sym.kg': 'kg',
    'sym.lb': 'lb',
    'sym.ms2': 'm/s²',
    'sym.fts2': 'ft/s²',
    'sym.g': 'g',
    'out.result': 'Acceleration',
    'out.result.force': 'Force',
    'out.result.mass': 'Mass',
    'out.result.accel': 'Acceleration',
    'out.N': 'Force (N)',
    'out.kg': 'Mass (kg)',
    'out.ms2': 'Acceleration (m/s²)',
    'out.weight': 'Weight of the mass at gₙ (N)',
    explain: 'A net force of {f} N on {m} kg gives an acceleration of {a} m/s².',
    'step.force': 'Force = mass × acceleration.',
    'step.mass': 'Mass = force ÷ acceleration.',
    'step.accel': 'Acceleration = force ÷ mass.',
    'warn.accel': 'The acceleration must be greater than zero.',
    'warn.mass': 'The mass must be greater than zero.',
    rounding:
      'Uses standard gravity gₙ = 9.80665 m/s² for g and lbf. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Newton’s second law">{'F = m × a\na = F ÷ m\nm = F ÷ a'}</Formula>
      <p>
        F is the net force, the sum of all forces, in newtons (1 N = 1 kg·m/s²). If a mower is
        pushed with 51 N more than friction holds it back, only those 51 N accelerate it. Weight is
        w = mg; this calculator uses the standard value gₙ = 9.80665 m/s², while textbooks often
        round to 9.80 or 9.8.
      </p>
    </>
  ),
  examples: [
    {
      id: 'mower',
      title: 'A 24 kg lawn mower with 51 N of net force',
      body: (r) => (
        <p>
          a = 51 ÷ 24 = <strong>{String(o(r))}</strong>, which OpenStax <em>College Physics</em>{' '}
          Example 4.1 rounds to 2.1 m/s².
        </p>
      ),
    },
    {
      id: 'car',
      title: 'Mass from 600 N and 0.2 m/s²',
      body: (r) => (
        <p>
          m = 600 ÷ 0.2 = <strong>{String(o(r))}</strong>, as in OpenStax{' '}
          <em>University Physics</em> Example 5.6.
        </p>
      ),
    },
    {
      id: 'sled',
      title: 'Accelerating a 2,100 kg rocket sled at 49 m/s²',
      body: (r) => (
        <p>
          F = 2,100 × 49 = <strong>{String(o(r))}</strong>. Adding 650 N of friction and sharing
          between four rockets gives 25,887.5 N each: <em>College Physics</em> prints 2.6 × 10⁴ N,
          while <em>University Physics</em> prints 2.5 × 10⁴ N.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use the net force.</strong> Subtract friction and other opposing forces before
        dividing by the mass.
      </li>
      <li>
        <strong>Mass is not weight.</strong> A 70 kg person has a mass of 70 kg everywhere, but
        weighs about 686 N on Earth and about 114 N on the Moon.
      </li>
      <li>
        <strong>Pounds:</strong> lb is a mass and lbf a force; one pound of mass weighs one
        pound-force under standard gravity.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is Newton’s second law?',
      a: 'The acceleration of an object is the net force on it divided by its mass, a = F ÷ m, usually written F = ma. Double the force and the acceleration doubles; double the mass and it halves.',
    },
    {
      q: 'What is a newton?',
      a: 'The SI unit of force: the force that gives a 1 kg mass an acceleration of 1 m/s². It is about 0.225 pounds-force, roughly the weight of a small apple. A 1 kg bag of sugar weighs about 9.81 N.',
    },
    {
      q: 'How do I calculate weight from mass?',
      a: 'Multiply the mass by the acceleration due to gravity: w = mg. With g = 9.80665 m/s², a 70 kg person weighs about 686.5 N. On the Moon, where g is about 1.625 m/s², the same person weighs about 114 N.',
    },
    {
      q: 'What if several forces act at once?',
      a: 'Add them as vectors to get the net force, then use F = ma. Forces in opposite directions subtract. For forces at angles, add the horizontal and vertical components separately and combine them with the Pythagorean theorem.',
    },
  ],
  ogSample: (r) => `51 N on 24 kg → ${String(o(r))}`,
};
