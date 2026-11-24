import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Fuel Economy Converter',
  promise: 'Convert US mpg, UK mpg, L/100 km and km per litre.',
  title: 'Fuel Economy Converter: mpg to L/100 km, km/L and UK mpg',
  description:
    'Convert fuel economy between miles per US gallon, miles per imperial gallon, litres per 100 km and kilometres per litre, using exact mile and gallon values.',
  summary:
    'Miles per gallon and kilometres per litre measure distance per fuel, so higher is better. Litres per 100 km measures fuel per distance, so lower is better, and converting between the two needs a division, not a multiplication. US and UK miles per gallon also differ, because an imperial gallon is about 20% larger than a US gallon.',
  synonyms: [
    'mpg to L/100km',
    'L/100km to mpg',
    'UK mpg to US mpg',
    'km/L to mpg',
    'fuel consumption converter',
    'mpg converter',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Reciprocal conversions">
        {
          'L/100 km = 235.214 583 ÷ US mpg\nL/100 km = 282.480 936 ÷ UK mpg\nL/100 km = 100 ÷ km per litre'
        }
      </Formula>
      <p>
        The constants come from exact definitions: 1 mile = 1.609344 km, 1 US gallon = 3.785411784 L
        and 1 imperial gallon = 4.54609 L. For example 100 × 3.785411784 ÷ 1.609344 = 235.2146.
      </p>
      <Formula label="US and UK mpg">{'UK mpg = US mpg × 1.200 95'}</Formula>
      <p>
        Because L/100 km is a reciprocal, equal improvements in mpg save less fuel at high mpg.
        Going from 15 to 20 mpg saves more fuel than going from 40 to 50 mpg.
      </p>
    </>
  ),
  examples: [
    {
      id: 'mpg',
      title: '30 US mpg in L/100 km',
      body: (r, fmt) => (
        <p>
          235.2146 ÷ 30 = <strong>{fmt.sig(o(r), 6)} L/100 km</strong>. Lower is better in this
          unit.
        </p>
      ),
    },
    {
      id: 'ukus',
      title: '50 UK mpg in US mpg',
      body: (r, fmt) => (
        <p>
          50 ÷ 1.20095 = <strong>{fmt.sig(o(r), 6)} US mpg</strong>. A car quoted at 50 mpg in the
          UK would be quoted at about 41.6 mpg in the US for the same fuel use.
        </p>
      ),
    },
    {
      id: 'litres',
      title: '6 L/100 km in US mpg',
      body: (r, fmt) => (
        <p>
          235.2146 ÷ 6 = <strong>{fmt.sig(o(r), 6)} US mpg</strong>, or about 47.1 UK mpg.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Know your gallon.</strong> UK figures use imperial gallons and US figures use US
        gallons; check which one a source means.
      </li>
      <li>
        <strong>Compare in L/100 km for costs.</strong> Fuel used is proportional to L/100 km, so it
        multiplies directly by distance and price.
      </li>
      <li>
        <strong>Trip costs:</strong> the fuel cost calculator turns any of these figures into the
        cost of a journey.
      </li>
      <li>
        <strong>Rated versus real economy.</strong> Official ratings come from standard test cycles;
        your own fill-up records show your real figure.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert mpg to L/100 km?',
      a: 'Divide 235.215 by the US mpg figure, or 282.481 by the UK mpg figure. 25 US mpg is 9.41 L/100 km, and 25 UK mpg is 11.30 L/100 km. The same formula works in reverse: divide the constant by L/100 km to get mpg.',
    },
    {
      q: 'Why is UK mpg higher than US mpg for the same car?',
      a: 'An imperial gallon is 4.54609 litres and a US gallon is 3.785411784 litres, so a car travels about 20% further on a UK gallon. The same car is quoted at about 1.2 times higher mpg in the UK.',
    },
    {
      q: 'What is a good fuel economy in L/100 km?',
      a: 'It depends on the vehicle type and how it is driven. Lower is better: 5 L/100 km uses half the fuel of 10 L/100 km over the same distance. Compare cars of the same class using the same unit and test cycle.',
    },
    {
      q: 'How do I convert km per litre to mpg?',
      a: 'Multiply km/L by 2.35215 to get US mpg, or by 2.82481 to get UK mpg. 15 km/L is 35.28 US mpg or 42.37 UK mpg. To go from km/L to L/100 km, divide 100 by the figure.',
    },
  ],
  ogSample: (r, fmt) => `30 US mpg = ${fmt.sig(o(r), 6)} L/100 km`,
};
