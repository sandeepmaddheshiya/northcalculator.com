import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'force') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Centripetal Force Calculator',
  promise: 'The force and acceleration needed to keep something moving in a circle.',
  title: 'Centripetal Force Calculator: F = mv²/r, Acceleration and g',
  description:
    'Find the centripetal force and acceleration of an object moving in a circle, in g, plus the friction needed on a flat curve, the ideal bank angle and lap time.',
  summary:
    'An object moving in a circle is always accelerating toward the centre, even at steady speed, because its direction keeps changing. That centripetal acceleration is v² ÷ r, and the force needed to provide it is mv² ÷ r. Doubling the speed needs four times the force, which is why fast cars need gentle curves, high friction or banked roads.',
  synonyms: [
    'centripetal acceleration calculator',
    'circular motion calculator',
    'F = mv^2/r calculator',
    'banked curve calculator',
    'g-force in a turn',
    'centrifugal force calculator',
  ],
  ui: {
    mass: 'Mass (kg)',
    vRow: 'Speed',
    speed: 'Speed',
    su: 'Unit',
    'unit.ms': 'm/s',
    'unit.kmh': 'km/h',
    'unit.mph': 'mph',
    radius: 'Radius of the circle (m)',
    'out.force': 'Centripetal force (N)',
    'out.accel': 'Centripetal acceleration (m/s²)',
    'out.friction': 'Friction coefficient needed on a flat curve',
    'out.bank': 'Ideal bank angle (°)',
    'out.period': 'Time for one lap (s)',
    explain:
      'Holding this circle takes {f} N of inward force, an acceleration of {a} m/s² ({gs} g).',
    'step.accel': 'a = v² ÷ r.',
    'step.force': 'F = m × a.',
    'step.bank': 'Ideal bank angle = tan⁻¹(v² ÷ rg).',
    'warn.radius': 'The radius must be greater than zero.',
    rounding: 'Uses g = 9.80665 m/s². Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Circular motion">{'a = v² ÷ r\nF = m v² ÷ r\nT = 2πr ÷ v'}</Formula>
      <Formula label="Curves">{'flat: μ ≥ v² ÷ (r g)\nbanked: tan θ = v² ÷ (r g)'}</Formula>
      <p>
        On a flat road, friction between the tyres and road supplies the inward force, so the road
        needs a friction coefficient of at least v² ÷ (rg). On a road banked at the ideal angle, the
        normal force alone does the job and no friction is needed; the angle depends only on speed
        and radius, not on mass.
      </p>
    </>
  ),
  examples: [
    {
      id: 'curve',
      title: 'A 900 kg car at 25.0 m/s on a 500 m curve',
      body: (r, fmt) => (
        <p>
          a = 25² ÷ 500 = {fmt.sig(o(r, 'accel'), 3)} m/s² and F = 900 × 1.25 ={' '}
          <strong>{fmt.sig(o(r), 4)} N</strong>, needing μ ≥ {fmt.sig(o(r, 'friction'), 2)}, as in
          OpenStax <em>College Physics</em> Examples 6.2 and 6.4.
        </p>
      ),
    },
    {
      id: 'jet',
      title: 'A jet at 134.1 m/s turning on a 1,835 m radius',
      body: (r, fmt) => (
        <p>
          a = 134.1² ÷ 1835 = <strong>{fmt.sig(o(r, 'accel'), 3)} m/s²</strong>, a 1 g turn, as in
          OpenStax <em>University Physics</em> Example 4.10.
        </p>
      ),
    },
    {
      id: 'bank',
      title: 'The bank angle for 45.8 m/s on a 100 m curve',
      body: (r, fmt) => (
        <p>
          θ = tan⁻¹(45.8² ÷ (100 × 9.81)) = <strong>{fmt.sig(o(r, 'bank'), 3)}°</strong>; OpenStax
          Example 6.5 works the other way, from a 65.0° bank to 45.8 m/s.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Speed counts twice:</strong> 10% faster needs 21% more force on the same curve.
      </li>
      <li>
        <strong>Tighter turns are harder:</strong> halving the radius doubles the force at the same
        speed.
      </li>
      <li>
        <strong>Wet or icy roads</strong> lower the friction available, so the safe speed on a flat
        curve drops.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for centripetal force?',
      a: 'F = m v² ÷ r: mass times speed squared, divided by the radius of the circle. A 1,000 kg car at 20 m/s on a 100 m radius curve needs 1,000 × 400 ÷ 100 = 4,000 N of inward force from its tyres.',
    },
    {
      q: 'Is centrifugal force real?',
      a: 'In an inertial frame there is only the inward centripetal force; you feel pushed outward because your body tends to keep going straight. In the rotating frame of the car, it is convenient to describe that as an outward centrifugal force of the same size.',
    },
    {
      q: 'What friction does a car need to take a curve?',
      a: 'At least μ = v² ÷ (rg). At 25 m/s on a 500 m curve that is 0.13, far below dry asphalt, so the turn is easy; OpenStax notes the car makes it if μ exceeds 0.13. At three times the speed it would need 1.15.',
    },
    {
      q: 'Why are curves banked?',
      a: 'Tilting the road lets part of the normal force point toward the centre, supplying the centripetal force without relying on friction. At the design speed, tan θ = v² ÷ (rg), so a 100 m curve banked at 65° suits about 46 m/s.',
    },
  ],
  ogSample: (r, fmt) => `900 kg at 25 m/s, r = 500 m → ${fmt.sig(o(r), 4)} N`,
};
