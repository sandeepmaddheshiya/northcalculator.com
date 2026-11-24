import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'cost') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Electricity Cost Calculator',
  promise: 'What an appliance costs to run, from its watts, hours of use and your rate.',
  title: 'Electricity Cost Calculator: Appliance Running Cost in kWh',
  description:
    'Estimate what an appliance costs to run from its power in watts, the hours a day it is on and your electricity price per kWh, by day, hour or year.',
  summary:
    'Electricity is billed in kilowatt-hours. Multiply an appliance’s power in kilowatts by the hours it runs to get kWh, then multiply by your price per kWh. A 100 W bulb on for 3 hours a day uses 0.3 kWh a day and 109.5 kWh a year. At $0.10 per kWh, that is $10.95 a year.',
  synonyms: [
    'appliance energy cost calculator',
    'kWh cost calculator',
    'watts to kWh calculator',
    'power consumption calculator',
    'how much does it cost to run',
    'energy usage calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    pow: 'Power',
    power: 'Power',
    powerUnit: 'Power unit',
    'unit.W': 'watts',
    'unit.kW': 'kW',
    hours: 'Hours a day',
    'hours.help': 'Average hours the appliance is on each day.',
    days: 'Number of days',
    rate: 'Price per kWh',
    'rate.help': 'From your bill; 16.5¢ is 0.165.',
    'out.cost': 'Total cost',
    'out.kwh': 'Energy used (kWh)',
    'out.perDay': 'Cost per day',
    'out.perHour': 'Cost per hour of use',
    'out.perYear': 'Cost per year',
    explain: 'Over {days} days the appliance uses {kwh} kWh, which costs {cost}.',
    'step.kwh': 'Energy = power in kW × hours a day × days.',
    'step.cost': 'Cost = energy × price per kWh.',
    'warn.hours': 'A day has at most 24 hours.',
    rounding:
      'The total is rounded half-up to the smallest unit of the currency. Per-day and per-hour costs are shown to 4 decimals.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Energy and cost">
        {'kWh = watts × hours ÷ 1,000\ncost = kWh × price per kWh'}
      </Formula>
      <p>
        Energy is power multiplied by time, E = Pt. One kilowatt-hour is 1,000 watts for one hour,
        or 3.6 million joules. The wattage on an appliance’s label is usually its maximum, so
        fridges, computers and devices with thermostats often use less on average.
      </p>
    </>
  ),
  examples: [
    {
      id: 'bulb',
      title: 'A 100 W bulb, 3 hours a day for a year',
      body: (r, fmt) => (
        <p>
          0.1 kW × 3 h × 365 = {fmt.sig(o(r, 'kwh'), 8)} kWh, which at $0.10 costs{' '}
          <strong>{fmt.money(o(r))}</strong> (OpenStax <em>University Physics</em> Example 9.10).
        </p>
      ),
    },
    {
      id: 'led',
      title: 'A 20 W LED for the same light',
      body: (r, fmt) => (
        <p>
          0.02 kW × 3 h × 365 = {fmt.sig(o(r, 'kwh'), 8)} kWh, or <strong>{fmt.money(o(r))}</strong>{' '}
          a year: $8.76 less than the incandescent bulb.
        </p>
      ),
    },
    {
      id: 'incandescent',
      title: 'A 60 W bulb for 1,000 hours',
      body: (r, fmt) => (
        <p>
          Spread as 10 hours a day for 100 days: 60 W × 1,000 h = {fmt.sig(o(r, 'kwh'), 8)} kWh,
          which at $0.12 per kWh costs <strong>{fmt.money(o(r))}</strong> (OpenStax{' '}
          <em>College Physics</em> Example 20.8).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Find your rate on your bill.</strong> Use the price per kWh including taxes and any
        per-kWh delivery charges; fixed monthly fees do not change with use.
      </li>
      <li>
        <strong>Cycling appliances:</strong> a fridge’s compressor runs part of the time, so enter
        the hours it actually runs, or use the yearly kWh on its energy label.
      </li>
      <li>
        <strong>Standby counts.</strong> A device drawing 5 W on standby all year uses about 43.8
        kWh.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the cost of running an appliance?',
      a: 'Multiply its power in watts by the hours it runs and divide by 1,000 to get kWh. Then multiply by your price per kWh. A 2,000 W heater on for 4 hours uses 8 kWh, which costs $1.60 at $0.20 per kWh.',
    },
    {
      q: 'What is a kilowatt-hour?',
      a: 'A kilowatt-hour is the energy used by a 1,000 W appliance running for one hour, equal to 3.6 million joules. A 100 W bulb takes 10 hours to use 1 kWh. Electricity companies bill by the kWh, often shown as units on the bill.',
    },
    {
      q: 'How many watts does an appliance use?',
      a: 'Check the label or rating plate, usually on the back or underneath, or the manual. If it lists volts and amps instead, multiply them: 230 V × 2 A is 460 W. A plug-in energy meter measures what it actually draws.',
    },
    {
      q: 'Is it cheaper to leave things on standby?',
      a: 'Standby power is small but constant. A 5 W standby load costs about $8.76 a year at $0.20 per kWh, because it runs all 8,760 hours of the year. Switching off at the wall saves that.',
    },
  ],
  ogSample: (r, fmt) => `100 W, 3 h a day, $0.10/kWh → ${fmt.money(o(r))} a year`,
};
