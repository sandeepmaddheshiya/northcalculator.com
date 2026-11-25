import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'force') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Gravitational Force Calculator',
  promise: 'The gravitational pull between two masses, from Newton’s law of gravitation.',
  title: 'Gravitational Force Calculator: F = Gm₁m₂/r², Newton’s Law',
  description:
    'Calculate the gravitational force between two masses from Newton’s law of universal gravitation, with the CODATA value of G and each body’s acceleration.',
  summary:
    'Every two masses attract each other with a force F = G m₁ m₂ ÷ r², where r is the distance between their centres and G is the gravitational constant, 6.674 × 10⁻¹¹ N·m²/kg². Doubling the distance quarters the force. The force is tiny for everyday objects and only becomes large when at least one mass is planet-sized.',
  synonyms: [
    'Newton’s law of gravitation calculator',
    'gravity between two objects',
    'universal gravitation calculator',
    'gravitational constant G',
    'surface gravity calculator',
    'gravitational attraction calculator',
  ],
  ui: {
    m1: 'Mass 1 (kg)',
    'mass.help': 'Scientific notation works: 5.98e24 for the Earth.',
    m2: 'Mass 2 (kg)',
    rRow: 'Distance between centres',
    r: 'Distance',
    ru: 'Unit',
    'unit.m': 'm',
    'unit.km': 'km',
    'out.force': 'Gravitational force (N)',
    'out.a1': 'Acceleration of mass 1 (m/s²)',
    'out.a2': 'Acceleration of mass 2 (m/s²)',
    explain: 'The two masses pull on each other with {f} N.',
    'step.force': 'F = G × m₁ × m₂ ÷ r².',
    'warn.r': 'The distance must be greater than zero.',
    rounding:
      'Uses the 2022 CODATA G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻², uncertain in the fifth digit. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Newton’s law of gravitation">
        {'F = G × m₁ × m₂ ÷ r²\nG = 6.67430 × 10⁻¹¹ N·m²/kg²'}
      </Formula>
      <Formula label="Field strength">{'g = G × M ÷ r²  (force on 1 kg)'}</Formula>
      <p>
        Measure r between the centres of mass; for a planet, that is its radius plus the height
        above the surface. The same force acts on both bodies in opposite directions, but the
        lighter one accelerates far more. OpenStax uses G = 6.67 × 10⁻¹¹, so its answers can differ
        in the third digit.
      </p>
    </>
  ),
  examples: [
    {
      id: 'surface',
      title: 'Gravity at the Earth’s surface',
      body: (r, fmt) => (
        <p>
          With M = 5.98 × 10²⁴ kg and r = 6.38 × 10⁶ m, a 1 kg mass feels{' '}
          <strong>{fmt.sig(o(r), 4)} N</strong>, so g ≈ 9.81 m/s²; OpenStax <em>College Physics</em>{' '}
          gets 9.80 m/s² with G = 6.67 × 10⁻¹¹.
        </p>
      ),
    },
    {
      id: 'spacecraft',
      title: 'Two 9,000 kg spacecraft 10.0 m apart',
      body: (r, fmt) => (
        <p>
          F = <strong>{fmt.sig(o(r), 3)} N</strong>, giving each an acceleration of{' '}
          {fmt.sig(o(r, 'a1'), 2)} m/s², as in OpenStax <em>University Physics</em> Example 13.1.
        </p>
      ),
    },
    {
      id: 'unit',
      title: 'Two 1 kg masses 1 m apart',
      body: (r, fmt) => (
        <p>
          F = G = <strong>{fmt.sig(o(r), 5)} N</strong>, the value of the gravitational constant
          itself.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Inverse square:</strong> three times as far away means one ninth of the force.
      </li>
      <li>
        <strong>Large numbers:</strong> type planetary masses in scientific notation, such as
        7.35e22 for the Moon.
      </li>
      <li>
        <strong>Weight on another planet:</strong> enter the planet’s mass and radius with your mass
        as mass 2.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for gravitational force?',
      a: 'F = G m₁ m₂ ÷ r², where G = 6.674 × 10⁻¹¹ N·m²/kg², m₁ and m₂ are the masses in kilograms and r is the distance between their centres in metres. The force is the same on both masses, in opposite directions.',
    },
    {
      q: 'What is the gravitational constant G?',
      a: 'A fundamental constant measuring the strength of gravity. NIST’s 2022 CODATA value is 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻², known only to about five significant figures because gravity is so weak that it is hard to measure in a laboratory.',
    },
    {
      q: 'Why don’t I feel the pull of objects around me?',
      a: 'Because G is tiny. Two 70 kg people a metre apart attract each other with about 3.3 × 10⁻⁷ N, a third of a millionth of a newton. Only something as massive as the Earth produces a pull large enough to notice.',
    },
    {
      q: 'How does gravity change with height?',
      a: 'It falls with the square of the distance from the Earth’s centre. At the Moon’s distance, 3.84 × 10⁸ m, the Earth’s field is about 2.7 × 10⁻³ m/s², the value OpenStax uses to show it supplies the Moon’s orbital acceleration.',
    },
  ],
  ogSample: (r, fmt) => `Earth on 1 kg at the surface → ${fmt.sig(o(r), 4)} N`,
};
