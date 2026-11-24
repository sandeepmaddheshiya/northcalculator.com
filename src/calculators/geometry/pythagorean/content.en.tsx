import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Pythagorean Theorem Calculator',
  promise: 'The missing side of a right triangle from the other two sides.',
  title: 'Pythagorean Theorem Calculator: Hypotenuse or Missing Leg',
  description:
    'Find the hypotenuse or a missing leg of a right triangle with the Pythagorean theorem, a² + b² = c², plus its area, perimeter and the angle opposite a leg.',
  summary:
    'In a right triangle, the square of the hypotenuse, the side opposite the right angle, equals the sum of the squares of the other two sides: a² + b² = c². So the hypotenuse is the square root of a² + b², and a missing leg is the square root of c² minus the known leg squared. Legs of 3 and 4 give a hypotenuse of exactly 5.',
  synonyms: [
    'hypotenuse calculator',
    'right triangle calculator',
    'a2 b2 c2 calculator',
    'missing side calculator',
    'Pythagoras calculator',
    'find the hypotenuse',
  ],
  ui: {
    find: 'Find the',
    'find.c': 'Hypotenuse (c)',
    'find.leg': 'Missing leg',
    a: 'Leg a',
    'b.c': 'Leg b',
    'b.leg': 'Hypotenuse c',
    'out.result.c': 'Hypotenuse c',
    'out.result.leg': 'Missing leg b',
    'out.area': 'Area (½ × a × b)',
    'out.perimeter': 'Perimeter',
    'out.angleA': 'Angle opposite leg a (degrees)',
    'explain.c': 'The hypotenuse is {r}.',
    'explain.leg': 'The missing leg is {r}.',
    'step.c': 'c = √(a² + b²).',
    'step.leg': 'b = √(c² − a²).',
    'warn.hyp':
      'The hypotenuse must be longer than the leg, because it is the longest side of a right triangle.',
    rounding: 'Results keep 12 significant digits and are shown to 10; angles to 4 decimal places.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Pythagorean theorem">
        {'a² + b² = c²\nc = √(a² + b²)\nb = √(c² − a²)'}
      </Formula>
      <p>
        The theorem holds only for right triangles, where c is the side opposite the 90° angle and
        always the longest side. OpenStax <em>Prealgebra</em> works the classic 3–4–5 triangle: 3² +
        4² = 9 + 16 = 25, and √25 = 5.
      </p>
      <p>
        The calculator also gives the area, half the product of the two legs because they are
        perpendicular, and the angle opposite leg a, which is atan(a ÷ b).
      </p>
    </>
  ),
  examples: [
    {
      id: 'hyp',
      title: 'Legs of 3 and 4',
      body: (r, fmt) => (
        <p>
          √(3² + 4²) = √25 = <strong>{fmt.sig(o(r))}</strong>, OpenStax’s Example 9.22. The area is
          ½ × 3 × 4 = {fmt.sig(o(r, 'area'))}.
        </p>
      ),
    },
    {
      id: 'leg',
      title: 'A leg of 5 and a hypotenuse of 13',
      body: (r, fmt) => (
        <p>
          √(13² − 5²) = √144 = <strong>{fmt.sig(o(r))}</strong>, as in Example 9.23. 5–12–13 is
          another right triangle with whole-number sides.
        </p>
      ),
    },
    {
      id: 'bracket',
      title: 'A 10 in brace with equal legs',
      body: (r, fmt) => (
        <p>
          If both legs are x, then x² + x² = 10², so x = √50 ≈ 7.071 in. Checking with that leg and
          a 10 in hypotenuse returns the other leg, <strong>{fmt.sig(o(r), 6)} in</strong>, which
          OpenStax’s Example 9.24 rounds to 7.1 in.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Only for right angles.</strong> For other triangles, use the law of cosines.
      </li>
      <li>
        <strong>Check square corners:</strong> builders mark 3 units on one side and 4 on the other;
        if the diagonal is 5, the corner is square. Multiples like 6–8–10 work too.
      </li>
      <li>
        <strong>Ladders and ramps:</strong> the ladder is the hypotenuse, the height on the wall and
        the distance from the wall are the legs.
      </li>
      <li>
        <strong>Distance on a grid</strong> between two points is the hypotenuse of a triangle with
        legs equal to the differences in x and y.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the hypotenuse?',
      a: 'Square both legs, add them and take the square root. For legs of 6 and 8: 36 + 64 = 100, and √100 = 10. The hypotenuse is always the longest side and is opposite the right angle.',
    },
    {
      q: 'How do I find a missing leg?',
      a: 'Square the hypotenuse, subtract the square of the known leg and take the square root. With a hypotenuse of 17 and a leg of 8: 289 − 64 = 225, so the other leg is 15.',
    },
    {
      q: 'Does the Pythagorean theorem work for any triangle?',
      a: 'No, only for right triangles. If a² + b² is greater than c², the angle opposite c is acute; if it is smaller, the angle is obtuse. That comparison is also a quick test of whether a triangle is right-angled.',
    },
    {
      q: 'How long a ladder do I need to reach 4 m up a wall?',
      a: 'If the foot of the ladder stands 1 m from the wall, the ladder is the hypotenuse: √(4² + 1²) = √17 ≈ 4.12 m. Follow the ladder maker’s guidance on angle and safe use as well.',
    },
  ],
  ogSample: (r, fmt) => `3² + 4² = ${fmt.sig(o(r))}²`,
};
