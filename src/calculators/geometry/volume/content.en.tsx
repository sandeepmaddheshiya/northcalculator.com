import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'volume') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Volume Calculator',
  promise: 'Volume and surface area of a box, cube, cylinder, sphere or cone.',
  title: 'Volume Calculator: Box, Cylinder, Sphere, Cone and Cube',
  description:
    'Find the volume and surface area of a rectangular box, cube, cylinder, sphere or cone from its dimensions, with the formulas and the working shown.',
  summary:
    'Volume measures the space inside a solid, in cubic units; surface area measures the material covering it, in square units. A box’s volume is length times width times height. A cylinder’s is the circular base area times the height, πr²h. A cone holds one third of the cylinder with the same base and height, and a sphere’s volume is four thirds of πr³.',
  synonyms: [
    'volume of a cylinder calculator',
    'volume of a sphere calculator',
    'cubic feet calculator',
    'surface area calculator',
    'volume of a box',
    'cone volume calculator',
  ],
  ui: {
    shape: 'Shape',
    'shape.box': 'Rectangular box',
    'shape.cube': 'Cube',
    'shape.cylinder': 'Cylinder',
    'shape.sphere': 'Sphere',
    'shape.cone': 'Cone',
    'a.box': 'Length',
    'b.box': 'Width',
    'c.box': 'Height',
    'a.cube': 'Side length',
    'a.cylinder': 'Radius',
    'b.cylinder': 'Height',
    'a.sphere': 'Radius',
    'a.cone': 'Radius of the base',
    'b.cone': 'Height',
    // Labels for fields that are hidden for that shape (required by the label lookup).
    'b.cube': 'Second dimension',
    'b.sphere': 'Second dimension',
    'c.cube': 'Third dimension',
    'c.cylinder': 'Third dimension',
    'c.sphere': 'Third dimension',
    'c.cone': 'Third dimension',
    'out.volume': 'Volume (cubic units)',
    'out.surface': 'Surface area (square units)',
    explain: 'The solid holds {v} cubic units and has a surface area of {sa} square units.',
    'step.box': 'V = length × width × height.',
    'step.cube': 'V = side³.',
    'step.cylinder': 'V = π × r² × h.',
    'step.sphere': 'V = 4/3 × π × r³.',
    'step.cone': 'V = 1/3 × π × r² × h.',
    'warn.pi':
      'With π rounded to 3.14, as many textbooks do, the volume would be {v}. This calculator uses the full value of π.',
    rounding: 'Uses the full value of π; results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Volume">
        {
          'box       V = L × W × H\ncube      V = s³\ncylinder  V = π r² h\nsphere    V = 4/3 π r³\ncone      V = 1/3 π r² h'
        }
      </Formula>
      <Formula label="Surface area">
        {
          'box       S = 2LW + 2LH + 2WH\ncube      S = 6s²\ncylinder  S = 2πr² + 2πrh\nsphere    S = 4πr²\ncone      S = πr² + πr√(r² + h²)'
        }
      </Formula>
      <p>
        These are the formulas in OpenStax <em>Prealgebra</em> section 9.6 and its formula appendix.
        The book works its examples with π ≈ 3.14, so its sphere of radius 6 in holds about 904.32
        in³; with the full value of π it is 904.78 in³.
      </p>
    </>
  ),
  examples: [
    {
      id: 'box',
      title: 'A box 14 × 9 × 17 cm',
      body: (r, fmt) => (
        <p>
          14 × 9 × 17 = <strong>{fmt.sig(o(r))} cm³</strong>, with a surface area of{' '}
          {fmt.sig(o(r, 'surface'))} cm², OpenStax’s Example 9.47.
        </p>
      ),
    },
    {
      id: 'cylinder',
      title: 'A can with radius 4 cm and height 13 cm',
      body: (r, fmt) => (
        <p>
          π × 4² × 13 = <strong>{fmt.sig(o(r), 6)} cm³</strong>, about 653 mL. Example 9.54 gives
          653.12 cm³ with π ≈ 3.14.
        </p>
      ),
    },
    {
      id: 'sphere',
      title: 'A ball with radius 6 in',
      body: (r, fmt) => (
        <p>
          4/3 × π × 6³ = <strong>{fmt.sig(o(r), 6)} in³</strong>; the surface area is{' '}
          {fmt.sig(o(r, 'surface'), 6)} in². Example 9.51 reports 904.32 and 452.16 using 3.14.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Litres from cubic centimetres:</strong> 1,000 cm³ is 1 litre, and 1 m³ is 1,000
        litres. The volume converter handles other units.
      </li>
      <li>
        <strong>Inside dimensions</strong> give capacity; outside dimensions give the space an
        object takes up. Wall thickness makes the difference.
      </li>
      <li>
        <strong>Radius, not diameter.</strong> Halve the diameter before using these formulas.
      </li>
      <li>
        <strong>Concrete and soil</strong> are ordered by volume; add a margin for waste and uneven
        ground.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the volume of a cylinder?',
      a: 'Multiply the area of the circular base, π times the radius squared, by the height. A tank with a 0.5 m radius and 2 m height holds π × 0.25 × 2 ≈ 1.571 m³, or about 1,571 litres.',
    },
    {
      q: 'How do I find the volume of a box?',
      a: 'Multiply length, width and height, all in the same unit. A box 40 cm × 30 cm × 25 cm holds 30,000 cm³, which is 30 litres. In feet, a 10 × 12 × 8 ft room has 960 cubic feet.',
    },
    {
      q: 'Why is a cone one third of a cylinder?',
      a: 'A cone with the same base and height as a cylinder holds exactly one third as much, which calculus confirms. So V = 1/3 × π r² h. A cone with radius 2 and height 6 holds 8π ≈ 25.13 cubic units.',
    },
    {
      q: 'What is the difference between volume and surface area?',
      a: 'Volume is the space inside a solid, in cubic units such as cm³. Surface area is the total area of its outside, in square units such as cm². You need volume for capacity and surface area for paint, wrapping or material.',
    },
  ],
  ogSample: (r, fmt) => `V = ${fmt.sig(o(r))}`,
};
