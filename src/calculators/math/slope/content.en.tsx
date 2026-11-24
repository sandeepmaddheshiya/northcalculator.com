import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'slope') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Slope Calculator',
  promise: 'Slope, line equation, distance and midpoint between two points.',
  title: 'Slope Calculator: Slope, Distance and Midpoint of Two Points',
  description:
    'Enter two points to get the slope as a fraction and decimal, the equation of the line through them, the distance between them and the midpoint.',
  summary:
    'The slope of a line is rise over run: the change in y divided by the change in x between two points, m = (y₂ − y₁) ÷ (x₂ − x₁). A horizontal line has slope 0 and a vertical line has an undefined slope. The distance between the points comes from the Pythagorean theorem, and the midpoint is the average of the coordinates.',
  synonyms: [
    'rise over run calculator',
    'gradient calculator',
    'distance formula calculator',
    'midpoint calculator',
    'two point form calculator',
    'equation of a line calculator',
  ],
  ui: {
    p1: 'Point 1',
    p2: 'Point 2',
    x1: 'x₁',
    y1: 'y₁',
    x2: 'x₂',
    y2: 'y₂',
    'out.slope': 'Slope (m)',
    'out.equation': 'Equation of the line',
    'out.distance': 'Distance',
    'out.midpoint': 'Midpoint',
    'out.angle': 'Angle with the x-axis (°)',
    undefined: 'Undefined (vertical line)',
    explain: 'The line has slope {m}; the points are {d} apart, with midpoint {mid}.',
    'explain.vertical':
      'The line is vertical, so its slope is undefined; the points are {d} apart.',
    'step.slope': 'Slope = (y₂ − y₁) ÷ (x₂ − x₁).',
    'step.distance': 'Distance = √((x₂ − x₁)² + (y₂ − y₁)²).',
    'step.midpoint': 'Midpoint = average of the x values and of the y values.',
    'warn.same': 'The two points are the same, so they do not define a line.',
    rounding:
      'Decimals are shown to 8 significant digits. With whole-number coordinates the slope is also a reduced fraction and the distance a simplified square root.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Slope">{'m = (y₂ − y₁) ÷ (x₂ − x₁)'}</Formula>
      <Formula label="Distance and midpoint">
        {'d = √((x₂ − x₁)² + (y₂ − y₁)²)\nM = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2)'}
      </Formula>
      <p>
        The equation is written in slope-intercept form, y = mx + b, where b = y₁ − m·x₁ is where
        the line crosses the y-axis. Swapping the two points does not change the slope, the distance
        or the midpoint.
      </p>
    </>
  ),
  examples: [
    {
      id: 'slope',
      title: 'Slope through (−2, −3) and (−7, 4)',
      body: (r) => (
        <p>
          m = (4 − (−3)) ÷ (−7 − (−2)) = 7 ÷ (−5) = <strong>{o(r)}</strong>, as in OpenStax{' '}
          <em>Intermediate Algebra</em> Example 3.14. The line is {o(r, 'equation')}.
        </p>
      ),
    },
    {
      id: 'distance',
      title: 'Distance from (10, −4) to (−1, 5)',
      body: (r) => (
        <p>
          d = √((−11)² + 9²) = √(121 + 81) = <strong>{o(r, 'distance')}</strong>. Example 11.3 gives
          √202 ≈ 14.2.
        </p>
      ),
    },
    {
      id: 'midpoint',
      title: 'Midpoint of (7, −2) and (9, 5)',
      body: (r) => (
        <p>
          ((7 + 9) ÷ 2, (−2 + 5) ÷ 2) = <strong>{o(r, 'midpoint')}</strong>, which OpenStax{' '}
          <em>College Algebra</em> Example 7 writes as (8, 3/2).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Keep the order consistent.</strong> Subtract in the same order on top and bottom:
        (y₂ − y₁) over (x₂ − x₁). Mixing the order flips the sign.
      </li>
      <li>
        <strong>Read the sign.</strong> A positive slope rises from left to right, a negative one
        falls, and a bigger number means steeper.
      </li>
      <li>
        <strong>Grades and pitches:</strong> a road grade of 6% is a slope of 0.06, and a roof pitch
        of 4 in 12 is a slope of 1/3.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the slope between two points?',
      a: 'Subtract the y values and divide by the difference of the x values, in the same order. From (1, 2) to (4, 8), the slope is (8 − 2) ÷ (4 − 1) = 6 ÷ 3 = 2: the line rises 2 units for every 1 unit across.',
    },
    {
      q: 'What does an undefined slope mean?',
      a: 'The two points have the same x value, so the line is vertical and the run is zero. Division by zero is undefined, so the slope is undefined. The line’s equation is x = a constant. A horizontal line, by contrast, has a slope of exactly 0.',
    },
    {
      q: 'How do I find the distance between two points?',
      a: 'Square the difference in x and the difference in y, add them and take the square root. From (6, 4) to (2, 1) the differences are 4 and 3, so the distance is √(16 + 9) = 5, the hypotenuse of a 3, 4, 5 right triangle.',
    },
    {
      q: 'How do I write the equation of a line through two points?',
      a: 'Find the slope m, then the intercept b = y₁ − m·x₁, and write y = mx + b. Through (1, 2) and (4, 8), m = 2 and b = 2 − 2 × 1 = 0, so the line is y = 2x.',
    },
  ],
  ogSample: (r) => `(−2, −3) to (−7, 4) → m = ${o(r)}`,
};
