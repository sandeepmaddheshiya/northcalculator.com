import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'first') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Depreciation Calculator',
  promise: 'Yearly depreciation and book value by straight line, declining balance or usage.',
  title: 'Depreciation Calculator: Straight Line, DDB and Units',
  description:
    'Get a full depreciation schedule by straight-line, double-declining-balance or units-of-production, with book value and accumulated depreciation each year.',
  summary:
    'Depreciation spreads an asset’s cost, less its expected salvage value, over the years it is used. Straight line charges the same amount every year. Double declining balance charges twice the straight-line rate on the remaining book value, so early years carry more. Units of production ties each year’s charge to how much the asset was actually used.',
  synonyms: [
    'straight line depreciation calculator',
    'double declining balance calculator',
    'units of production depreciation',
    'depreciation schedule',
    'book value calculator',
    'asset depreciation calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    method: 'Method',
    'method.sl': 'Straight line',
    'method.ddb': 'Declining',
    'method.units': 'Usage',
    cost: 'Asset cost',
    'cost.help': 'Include shipping and set-up costs needed to put the asset into use.',
    salvage: 'Salvage (residual) value',
    'salvage.help': 'What you expect the asset to be worth at the end of its useful life.',
    life: 'Useful life (years)',
    totalUnits: 'Total units over its life',
    'totalUnits.help': 'Expected lifetime output: hours, miles, pages or items.',
    used: 'Units used each year',
    'used.help': 'One number per year, first year first, e.g. 180000, 200000.',
    'out.first': 'First-year depreciation',
    'out.final': 'Final-year depreciation',
    'out.rate': 'Annual rate',
    'out.rate.sl': 'Straight-line rate',
    'out.rate.units': 'Annual rate',
    'out.rate.ddb': 'Declining-balance rate (2 ÷ life)',
    'out.perUnit': 'Depreciation per unit',
    'out.base': 'Depreciable base (cost − salvage)',
    'out.total': 'Total depreciation',
    'out.endBook': 'Book value at the end',
    explain:
      'The first year’s depreciation is {first}; over {n} years the book value falls from {cost} to {end}.',
    'table.caption': 'Depreciation schedule',
    'table.year': 'Year',
    'table.dep': 'Depreciation',
    'table.acc': 'Accumulated',
    'table.book': 'Book value',
    'step.base': 'Depreciable base = cost − salvage value.',
    'step.sl': 'Straight line: the base ÷ the useful life, the same every year.',
    'step.ddbRate': 'Double-declining rate = 2 ÷ useful life.',
    'step.ddb':
      'Year 1 = cost × rate. Each later year = the remaining book value × rate; salvage is not subtracted first.',
    'step.ddbStop':
      'Book value never goes below salvage, and the final year takes whatever is left above salvage.',
    'step.perUnit': 'Rate per unit = the base ÷ total expected units.',
    'step.units': 'Each year = units used × rate per unit.',
    'warn.cost': 'Enter an asset cost above zero.',
    'warn.salvage': 'The salvage value cannot be more than the cost.',
    'warn.life': 'Enter a useful life of at least 1 whole year.',
    'warn.units': 'Enter the total units the asset is expected to produce.',
    'warn.used': 'Enter the units used in at least one year.',
    'warn.bad': 'Entries that are not zero or a positive number were skipped.',
    'warn.tooMany': 'Only the first {max} years were used.',
    'warn.overUnits':
      'Usage adds up to more than {total} units, so depreciation stops once book value reaches salvage.',
    'warn.remaining': '{left} is still to be depreciated in later years.',
    rounding: 'Each year is rounded to the cent; the schedule ends exactly at salvage value.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Straight line">{'(cost − salvage) ÷ useful life'}</Formula>
      <Formula label="Double declining balance">
        {'book value at the start of the year × 2 ÷ useful life'}
      </Formula>
      <Formula label="Units of production">
        {'(cost − salvage) ÷ total units × units used this year'}
      </Formula>
      <p>
        Declining balance applies its rate to the full book value, without subtracting salvage. It
        stops when book value reaches salvage, and the last year of the life takes whatever remains
        above salvage, as in the OpenStax and Jonick worked examples. Units of production stops once
        the full base is used up, even if the asset keeps running.
      </p>
      <p>
        These are the financial-accounting methods. Tax depreciation, such as MACRS in the United
        States or capital allowances elsewhere, follows separate statutory tables and conventions.
      </p>
    </>
  ),
  examples: [
    {
      id: 'kenzie',
      title: 'A $58,000 printing press, $10,000 salvage, 5 years, straight line',
      body: (r, fmt) => (
        <p>
          ($58,000 − $10,000) ÷ 5 = <strong>{fmt.money(o(r))}</strong> a year, reaching a book value
          of {fmt.money(o(r, 'endBook'))} after five years, as in OpenStax’s Kenzie Company example.
        </p>
      ),
    },
    {
      id: 'ddb',
      title: '$27,000 cost, $900 residual, 3 years, double declining balance',
      body: (r, fmt) => (
        <p>
          The rate is 2 ÷ 3. Year 1 is $27,000 × 2/3 = <strong>{fmt.money(o(r))}</strong>, year 2 is
          $9,000 × 2/3 = $6,000, and year 3 takes the remaining $3,000 − $900 ={' '}
          {fmt.money(o(r, 'final'))}, matching the Jonick text.
        </p>
      ),
    },
    {
      id: 'hours',
      title: 'Same machine by usage: 8,700 hours, used 2,100, 2,300, 2,600, 2,400',
      body: (r, fmt) => (
        <p>
          $26,100 ÷ 8,700 = $3.00 an hour, so year 1 is 2,100 × $3 ={' '}
          <strong>{fmt.money(o(r))}</strong>. Only 1,700 hours are left in year 4, so it stops at{' '}
          {fmt.money(o(r, 'final'))}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Same total, different timing:</strong> every method writes off the same cost −
        salvage in the end. Accelerated methods move expense earlier, lowering early reported
        profit.
      </li>
      <li>
        <strong>Land is not depreciated.</strong> Split a property’s price between building and land
        and depreciate only the building.
      </li>
      <li>
        <strong>Estimates can change:</strong> if the life or salvage estimate changes, depreciate
        the remaining book value over the new remaining life from that point on.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate straight-line depreciation?',
      a: 'Subtract the salvage value from the cost and divide by the useful life in years. A $58,000 asset with a $10,000 salvage value and a 5-year life depreciates ($58,000 − $10,000) ÷ 5 = $9,600 a year, leaving a $10,000 book value at the end.',
    },
    {
      q: 'How does double declining balance work?',
      a: 'Double the straight-line rate, so 2 ÷ 5 = 40% for a 5-year life, and apply it to the book value at the start of each year. Salvage is ignored at first but book value is never taken below it. A $58,000 asset gives $23,200, $13,920, $8,352, then only $2,528.',
    },
    {
      q: 'Why does declining balance depreciation stop early?',
      a: 'Because book value cannot fall below salvage value. In the OpenStax example the 40% rate would give $5,011.20 in year 4, but only $2,528 remains above the $10,000 salvage value, so year 4 takes $2,528 and year 5 takes nothing.',
    },
    {
      q: 'When should I use units of production?',
      a: 'Use it when wear depends on use rather than time, such as machine hours, vehicle miles or printed pages. A busy year carries more expense. Divide cost less salvage by the expected lifetime units, then multiply by each year’s actual units.',
    },
    {
      q: 'What is book value?',
      a: 'Book value is the cost minus the accumulated depreciation to date. It is an accounting figure, not a market price: an asset can be worth more or less than its book value when sold, which is recorded as a gain or loss.',
    },
  ],
  ogSample: (r, fmt) => `$58,000 cost, $10,000 salvage, 5 years → ${fmt.money(o(r))} a year`,
};
