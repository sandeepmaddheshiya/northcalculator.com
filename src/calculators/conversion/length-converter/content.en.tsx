import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Length Converter',
  promise: 'Convert inches, feet, miles, centimetres, metres and kilometres exactly.',
  title: 'Length Converter: Inches to cm, Feet to Metres, Miles to km',
  description:
    'Convert lengths and distances between inches, feet, yards, miles, nautical miles, millimetres, centimetres, metres and kilometres, using exact definitions.',
  summary:
    'Since 1959 the inch has been defined as exactly 2.54 centimetres, so every US and imperial length converts to metric exactly. A foot is 12 inches (30.48 cm), a yard 3 feet (0.9144 m) and a mile 5,280 feet (1.609344 km). The nautical mile is defined separately as exactly 1,852 metres.',
  synonyms: [
    'inches to cm',
    'cm to inches',
    'feet to meters',
    'meters to feet',
    'miles to km',
    'km to miles',
    'mm to inches',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Exact definitions">
        {
          '1 in = 2.54 cm\n1 ft = 12 in = 30.48 cm\n1 yd = 3 ft = 0.9144 m\n1 mi = 1,760 yd = 1.609344 km\n1 nmi = 1,852 m'
        }
      </Formula>
      <p>
        NIST Handbook 44 lists these as the US customary relationships. Because they are
        definitions, not measurements, the conversions have no error: 100 yards is exactly 91.44
        metres.
      </p>
      <p>
        The calculator converts your value into metres, then into the target unit. To go from feet
        to inches it multiplies by 0.3048 and divides by 0.0254, which gives exactly 12.
      </p>
    </>
  ),
  examples: [
    {
      id: 'inch',
      title: 'One inch in centimetres',
      body: (r, fmt) => (
        <p>
          By definition 1 inch = <strong>{fmt.sig(o(r))} cm</strong>. A 15.6-inch laptop screen is
          therefore 39.624 cm across its diagonal.
        </p>
      ),
    },
    {
      id: 'mile',
      title: 'One mile in kilometres',
      body: (r, fmt) => (
        <p>
          5,280 feet × 0.3048 m = 1,609.344 m, so 1 mile = <strong>{fmt.sig(o(r))} km</strong>. A 10
          km race is about 6.21 miles.
        </p>
      ),
    },
    {
      id: 'height',
      title: 'A height of 6 feet in metres',
      body: (r, fmt) => (
        <p>
          6 × 0.3048 = <strong>{fmt.sig(o(r))} m</strong>, about 183 cm. For heights in feet and
          inches, convert the inches separately and add them.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Feet and inches together:</strong> 5 ft 9 in is 69 inches, which is 175.26 cm.
      </li>
      <li>
        <strong>Survey feet are slightly different.</strong> Older US land records may use the US
        survey foot, which differs by 2 parts per million; for everyday lengths use the
        international foot here.
      </li>
      <li>
        <strong>Nautical miles are for sea and air.</strong> Aviation and shipping use them with
        knots for speed; road distances use statute miles.
      </li>
      <li>
        <strong>Round sensibly.</strong> The factors are exact, but a measured length is not. Keep
        as many digits as your tape measure gives.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many centimetres are in an inch?',
      a: 'Exactly 2.54. The international yard and pound agreement of 1959 fixed the inch at 25.4 millimetres, and both US and imperial inches use that value. To convert centimetres to inches, divide by 2.54: 30 cm is 11.81 inches.',
    },
    {
      q: 'How do I convert miles to kilometres?',
      a: 'Multiply by 1.609344. A 26.2-mile marathon is 42.16 km, and 60 miles is 96.56 km. To go from kilometres to miles divide by the same number, or multiply by about 0.6214.',
    },
    {
      q: 'How many feet are in a metre?',
      a: 'One metre is 1 ÷ 0.3048 = 3.28084 feet, or 39.37 inches. A 2-metre doorway is about 6 feet 6.7 inches tall. To turn feet into metres, multiply by 0.3048 instead.',
    },
    {
      q: 'What is the difference between a mile and a nautical mile?',
      a: 'A statute mile is 1,609.344 metres; a nautical mile is exactly 1,852 metres, about 15% longer. Nautical miles are used at sea and in aviation, where one knot means one nautical mile per hour.',
    },
  ],
  ogSample: (r, fmt) => `1 in = ${fmt.sig(o(r))} cm`,
};
