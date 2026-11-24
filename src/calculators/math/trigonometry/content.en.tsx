import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'sin') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Trigonometry Calculator',
  promise: 'sin, cos, tan, csc, sec and cot of any angle, with exact values where they exist.',
  title: 'Trig Calculator: sin, cos and tan of Any Angle, Exact Values',
  description:
    'Find sine, cosine, tangent, cosecant, secant and cotangent of an angle in degrees or radians, with exact radical values for multiples of 15° and the conversion.',
  summary:
    'Sine and cosine are the y and x coordinates of a point on the unit circle at the given angle; tangent is sine divided by cosine. The reciprocals are cosecant, secant and cotangent. For multiples of 15°, such as 30°, 45° and 150°, the values have exact forms with square roots, which the calculator shows alongside the decimals.',
  synonyms: [
    'sin cos tan calculator',
    'unit circle calculator',
    'exact trig values',
    'degrees to radians',
    'sine calculator',
    'cosine calculator',
  ],
  ui: {
    angle: 'Angle',
    'angle.deg': 'Angle (degrees)',
    'angle.rad': 'Angle (radians)',
    unit: 'Unit',
    'unit.deg': 'Degrees',
    'unit.rad': 'Radians',
    'out.sin': 'sin',
    'out.cos': 'cos',
    'out.tan': 'tan',
    'out.csc': 'csc (1/sin)',
    'out.sec': 'sec (1/cos)',
    'out.cot': 'cot (1/tan)',
    'out.converted': 'In radians',
    'out.converted.deg': 'In radians',
    'out.converted.rad': 'In degrees',
    'out.reference': 'Reference angle (°)',
    undefined: 'Undefined',
    explain: 'The angle is {deg}°, with a reference angle of {ref}°.',
    'step.toRad': 'Radians = degrees × π ÷ 180.',
    'step.toDeg': 'Degrees = radians × 180 ÷ π.',
    'step.ref':
      'Reduce to 0–360° and find the reference angle to the x-axis; the quadrant sets the signs.',
    rounding:
      'Decimals are shown to 9 significant digits. Exact forms are given for multiples of 15°, from the NIST DLMF table.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Definitions">
        {'tan θ = sin θ ÷ cos θ\ncsc θ = 1 ÷ sin θ, sec θ = 1 ÷ cos θ, cot θ = 1 ÷ tan θ'}
      </Formula>
      <Formula label="Degrees and radians">{'radians = degrees × π ÷ 180\n180° = π rad'}</Formula>
      <p>
        On the unit circle, the point at angle θ is (cos θ, sin θ). The reference angle is the acute
        angle to the x-axis; its values are the same up to sign, and the quadrant decides the sign:
        sine is positive above the x-axis and cosine to the right of the y-axis. Where cos θ = 0,
        tangent and secant are undefined.
      </p>
    </>
  ),
  examples: [
    {
      id: 'obtuse',
      title: 'sin and cos of 150°',
      body: (r) => (
        <p>
          The reference angle is 30°, and 150° is in the second quadrant, so sin 150° ={' '}
          <strong>{o(r)}</strong> and cos 150° = {o(r, 'cos')}, as in OpenStax{' '}
          <em>Algebra and Trigonometry</em> §7.3 Example 6.
        </p>
      ),
    },
    {
      id: 'fifteen',
      title: 'tan 15°',
      body: (r) => (
        <p>
          tan 15° = <strong>{o(r, 'tan')}</strong> (NIST DLMF Table 4.17.1), and 15° ={' '}
          {o(r, 'converted')}.
        </p>
      ),
    },
    {
      id: 'radians',
      title: '3 radians in degrees',
      body: (r) => (
        <p>
          3 × 180 ÷ π = <strong>{o(r, 'converted')}</strong>, which §7.1 Example 3 rounds to about
          172°; sin 3 = {o(r)}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the mode.</strong> sin 30 is 0.5 in degrees but −0.988 in radians; most wrong
        answers come from the wrong unit.
      </li>
      <li>
        <strong>Remember ASTC:</strong> all functions are positive in the first quadrant, sine in
        the second, tangent in the third and cosine in the fourth.
      </li>
      <li>
        <strong>Undefined is not an error:</strong> tan 90° has no value because the line from the
        origin is vertical.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What are sin, cos and tan?',
      a: 'In a right triangle, sine is opposite over hypotenuse, cosine is adjacent over hypotenuse and tangent is opposite over adjacent. On the unit circle they extend to any angle: cos θ and sin θ are the x and y coordinates of the point at angle θ.',
    },
    {
      q: 'How do I convert degrees to radians?',
      a: 'Multiply by π and divide by 180. 90° is π/2 ≈ 1.5708 radians and 45° is π/4 ≈ 0.7854. To go back, multiply radians by 180 and divide by π: 1 radian is about 57.2958°.',
    },
    {
      q: 'What are the exact values of sin 30°, 45° and 60°?',
      a: 'sin 30° = 1/2, sin 45° = √2/2 and sin 60° = √3/2. Cosine runs the other way: cos 30° = √3/2, cos 45° = √2/2 and cos 60° = 1/2. Tangents are √3/3, 1 and √3.',
    },
    {
      q: 'Why is tan 90° undefined?',
      a: 'tan θ = sin θ ÷ cos θ, and cos 90° = 0, so the division has no value. The same happens at 270° and every 180° from there. Secant is undefined at the same angles, and cosecant and cotangent wherever sin θ = 0.',
    },
  ],
  ogSample: (r) => `sin 150° = ${o(r)}`,
};
