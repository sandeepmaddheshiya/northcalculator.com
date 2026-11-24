import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Speed Converter',
  promise: 'Convert mph, km/h, knots, metres per second and feet per second.',
  title: 'Speed Converter: mph to km/h, Knots and Metres per Second',
  description:
    'Convert speed between miles per hour, kilometres per hour, metres per second, feet per second and knots, using the exact international mile and nautical mile.',
  summary:
    'Speed is distance divided by time, so converting it means converting the distance unit. A mile is exactly 1.609344 km, so 1 mph is 1.609344 km/h. A knot is one nautical mile, exactly 1,852 m, per hour. Metres per second convert to kilometres per hour by multiplying by 3.6, because an hour has 3,600 seconds.',
  synonyms: [
    'mph to kph',
    'km/h to mph',
    'knots to mph',
    'm/s to km/h',
    'kph to mph',
    'speed conversion',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Speed factors">
        {
          '1 mph = 1.609 344 km/h = 0.447 04 m/s\n1 knot = 1.852 km/h\n1 m/s = 3.6 km/h\n1 ft/s = 1.097 28 km/h'
        }
      </Formula>
      <p>
        Every unit here is defined exactly: the mile and foot through the international yard, the
        nautical mile as 1,852 metres. The calculator converts your speed to metres per second, the
        SI unit, then to the unit you want.
      </p>
    </>
  ),
  examples: [
    {
      id: 'highway',
      title: '60 mph in km/h',
      body: (r, fmt) => (
        <p>
          60 × 1.609344 = <strong>{fmt.sig(o(r))} km/h</strong>. A 100 km/h limit in Europe is about
          62 mph.
        </p>
      ),
    },
    {
      id: 'knot',
      title: 'One knot in km/h',
      body: (r, fmt) => (
        <p>
          A knot is one nautical mile per hour, so 1 knot = <strong>{fmt.sig(o(r))} km/h</strong>,
          about 1.15 mph. Ships, aircraft and weather reports for wind at sea use knots.
        </p>
      ),
    },
    {
      id: 'mps',
      title: '10 metres per second in km/h',
      body: (r, fmt) => (
        <p>
          10 m/s × 3.6 = <strong>{fmt.sig(o(r))} km/h</strong>. Covering 100 metres in 10 seconds is
          exactly this speed.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Quick estimate:</strong> km/h ≈ mph × 1.6, and mph ≈ km/h × 0.62.
      </li>
      <li>
        <strong>Running pace is the inverse of speed.</strong> 10 km/h is 6:00 per km; the pace
        calculator converts between them.
      </li>
      <li>
        <strong>Wind speeds</strong> appear in m/s, km/h, mph or knots depending on the country and
        the forecast. Convert before comparing them.
      </li>
      <li>
        <strong>Feet per second</strong> appear in ballistics and engineering: 1 ft/s is 1.09728
        km/h, exactly.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert mph to km/h?',
      a: 'Multiply by 1.609344, the number of kilometres in a mile. 30 mph is 48.28 km/h and 70 mph is 112.65 km/h. To convert km/h to mph, divide by 1.609344 or multiply by about 0.6214.',
    },
    {
      q: 'How fast is a knot?',
      a: 'One knot is one nautical mile per hour: exactly 1.852 km/h, or about 1.151 mph and 0.514 m/s. It is the standard speed unit at sea and in aviation, where distances are also measured in nautical miles.',
    },
    {
      q: 'How do I convert m/s to km/h?',
      a: 'Multiply by 3.6. One metre per second covers 3,600 metres in an hour, which is 3.6 kilometres. So 25 m/s is 90 km/h. To go back, divide km/h by 3.6.',
    },
    {
      q: 'What is 100 km/h in mph?',
      a: '100 ÷ 1.609344 = 62.14 mph. Many countries post motorway limits of 100 to 130 km/h, which is roughly 62 to 81 mph. Divide any km/h figure by 1.609344 to get mph.',
    },
  ],
  ogSample: (r, fmt) => `60 mph = ${fmt.sig(o(r))} km/h`,
};
