import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Power Converter',
  promise: 'Convert horsepower, metric horsepower, watts, kilowatts and BTU per hour.',
  title: 'Power Converter: Horsepower to kW, Watts and BTU per Hour',
  description:
    'Convert power between mechanical horsepower, metric horsepower (PS), watts, kilowatts, megawatts and BTU per hour, using the defined values from NIST.',
  summary:
    'Power is energy per unit of time, and its SI unit is the watt, one joule per second. Mechanical horsepower is 550 foot-pounds per second, which is about 745.7 watts. Metric horsepower, written PS or CV, is slightly smaller at 735.5 watts. Air conditioners and heaters are often rated in BTU per hour, where 1 kW is about 3,412 BTU/h.',
  synonyms: [
    'hp to kW',
    'kW to hp',
    'horsepower to watts',
    'watts to horsepower',
    'PS to kW',
    'BTU/h to kW',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Power units in watts">
        {
          '1 hp (mechanical) = 550 ft·lbf/s = 745.699 871 582 W\n1 PS (metric hp) = 75 kgf·m/s = 735.498 75 W\n1 Btu/h = 1,055.055 852 62 J ÷ 3,600 s = 0.293 071 W'
        }
      </Formula>
      <p>
        Both horsepowers are defined from a weight lifted at a speed. Mechanical horsepower uses
        pounds and feet; metric horsepower uses kilograms and metres, each with standard gravity,
        9.80665 m/s². NIST’s guide to the SI lists both conversions.
      </p>
      <p>
        Watts measure power, the rate of using energy. To get energy, multiply by time: a 2 kW
        heater running for 3 hours uses 6 kWh.
      </p>
    </>
  ),
  examples: [
    {
      id: 'car',
      title: 'A 150 hp engine in kilowatts',
      body: (r, fmt) => (
        <p>
          150 × 745.6999 W = <strong>{fmt.sig(o(r), 6)} kW</strong>. Vehicle documents in many
          countries list engine power in kW.
        </p>
      ),
    },
    {
      id: 'metric',
      title: '100 kW in metric horsepower',
      body: (r, fmt) => (
        <p>
          100,000 W ÷ 735.49875 W = <strong>{fmt.sig(o(r), 6)} PS</strong>, compared with 134.1
          mechanical horsepower. The two horsepowers differ by about 1.4%.
        </p>
      ),
    },
    {
      id: 'btu',
      title: 'One kilowatt in BTU per hour',
      body: (r, fmt) => (
        <p>
          1,000 W ÷ 0.29307 W = <strong>{fmt.sig(o(r), 7)} BTU/h</strong>. A 12,000 BTU/h air
          conditioner moves about 3.5 kW of heat.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>hp, PS and CV.</strong> PS (German) and CV (French, Italian, Spanish) mean metric
        horsepower; hp or bhp usually means mechanical horsepower.
      </li>
      <li>
        <strong>Electrical power</strong> is volts times amps for direct current: 230 V × 10 A =
        2,300 W.
      </li>
      <li>
        <strong>Cooling capacity</strong> in BTU/h is heat moved, not electricity used; check the
        appliance’s power rating in watts for running costs.
      </li>
      <li>
        <strong>Energy bills</strong> charge for kWh, which is power multiplied by hours of use.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert horsepower to kW?',
      a: 'Multiply mechanical horsepower by 0.7457 (more exactly 0.745699872). 200 hp is 149.14 kW. For metric horsepower (PS), multiply by 0.73549875 instead, so 200 PS is 147.10 kW. Divide by the same factors to go from kW back to horsepower.',
    },
    {
      q: 'How many watts are in a horsepower?',
      a: 'One mechanical horsepower is 745.699871582 watts, defined as 550 foot-pounds per second. One metric horsepower is exactly 735.49875 watts, defined as 75 kilogram-force metres per second. Both use standard gravity, 9.80665 m/s².',
    },
    {
      q: 'What is the difference between hp and PS?',
      a: 'They are two definitions of horsepower. Mechanical horsepower (hp) is about 745.7 W and metric horsepower (PS) about 735.5 W, so a figure in PS is about 1.4% higher than the same power in hp.',
    },
    {
      q: 'How do I convert BTU per hour to watts?',
      a: 'Multiply BTU/h by 0.293071, or divide by 3.41214. A 9,000 BTU/h air conditioner moves about 2,638 W, or 2.6 kW, of heat. This is cooling capacity, not the electricity the unit uses.',
    },
  ],
  ogSample: (r, fmt) => `150 hp = ${fmt.sig(o(r), 6)} kW`,
};
