import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Energy Converter',
  promise: 'Convert calories, kilojoules, kilowatt-hours, BTU and joules.',
  title: 'Energy Converter: Calories, kJ, kWh, BTU and Joules',
  description:
    'Convert energy between joules, kilojoules, megajoules, calories, food calories (kcal), watt-hours, kilowatt-hours, British thermal units and electronvolts.',
  summary:
    'All energy units measure the same thing and convert through the joule. A food Calorie on a label is a kilocalorie, defined here as exactly 4.184 kilojoules. A kilowatt-hour, the unit on electricity bills, is 1,000 watts for an hour: 3.6 million joules. The British thermal unit used for heating is 1,055.06 joules.',
  synonyms: [
    'calories to kJ',
    'kJ to calories',
    'kWh to BTU',
    'joules to calories',
    'kcal to kWh',
    'energy unit converter',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Energy units in joules">
        {
          '1 cal (thermochemical) = 4.184 J     1 kcal = 4,184 J\n1 Wh = 3,600 J                       1 kWh = 3.6 MJ\n1 Btu (IT) = 1,055.055 852 62 J      1 eV = 1.602 176 634 × 10⁻¹⁹ J'
        }
      </Formula>
      <p>
        NIST’s guide to the SI lists these factors. Several calories exist; this converter uses the
        thermochemical calorie, 4.184 J, the value used in nutrition energy conversions. The
        electronvolt is exact since the 2019 redefinition of the SI fixed the elementary charge.
      </p>
      <p>
        Power is energy per time, so a kilowatt-hour is power (1 kW) multiplied by time (1 h).
        Divide energy by time to get power.
      </p>
    </>
  ),
  examples: [
    {
      id: 'diet',
      title: '2,000 food calories in kilojoules',
      body: (r, fmt) => (
        <p>
          2,000 kcal × 4.184 = <strong>{fmt.sig(o(r))} kJ</strong>. To go back, divide kilojoules by
          4.184.
        </p>
      ),
    },
    {
      id: 'kwh',
      title: 'One kilowatt-hour in BTU',
      body: (r, fmt) => (
        <p>
          3,600,000 J ÷ 1,055.05585262 J = <strong>{fmt.sig(o(r), 8)} Btu</strong>. Heating
          equipment rated in Btu can be compared with electric heaters this way.
        </p>
      ),
    },
    {
      id: 'dietkwh',
      title: 'A day’s food energy in kilowatt-hours',
      body: (r, fmt) => (
        <p>
          2,000 kcal is 8,368 kJ, and 8,368,000 J ÷ 3,600,000 J ={' '}
          <strong>{fmt.sig(o(r), 4)} kWh</strong>, about the energy a 100-watt bulb uses in a day.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Calorie or kilocalorie?</strong> “Calories” on food labels are kilocalories. A
        200-Calorie snack is 200 kcal, or 836.8 kJ.
      </li>
      <li>
        <strong>Energy versus power.</strong> Watts measure power; watt-hours measure energy. A 2 kW
        heater running for 3 hours uses 6 kWh.
      </li>
      <li>
        <strong>Different BTUs exist.</strong> This converter uses the International Table Btu;
        other definitions differ in the fourth significant figure.
      </li>
      <li>
        <strong>Fuel energy</strong> depends on the fuel’s energy content; convert the energy
        figure, not litres or kilograms, between units.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many kilojoules are in a calorie?',
      a: 'A food Calorie (kilocalorie) is 4.184 kJ, and a small calorie is 4.184 J. So a 500 kcal meal is 2,092 kJ. To convert kilojoules to kilocalories, divide by 4.184.',
    },
    {
      q: 'How do I convert kWh to BTU?',
      a: 'Multiply by 3,412.14. One kilowatt-hour is 3.6 million joules and one Btu is 1,055.06 joules, and 3,600,000 ÷ 1,055.06 = 3,412.14. A 5 kWh heater output is about 17,061 Btu.',
    },
    {
      q: 'How many joules are in a kilowatt-hour?',
      a: 'Exactly 3,600,000, because a kilowatt is 1,000 joules per second and an hour is 3,600 seconds. That is 3.6 megajoules. A watt-hour is likewise 3,600 joules, so a 60 W bulb left on for an hour uses 216,000 joules.',
    },
    {
      q: 'Why are there different kinds of calorie?',
      a: 'The calorie was originally the heat needed to warm one gram of water by one degree, which varies slightly with temperature. Defined versions such as the thermochemical calorie (4.184 J) and the International Table calorie (4.1868 J) fix a value. Nutrition energy uses 4.184 J.',
    },
  ],
  ogSample: (r, fmt) => `2,000 kcal = ${fmt.sig(o(r))} kJ`,
};
