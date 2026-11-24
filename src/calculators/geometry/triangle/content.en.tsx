import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'area') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Triangle Calculator',
  promise: 'Area, angles and perimeter of any triangle from its three sides.',
  title: 'Triangle Calculator: Area and Angles from Three Sides (SSS)',
  description:
    'Enter the three side lengths of a triangle to get its area by Heron’s formula, all three angles by the law of cosines, the perimeter and the triangle type.',
  summary:
    'Three sides fix a triangle completely. Heron’s formula gives the area from the sides alone: with s as half the perimeter, the area is the square root of s(s − a)(s − b)(s − c). The law of cosines then gives each angle, and the three angles add up to 180°. The sides must satisfy the triangle inequality.',
  synonyms: [
    'Heron’s formula calculator',
    'SSS triangle calculator',
    'triangle area from 3 sides',
    'law of cosines calculator',
    'triangle angle calculator',
    'scalene triangle calculator',
  ],
  ui: {
    a: 'Side a',
    b: 'Side b',
    c: 'Side c',
    'out.area': 'Area (square units)',
    'out.perimeter': 'Perimeter',
    'out.angleA': 'Angle A, opposite a (°)',
    'out.angleB': 'Angle B, opposite b (°)',
    'out.angleC': 'Angle C, opposite c (°)',
    'out.kind': 'Type',
    'kind.equilateral': 'Equilateral',
    'kind.isosceles': 'Isosceles',
    'kind.scalene': 'Scalene',
    'kind.right': 'right',
    'kind.acute': 'acute',
    'kind.obtuse': 'obtuse',
    explain: 'This {kind} triangle has an area of {area} square units.',
    'step.s': 's is half the perimeter.',
    'step.heron': 'Heron’s formula: area = √(s(s − a)(s − b)(s − c)).',
    'step.angle': 'Law of cosines for the angle opposite side a.',
    'step.sum': 'The three angles add up to 180°.',
    'warn.zero': 'All three sides must be greater than zero.',
    'warn.inequality':
      'These sides cannot make a triangle: the two shorter sides must add up to more than the longest.',
    rounding:
      'Uses a rearranged Heron’s formula that stays accurate for long, thin triangles. Results keep 12 significant digits; angles are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Heron’s formula">
        {'s = (a + b + c) ÷ 2\nArea = √(s(s − a)(s − b)(s − c))'}
      </Formula>
      <Formula label="Law of cosines">{'cos A = (b² + c² − a²) ÷ 2bc\nA + B + C = 180°'}</Formula>
      <p>
        For very thin triangles, s − a can lose most of its digits to rounding, so the calculator
        sorts the sides so a ≥ b ≥ c and uses the equivalent form ¼√((a + (b + c))(c − (a − b))(c +
        (a − b))(a + (b − c))), as Corral’s <em>Elementary Trigonometry</em> recommends.
      </p>
    </>
  ),
  examples: [
    {
      id: 'heron',
      title: 'Sides 10, 15 and 7',
      body: (r, fmt) => (
        <p>
          s = 16, so the area is √(16 × 6 × 1 × 9) = √864 = <strong>{fmt.sig(o(r), 6)}</strong>,
          which OpenStax <em>Algebra and Trigonometry</em> Example 5 rounds to 29.4.
        </p>
      ),
    },
    {
      id: 'corral',
      title: 'Sides 5, 4 and 7',
      body: (r, fmt) => (
        <p>
          s = 8 and the area is √96 = 4√6 = <strong>{fmt.sig(o(r), 6)}</strong>, matching Corral’s
          Example 2.15 (≈ 9.8).
        </p>
      ),
    },
    {
      id: 'angle',
      title: 'The angle opposite 20 in a 20, 25, 18 triangle',
      body: (r, fmt) => (
        <p>
          cos A = (25² + 18² − 20²) ÷ (2 × 25 × 18) = 549 ÷ 900, so A ={' '}
          <strong>{fmt.sig(o(r, 'angleA'), 6)}°</strong>; OpenStax Example 2 gives 52.4°.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use the same unit for every side.</strong> The area comes out in that unit squared.
      </li>
      <li>
        <strong>The longest side faces the largest angle.</strong> If its square is more than the
        other two squares added, the triangle is obtuse; if equal, it is right-angled.
      </li>
      <li>
        <strong>Land and plots:</strong> measuring the three sides of a triangular plot is enough to
        find its area, as in OpenStax’s Chicago lot of 62.4, 43.5 and 34.1 m (about 711.4 m²).
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the area of a triangle with three sides?',
      a: 'Use Heron’s formula. Add the sides and halve the total to get s, then take the square root of s × (s − a) × (s − b) × (s − c). A 3, 4, 5 triangle has s = 6 and area √(6 × 3 × 2 × 1) = 6.',
    },
    {
      q: 'How do I find the angles of a triangle from its sides?',
      a: 'Use the law of cosines: cos A = (b² + c² − a²) ÷ 2bc, then take the inverse cosine. Repeat for a second angle, and subtract both from 180° for the third. A 3, 4, 5 triangle has angles of about 36.87°, 53.13° and 90°.',
    },
    {
      q: 'What is the triangle inequality?',
      a: 'Any two sides of a triangle must add up to more than the third. Sides of 2, 3 and 6 cannot form a triangle, because 2 + 3 is less than 6. If the two shorter sides add up exactly to the longest, the triangle collapses into a straight line with zero area.',
    },
    {
      q: 'What are scalene, isosceles and equilateral triangles?',
      a: 'A scalene triangle has three different sides, an isosceles triangle has at least two equal sides, and an equilateral triangle has all three equal, with every angle 60°. Triangles are also acute, right or obtuse by their largest angle.',
    },
  ],
  ogSample: (r, fmt) => `10, 15, 7 → area ${fmt.sig(o(r), 6)}`,
};
