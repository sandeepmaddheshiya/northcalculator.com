import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'area') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Area Calculator',
  promise: 'Area of a rectangle, triangle, trapezoid, circle or parallelogram, with the formula.',
  title: 'Area Calculator: Rectangle, Triangle, Circle and Trapezoid',
  description:
    'Find the area of a rectangle, triangle, trapezoid, circle or parallelogram from its dimensions, with the formula and working, plus the perimeter.',
  summary:
    'Area is the amount of surface a flat shape covers, measured in square units. A rectangle’s area is length times width, a triangle’s is half the base times the height, and a trapezoid’s is half the height times the sum of the two parallel sides. A circle’s area is π times the radius squared. Use the same unit for every measurement.',
  synonyms: [
    'area of a shape calculator',
    'area of a triangle calculator',
    'area of a circle calculator',
    'rectangle area calculator',
    'trapezoid area calculator',
    'square footage calculator',
  ],
  ui: {
    shape: 'Shape',
    'shape.rectangle': 'Rectangle (or square)',
    'shape.triangle': 'Triangle',
    'shape.trapezoid': 'Trapezoid',
    'shape.circle': 'Circle',
    'shape.parallelogram': 'Parallelogram',
    'a.rectangle': 'Length',
    'b.rectangle': 'Width',
    'a.triangle': 'Base',
    'b.triangle': 'Height (perpendicular to the base)',
    'a.trapezoid': 'Height',
    'b.trapezoid': 'Shorter parallel side (b)',
    'c.trapezoid': 'Longer parallel side (B)',
    'a.circle': 'Radius',
    'a.parallelogram': 'Base',
    'b.parallelogram': 'Height (perpendicular to the base)',
    // Labels for fields that are hidden for that shape (required by the label lookup).
    'b.circle': 'Second dimension',
    'c.rectangle': 'Third dimension',
    'c.triangle': 'Third dimension',
    'c.circle': 'Third dimension',
    'c.parallelogram': 'Third dimension',
    'out.area': 'Area (square units)',
    'out.perimeter': 'Perimeter (units)',
    'explain.rectangle': 'The rectangle covers {area} square units.',
    'explain.triangle': 'The triangle covers {area} square units.',
    'explain.trapezoid': 'The trapezoid covers {area} square units.',
    'explain.circle': 'The circle covers {area} square units.',
    'explain.parallelogram': 'The parallelogram covers {area} square units.',
    'step.rectangle': 'Area = length × width.',
    'step.triangle': 'Area = ½ × base × height.',
    'step.trapezoid': 'Area = ½ × height × (b + B).',
    'step.circle': 'Area = π × radius².',
    'step.parallelogram': 'Area = base × height.',
    'warn.pi':
      'Textbooks often use π ≈ 3.14, which gives {book}. This calculator uses the full value of π.',
    rounding: 'Uses the full value of π; results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Area formulas">
        {
          'rectangle      A = L × W\ntriangle       A = ½ × b × h\ntrapezoid      A = ½ × h × (b + B)\nparallelogram  A = b × h\ncircle         A = π × r²'
        }
      </Formula>
      <p>
        These are the formulas in OpenStax <em>Prealgebra</em>, chapter 9. The height of a triangle,
        trapezoid or parallelogram is the perpendicular distance, not the length of a slanted side.
        The answer is in the square of the unit you used: metres in, square metres out.
      </p>
      <p>
        The textbook rounds π to 3.14. This calculator uses the full value, so circle results differ
        slightly from printed answers: a circle of radius 2.5 is 19.635 here and 19.625 with 3.14.
      </p>
    </>
  ),
  examples: [
    {
      id: 'rectangle',
      title: 'A 32 m by 20 m rectangle',
      body: (r, fmt) => (
        <p>
          32 × 20 = <strong>{fmt.sig(o(r))} m²</strong>, and the perimeter is 2 × 32 + 2 × 20 ={' '}
          {fmt.sig(o(r, 'perimeter'))} m, as in OpenStax’s Example 9.27.
        </p>
      ),
    },
    {
      id: 'triangle',
      title: 'A triangle with base 11 in and height 8 in',
      body: (r, fmt) => (
        <p>
          ½ × 11 × 8 = <strong>{fmt.sig(o(r))} in²</strong> (Example 9.33). A triangle is half of a
          rectangle with the same base and height.
        </p>
      ),
    },
    {
      id: 'trapezoid',
      title: 'A trapezoid 6 in high with sides of 11 and 14 in',
      body: (r, fmt) => (
        <p>
          ½ × 6 × (11 + 14) = <strong>{fmt.sig(o(r))} in²</strong>, OpenStax’s Example 9.38. The
          average of the parallel sides, 12.5, times the height gives the same answer.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Irregular rooms:</strong> split the floor into rectangles and triangles, find each
        area and add them.
      </li>
      <li>
        <strong>Convert before or after, not both.</strong> Measure everything in one unit, then use
        the area converter if you need square feet or square metres.
      </li>
      <li>
        <strong>Diameter or radius?</strong> The radius is half the diameter. Using the diameter in
        πr² gives four times the true area.
      </li>
      <li>
        <strong>Buying materials</strong> such as flooring or turf, add some extra for cutting and
        waste.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the area of a rectangle?',
      a: 'Multiply the length by the width. A room 4.5 m long and 3.2 m wide has an area of 14.4 m². For a square, length and width are equal, so the area is the side squared: a 6 ft square is 36 ft².',
    },
    {
      q: 'How do I find the area of a triangle?',
      a: 'Multiply the base by the perpendicular height and halve the result. A triangle with a 10 cm base and 7 cm height has an area of 35 cm². Any side can be the base, as long as the height is measured at right angles to it.',
    },
    {
      q: 'How do I find the area of a circle?',
      a: 'Square the radius and multiply by π, about 3.14159. A circle with radius 3 m has an area of about 28.27 m². If you know the diameter, halve it first: a 10 inch pizza has a 5 inch radius and an area of about 78.54 in².',
    },
    {
      q: 'What units is area measured in?',
      a: 'Square units: square metres, square feet, square inches and so on. If the sides are in feet, the area is in square feet. Mixing units, such as feet and inches, gives a wrong answer unless you convert first.',
    },
  ],
  ogSample: (r, fmt) => `Area = ${fmt.sig(o(r))}`,
};
