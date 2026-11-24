import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'area') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Circle Calculator',
  promise: 'Radius, diameter, circumference and area of a circle from any one of them.',
  title: 'Circle Calculator: Area, Circumference, Radius and Diameter',
  description:
    'Enter a circle’s radius, diameter, circumference or area to get the other three, with the formulas and a comparison with textbook answers using π ≈ 3.14.',
  summary:
    'Every circle is fixed by one measurement. The diameter is twice the radius, the circumference is π times the diameter, and the area is π times the radius squared. Working backwards, the radius is the circumference divided by 2π, or the square root of the area divided by π. π is about 3.14159, and many textbooks round it to 3.14.',
  synonyms: [
    'circumference calculator',
    'area of a circle calculator',
    'radius calculator',
    'diameter calculator',
    'circle formula',
    'find radius from circumference',
  ],
  ui: {
    known: 'I know the',
    'known.r': 'Radius',
    'known.d': 'Diameter',
    'known.c': 'Circumference',
    'known.a': 'Area',
    'value.r': 'Radius',
    'value.d': 'Diameter',
    'value.c': 'Circumference',
    'value.a': 'Area (square units)',
    'out.area': 'Area (square units)',
    'out.radius': 'Radius',
    'out.diameter': 'Diameter',
    'out.circumference': 'Circumference',
    explain: 'A circle of radius {r} has an area of {a} and a circumference of {c}.',
    'step.r.d': 'Radius = diameter ÷ 2.',
    'step.r.c': 'Radius = circumference ÷ 2π.',
    'step.r.a': 'Radius = √(area ÷ π).',
    'step.c': 'Circumference = 2πr.',
    'step.a': 'Area = πr².',
    'warn.pi':
      'With π rounded to 3.14, as many textbooks do, the area would be {a} and the circumference {c}.',
    rounding: 'Uses the full value of π; results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Circle formulas">{'d = 2r\nC = 2πr = πd\nA = πr²'}</Formula>
      <Formula label="Working backwards">{'r = d ÷ 2\nr = C ÷ (2π)\nr = √(A ÷ π)'}</Formula>
      <p>
        π is the ratio of any circle’s circumference to its diameter, 3.14159265…. OpenStax{' '}
        <em>Prealgebra</em> uses 3.14 in its examples, so its circle of radius 2.5 ft has a
        circumference of about 15.7 ft and an area of about 19.625 ft². With the full value of π the
        area is 19.635 ft²; the calculator shows both.
      </p>
    </>
  ),
  examples: [
    {
      id: 'radius',
      title: 'A circle with radius 2.5 ft',
      body: (r, fmt) => (
        <p>
          C = 2π × 2.5 = {fmt.sig(o(r, 'circumference'), 6)} ft and A = π × 2.5² ={' '}
          <strong>{fmt.sig(o(r), 6)} ft²</strong>. OpenStax’s Example 9.41 gets 15.7 ft and 19.625
          ft² with π ≈ 3.14.
        </p>
      ),
    },
    {
      id: 'table',
      title: 'A round table 4 ft across',
      body: (r, fmt) => (
        <p>
          With a diameter of 4 ft, the circumference is π × 4 ={' '}
          <strong>{fmt.sig(o(r, 'circumference'), 6)} ft</strong>, the length of trim needed for the
          edge. Example 9.42 gives 12.56 ft using 3.14.
        </p>
      ),
    },
    {
      id: 'fromC',
      title: 'Diameter from a 47.1 cm circumference',
      body: (r, fmt) => (
        <p>
          d = C ÷ π = 47.1 ÷ π = <strong>{fmt.sig(o(r, 'diameter'), 6)} cm</strong>. Example 9.43
          divides by 3.14 instead and gets exactly 15 cm, because the book chose 47.1 = 15 × 3.14.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Measure the diameter across the widest point</strong>, through the centre. A
        measurement off-centre is a chord and is shorter.
      </li>
      <li>
        <strong>Finding the circumference of a pipe or tree?</strong> Wrap a tape around it and
        enter that length to get the diameter.
      </li>
      <li>
        <strong>Area grows with the square.</strong> Doubling the radius makes the area four times
        larger: a 16 inch pizza has four times the area of an 8 inch one.
      </li>
      <li>
        <strong>For homework,</strong> check whether your course wants π or 3.14, and round the way
        the question asks.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the circumference of a circle?',
      a: 'Multiply the diameter by π, or twice the radius by π. A circle with a 10 cm diameter has a circumference of about 31.42 cm. Using π ≈ 3.14 gives 31.4 cm, which is close enough for most everyday measuring.',
    },
    {
      q: 'How do I find the radius from the circumference?',
      a: 'Divide the circumference by 2π, about 6.2832. A tree trunk with a 150 cm circumference has a radius of about 23.87 cm and a diameter of about 47.75 cm, measured straight through the centre.',
    },
    {
      q: 'How do I find the radius from the area?',
      a: 'Divide the area by π and take the square root. A circle with an area of 100 m² has a radius of √(100 ÷ π) ≈ 5.64 m. Check it by squaring the radius and multiplying by π: π × 5.64² is about 100.',
    },
    {
      q: 'What is π?',
      a: 'π is the ratio of a circle’s circumference to its diameter, the same for every circle. It is an irrational number, 3.14159265…, whose decimals never end or repeat. Fractions like 22/7 and decimals like 3.14 are approximations.',
    },
  ],
  ogSample: (r, fmt) => `r = 2.5 → A = ${fmt.sig(o(r), 6)}`,
};
