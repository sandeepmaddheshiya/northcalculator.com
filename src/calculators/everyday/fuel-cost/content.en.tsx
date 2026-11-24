import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'cost') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Fuel Cost Calculator',
  promise: 'What a trip costs in fuel, in miles or kilometres, MPG or L/100 km.',
  title: 'Fuel Cost Calculator: Trip Cost in MPG or L/100 km',
  description:
    'Work out the fuel cost of a trip from distance, fuel economy and fuel price, in miles or km, US or UK MPG, L/100 km or km/L, split between passengers.',
  summary:
    'A trip’s fuel cost is the fuel it uses times the price of that fuel. With miles per gallon, divide the distance by the MPG to get gallons. With litres per 100 km, multiply the distance by the consumption and divide by 100 to get litres. Multiply by the price per gallon or litre, and double the distance for a return journey.',
  synonyms: [
    'gas cost calculator',
    'trip cost calculator',
    'petrol cost calculator',
    'road trip gas calculator',
    'fuel calculator',
    'gas money calculator',
    'mileage cost calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    dist: 'Distance',
    distance: 'Distance',
    distUnit: 'Unit',
    'unit.mi': 'miles',
    'unit.km': 'km',
    roundTrip: 'Return trip (double the distance)',
    eff: 'Fuel economy',
    efficiency: 'Fuel economy',
    effUnit: 'Unit',
    'unit.mpgUS': 'MPG (US)',
    'unit.mpgUK': 'MPG (UK)',
    'unit.l100': 'L/100 km',
    'unit.kml': 'km/L',
    fuelPrice: 'Fuel price',
    price: 'Price',
    priceUnit: 'Per',
    'unit.galUS': 'US gallon',
    'unit.galUK': 'UK gallon',
    'unit.L': 'litre',
    people: 'Split between (people)',
    'out.cost': 'Fuel cost',
    'out.fuel.galUS': 'Fuel used (US gallons)',
    'out.fuel.galUK': 'Fuel used (UK gallons)',
    'out.fuel.L': 'Fuel used (litres)',
    'out.perDistance.mi': 'Cost per mile',
    'out.perDistance.km': 'Cost per km',
    'out.each': 'Cost per person',
    'out.l100': 'Consumption (L/100 km)',
    'word.mi': 'miles',
    'word.km': 'km',
    'word.galUS': 'US gallons',
    'word.galUK': 'UK gallons',
    'word.L': 'litres',
    explain: 'Driving {dist} {unit} uses {fuel} {fuelUnit} of fuel and costs {cost}.',
    'explain.split': 'Driving {dist} {unit} costs {cost} in fuel, or {each} each for {n} people.',
    'step.roundTrip': 'A return trip doubles the distance.',
    'step.fuel': 'Fuel used = distance ÷ fuel economy (or × consumption).',
    'step.cost': 'Fuel cost = fuel used × price per unit of fuel.',
    'warn.efficiency': 'Enter a fuel economy above zero.',
    rounding:
      'Unit conversions use exact factors. The cost is rounded half-up to the smallest unit of the currency; fuel volumes are shown to 2 decimal places.',
  },
  HowItWorks: () => (
    <>
      <p>
        The calculation depends on how fuel economy is expressed. Miles per gallon and km per litre
        are distances per unit of fuel, so you divide. Litres per 100 km is fuel per distance, so
        you multiply.
      </p>
      <Formula label="Fuel used">
        {
          'MPG:       gallons = miles ÷ MPG\nL/100 km:  litres  = km × (L/100 km) ÷ 100\nkm/L:      litres  = km ÷ (km/L)'
        }
      </Formula>
      <Formula label="Cost">{'cost = fuel used × price per unit of fuel'}</Formula>
      <p>
        Units can be mixed: the calculator converts through litres and kilometres using exact
        definitions published by NIST: 1 mile = 1.609344 km, 1 US gallon = 3.785411784 L, and 1 UK
        (imperial) gallon = 4.54609 L. A UK gallon is about 20% larger, so 40 MPG in the UK is only
        about 33.3 MPG in US terms.
      </p>
      <p>
        <strong>MPG versus L/100 km.</strong> Because MPG divides, improvements at the low end
        matter most. The US fuel economy label site notes that over 1,000 miles, going from 10 to 15
        MPG saves about 33 gallons, while going from 30 to 35 MPG saves only about 5.
      </p>
    </>
  ),
  examples: [
    {
      id: 'trip',
      title: 'A 300-mile drive at 30 MPG',
      body: (r, fmt) => (
        <p>
          300 ÷ 30 = {fmt.num(o(r, 'fuel'), 2)} US gallons. At $3.50 a gallon the trip costs{' '}
          <strong>{fmt.money(o(r))}</strong>, or {fmt.money(o(r, 'perDistance'), 3)} a mile.
        </p>
      ),
    },
    {
      id: 'metric',
      title: 'A return trip of 450 km, split three ways',
      body: (r, fmt) => (
        <p>
          The return journey is 900 km. At 6.5 L/100 km the car uses 900 × 6.5 ÷ 100 ={' '}
          {fmt.num(o(r, 'fuel'), 1)} litres. At €1.85 a litre that is{' '}
          <strong>{fmt.money(o(r))}</strong>, or {fmt.money(o(r, 'each'))} for each of three people.
        </p>
      ),
    },
    {
      id: 'annual',
      title: 'A year of driving at 15,000 miles',
      body: (r, fmt) => (
        <p>
          US fuel economy labels assume 15,000 miles a year. At 25 MPG that is{' '}
          {fmt.int(o(r, 'fuel'))} gallons, and at $3.70 a gallon, the example price on the label
          guide, it comes to <strong>{fmt.money(o(r))}</strong> a year. At 35 MPG the same driving
          would cost about $1,586.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Rated economy is a best case.</strong> Motorway speeds, heavy loads, roof boxes,
        cold weather and air conditioning all raise consumption. For a realistic figure, use the
        average your own trip computer shows for similar driving.
      </li>
      <li>
        <strong>Check which gallon you have.</strong> UK figures use imperial gallons, and US
        figures use US gallons. Mixing them makes the cost about 20% wrong.
      </li>
      <li>
        <strong>Fuel is not the whole cost of driving.</strong> Tolls, parking, wear and
        depreciation can exceed the fuel. For splitting costs fairly on a shared trip, agree what is
        included before you set off.
      </li>
      <li>
        <strong>Electric cars</strong> use energy per distance instead. Multiply kWh per 100 km (or
        per 100 miles) by the distance and the price per kWh, the same way as L/100 km.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the gas cost of a trip?',
      a: 'Divide the trip distance by your car’s miles per gallon to get the gallons needed, then multiply by the price per gallon. For 420 miles in a car that gets 28 MPG with gas at $3.20: 420 ÷ 28 = 15 gallons, and 15 × $3.20 = $48.',
    },
    {
      q: 'How do I convert MPG to L/100 km?',
      a: 'Divide 235.215 by the US MPG figure, or 282.481 by the UK MPG figure. So 30 US MPG is 7.84 L/100 km and 50 UK MPG is 5.65 L/100 km. The calculator shows the L/100 km equivalent of whatever you enter.',
    },
    {
      q: 'What is the difference between US and UK MPG?',
      a: 'A US gallon is 3.785 litres and a UK gallon is 4.546 litres, so the same car shows about 20% more MPG on a UK figure. 40 UK MPG equals about 33.3 US MPG. Make sure your fuel economy and fuel price use the same kind of gallon.',
    },
    {
      q: 'How should we split fuel costs on a road trip?',
      a: 'The simplest fair split divides the total fuel cost equally among the people travelling, which the calculator does under More options. If someone joins for only part of the route, work out the cost of each leg separately and share each leg among the people on it.',
    },
  ],
  ogSample: (r, fmt) => `300 miles at 30 MPG: ${fmt.money(o(r))}`,
};
