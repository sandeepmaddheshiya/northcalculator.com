import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Area Converter',
  promise: 'Convert square feet, square metres, acres, hectares and square miles exactly.',
  title: 'Area Converter: Square Feet to m², Acres to Hectares',
  description:
    'Convert area between square inches, feet, yards and miles, acres, square millimetres, centimetres, metres and kilometres, and hectares, with exact factors.',
  summary:
    'An area unit is a length unit squared, so its factor is the length factor squared. A foot is 0.3048 m, so a square foot is 0.3048² = 0.09290304 m², exactly. An acre is 4,840 square yards, which is 4,046.8564224 m², and a hectare is 10,000 m², about 2.471 acres.',
  synonyms: [
    'square feet to square meters',
    'sq ft to m2',
    'acres to hectares',
    'hectares to acres',
    'square meters to square feet',
    'land area converter',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Squared length factors">
        {
          '1 ft² = (0.3048 m)² = 0.092 903 04 m²\n1 yd² = (0.9144 m)² = 0.836 127 36 m²\n1 acre = 4,840 yd² = 4,046.856 422 4 m²\n1 ha = 100 m × 100 m = 10,000 m²'
        }
      </Formula>
      <p>
        Squaring is the step people most often miss. A metre is about 3.28 feet, but a square metre
        is about 10.76 square feet, because both sides of the square are converted.
      </p>
      <p>
        The calculator converts to square metres, the SI unit of area, and then to the target unit,
        using the exact international foot and yard from NIST Handbook 44.
      </p>
    </>
  ),
  examples: [
    {
      id: 'acre',
      title: 'One acre in square metres',
      body: (r, fmt) => (
        <p>
          4,840 square yards × 0.83612736 m² = <strong>{fmt.sig(o(r))} m²</strong>, about 40% of a
          hectare. A square acre would measure about 63.6 m on each side.
        </p>
      ),
    },
    {
      id: 'hectare',
      title: 'One hectare in acres',
      body: (r, fmt) => (
        <p>
          10,000 m² ÷ 4,046.8564224 m² = <strong>{fmt.sig(o(r))} acres</strong>. Farmland and
          property listings switch between the two, so this factor is worth remembering as roughly
          2.47.
        </p>
      ),
    },
    {
      id: 'house',
      title: 'A 1,000 sq ft apartment in square metres',
      body: (r, fmt) => (
        <p>
          1,000 × 0.09290304 = <strong>{fmt.sig(o(r))} m²</strong>. A quick check: divide square
          feet by 10.76 to get square metres.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Measure in one unit, then convert.</strong> For a room 12 ft × 15 ft, multiply first
        (180 ft²), then convert to 16.72 m².
      </li>
      <li>
        <strong>Irregular shapes:</strong> split the area into rectangles and triangles, add their
        areas, then convert the total.
      </li>
      <li>
        <strong>Flooring and paint:</strong> buy a little more than the converted area to allow for
        cuts and waste.
      </li>
      <li>
        <strong>Land records</strong> may use local units (bigha, marla, tsubo). Those vary by
        region, so use the conversion published by the local land authority.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many square feet are in a square metre?',
      a: 'One square metre is 1 ÷ 0.09290304 = 10.7639 square feet. To convert square metres to square feet multiply by about 10.764; to go from square feet to square metres multiply by 0.09290304.',
    },
    {
      q: 'How big is an acre?',
      a: 'An acre is 43,560 square feet, 4,840 square yards or 4,046.86 square metres, a little over 40% of a hectare. A square plot of one acre measures about 63.6 metres, or 208.7 feet, on each side.',
    },
    {
      q: 'How do I convert hectares to acres?',
      a: 'Multiply by 2.47105, since a hectare is 10,000 m² and an acre is 4,046.8564224 m². Ten hectares are 24.71 acres. To convert acres to hectares, multiply by 0.404686, so a 5-acre plot is 2.02 hectares.',
    },
    {
      q: 'Why is a square metre not 3.28 square feet?',
      a: 'Because area is two-dimensional. A metre is 3.28084 feet, so a square metre is 3.28084 × 3.28084 = 10.7639 square feet. Every area factor is the square of the corresponding length factor.',
    },
  ],
  ogSample: (r, fmt) => `1 acre = ${fmt.sig(o(r))} m²`,
};
