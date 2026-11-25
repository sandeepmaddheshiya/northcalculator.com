import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'total') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Surface Area Calculator',
  promise: 'Total and side surface area of a box, cube, cylinder or sphere.',
  title: 'Surface Area Calculator: Box, Cube, Cylinder and Sphere',
  description:
    'Calculate the surface area of a box, cube, cylinder or sphere, with the side and base areas, the volume and the textbook answer using π ≈ 3.14.',
  summary:
    'Surface area is the total area of all the faces or the curved skin of a solid, the amount of wrapping, paint or material it takes to cover it. A box has six rectangular faces in three matching pairs; a cylinder has two circles and a curved side that unrolls into a rectangle; a sphere’s area is 4πr², four times the area of its largest circle.',
  synonyms: [
    'surface area of a cylinder',
    'surface area of a rectangular prism',
    'surface area of a sphere',
    'surface area of a cube',
    'lateral area calculator',
    'how much paint to cover a box',
  ],
  ui: {
    shape: 'Shape',
    'shape.box': 'Rectangular box (prism)',
    'shape.cube': 'Cube',
    'shape.cylinder': 'Cylinder',
    'shape.sphere': 'Sphere',
    length: 'Length',
    width: 'Width',
    height: 'Height',
    side: 'Side',
    radius: 'Radius',
    'out.total': 'Total surface area (square units)',
    'out.lateral': 'Side (lateral) area',
    'out.base': 'Area of one base',
    'out.volume': 'Volume (cubic units)',
    explain: 'The total surface area is {a} square units.',
    'step.box': 'S = 2LW + 2LH + 2WH.',
    'step.cube': 'S = 6s².',
    'step.cylinder': 'S = 2πr² + 2πrh: two circles plus the curved side.',
    'step.sphere': 'S = 4πr².',
    'warn.pi': 'With π rounded to 3.14, as many textbooks do, the surface area would be {a}.',
    rounding: 'Uses the full value of π. Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Flat faces">{'box: S = 2LW + 2LH + 2WH\ncube: S = 6s²'}</Formula>
      <Formula label="Round solids">{'cylinder: S = 2πr² + 2πrh\nsphere: S = 4πr²'}</Formula>
      <p>
        The cylinder’s curved side unrolls into a rectangle as tall as the cylinder and as wide as
        its circumference, 2πr. OpenStax <em>Prealgebra</em> uses π ≈ 3.14, so for round shapes the
        calculator also shows the answer with 3.14 to match a homework key.
      </p>
    </>
  ),
  examples: [
    {
      id: 'box',
      title: 'A box 14 × 9 × 17 cm',
      body: (r, fmt) => (
        <p>
          S = 2(14 × 9) + 2(14 × 17) + 2(9 × 17) = <strong>{fmt.sig(o(r), 6)} cm²</strong>, as in
          OpenStax <em>Prealgebra</em> Example 9.47.
        </p>
      ),
    },
    {
      id: 'sphere',
      title: 'A sphere of radius 6 in',
      body: (r, fmt) => (
        <p>
          S = 4π × 6² = <strong>{fmt.sig(o(r), 6)} in²</strong>. Example 9.51 uses π ≈ 3.14 and gets
          452.16 in².
        </p>
      ),
    },
    {
      id: 'can',
      title: 'A soda can, radius 4 cm and height 13 cm',
      body: (r, fmt) => (
        <p>
          S = 2π × 4² + 2π × 4 × 13 = <strong>{fmt.sig(o(r), 6)} cm²</strong>; Example 9.54 gets
          427.04 cm² with 3.14.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Open containers:</strong> for a box or tank without a lid, subtract one base area
        from the total.
      </li>
      <li>
        <strong>Painting a room:</strong> the lateral area of a box is the area of the four walls.
      </li>
      <li>
        <strong>Same units:</strong> measure every dimension in the same unit; the area comes out in
        that unit squared.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the surface area of a cylinder?',
      a: 'Add the two circular ends, 2πr², to the curved side, 2πrh. A cylinder with radius 5 in and height 12 in has 2π × 25 + 2π × 5 × 12 = 170π ≈ 534.07 in², the 534 in² of OpenStax Contemporary Mathematics Example 10.60.',
    },
    {
      q: 'How do I find the surface area of a rectangular box?',
      a: 'Find the area of the three different faces and double each: S = 2LW + 2LH + 2WH. A box 10 × 5 × 3 cm has 2(50) + 2(15) + 2(30) = 190 cm². Check that you have counted all six faces.',
    },
    {
      q: 'What is the surface area of a sphere?',
      a: 'S = 4πr², exactly four times the area of a circle with the same radius. A ball of radius 10 cm has a surface area of about 1,256.6 cm². Doubling the radius makes the surface area four times larger.',
    },
    {
      q: 'What is the difference between surface area and volume?',
      a: 'Surface area measures the outside, in square units: how much wrapping or paint is needed. Volume measures the space inside, in cubic units: how much it holds. A cube with 2 cm sides has 24 cm² of surface but holds 8 cm³.',
    },
  ],
  ogSample: (r, fmt) => `Box 14 × 9 × 17 → ${fmt.sig(o(r), 6)} square units`,
};
