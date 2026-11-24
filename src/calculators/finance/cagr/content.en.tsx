import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'cagr') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'CAGR Calculator',
  promise: 'The steady yearly growth rate between a starting and an ending value.',
  title: 'CAGR Calculator: Compound Annual Growth Rate Explained',
  description:
    'Work out the compound annual growth rate (CAGR) of an investment, revenue or any value from its start value, end value and the number of years between them.',
  summary:
    'Compound annual growth rate (CAGR) is the single yearly rate that, compounded every year, turns a starting value into an ending value over a given number of years. Divide the end value by the start value, raise the result to the power 1 ÷ years, and subtract 1. It smooths out the ups and downs, so it describes the overall growth, not any single year.',
  synonyms: [
    'compound annual growth rate calculator',
    'annualized return calculator',
    'average annual growth rate',
    'investment growth rate',
    'annual rate of return',
    'revenue growth rate',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    start: 'Starting value',
    end: 'Ending value',
    years: 'Number of years',
    'years.help': 'Decimals are fine: 18 months is 1.5 years.',
    'out.cagr': 'Compound annual growth rate',
    'out.total': 'Total growth',
    'out.multiple': 'Growth multiple (end ÷ start)',
    'out.gain': 'Change in value',
    'explain.up':
      'Growing from {start} to {end} over {years} years is the same as growing {r} every year, compounded.',
    'explain.down':
      'Falling from {start} to {end} over {years} years is the same as losing {r} every year, compounded.',
    'step.multiple': 'Divide the ending value by the starting value.',
    'step.root': 'Take the root for the number of years: raise it to the power 1 ÷ years.',
    'step.subtract': 'Subtract 1 and express it as a percentage.',
    'warn.start': 'The starting value must be above zero. Growth from nothing has no rate.',
    'warn.years': 'Enter a number of years above zero.',
    'warn.negative':
      'CAGR is undefined when the ending value is negative. Report the change in value instead.',
    'warn.short':
      'For less than a year, CAGR scales the result up to a yearly rate, which can exaggerate a short-term move.',
    'warn.zero': 'An ending value of zero is a loss of everything, a CAGR of −100%.',
    rounding:
      'Computed in double precision. The rate is rounded half-up to 4 decimal places and shown to 2.',
  },
  HowItWorks: () => (
    <>
      <p>
        If a value grows at a constant rate r each year, after t years it is multiplied by (1 + r)ᵗ.
        CAGR runs that backwards: given the start, the end and the time, it finds r.
      </p>
      <Formula
        label="Compound annual growth rate"
        where={[
          { symbol: 'V₀', meaning: 'starting value' },
          { symbol: 'V₁', meaning: 'ending value' },
          { symbol: 't', meaning: 'years between them' },
        ]}
      >
        {'CAGR = (V₁ ÷ V₀)^(1 ÷ t) − 1'}
      </Formula>
      <p>
        OpenStax <em>Contemporary Mathematics</em> calls this the annual return. Applying it to a
        $3,000 bond that paid $660 in interest over 4 years gives (3,660 ÷ 3,000)^(1/4) − 1 = 5.10%,
        which is the equivalent rate compounded annually.
      </p>
      <h3>Why not just divide the total growth by the years?</h3>
      <p>
        Dividing the total growth by the number of years ignores compounding. An investment that
        doubles in 10 years grew 100% in total, but not 10% a year: 1.1¹⁰ is about 2.59. The true
        CAGR is 2^(1/10) − 1, about 7.18%. The simple average always overstates the rate when growth
        is positive.
      </p>
    </>
  ),
  examples: [
    {
      id: 'stock',
      title: '$13,000 in a stock that grows to $132,293.49 in 20 years',
      body: (r, fmt) => (
        <p>
          This is OpenStax’s Example 6.72, with dividends reinvested. The value is multiplied by
          about 10.18 over 20 years, and 10.18^(1/20) − 1 gives a CAGR of{' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. The total return is {fmt.pct(o(r, 'total'), 2)},
          which sounds dramatic but is a steady 12.3% a year.
        </p>
      ),
    },
    {
      id: 'bond',
      title: 'A $3,000 bond that pays $660 over 4 years',
      body: (r, fmt) => (
        <p>
          The bond pays 5.5% simple interest, $165 a year, for a total of $3,660. The total growth
          is {fmt.pct(o(r, 'total'), 0)}. Because the interest isn’t reinvested, the equivalent
          compound rate is lower than the coupon: <strong>{fmt.pct(o(r), 2)}</strong>, which
          OpenStax rounds to 5.10%.
        </p>
      ),
    },
    {
      id: 'gdp',
      title: 'An economy that grows from 100 to 164 in 50 years',
      body: (r, fmt) => (
        <p>
          OpenStax <em>Principles of Macroeconomics</em> says 1% annual growth for 50 years takes
          GDP per capita from 100 to 164. Running it backwards gives{' '}
          <strong>{fmt.pct(o(r), 2)}</strong>, not exactly 1%, because the book rounds 1.01⁵⁰ =
          1.6446 down to 164. Small rounding in the end value shifts the rate when the period is
          long.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>CAGR hides volatility.</strong> A fund that rises 50% and then falls by a third has
        a CAGR of 0% over the two years. Two investments with the same CAGR can carry very different
        risk.
      </li>
      <li>
        <strong>Include everything you put in and took out.</strong> CAGR assumes a single starting
        amount. If you added money along the way, the ending value includes your own deposits and
        the rate is overstated. Use a money-weighted return for regular contributions.
      </li>
      <li>
        <strong>Count years exactly.</strong> From January 2015 to July 2025 is 10.5 years, not 10
        or 11. An error of half a year changes the rate noticeably over short periods.
      </li>
      <li>
        <strong>Check the start date.</strong> Starting at a market low or high can make the same
        investment look very good or very poor. Compare several start dates before drawing
        conclusions.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate CAGR?',
      a: 'Divide the ending value by the starting value, raise the result to the power of 1 divided by the number of years, and subtract 1. For $10,000 that grows to $16,105 in 5 years: 1.6105^(1/5) = 1.10, so the CAGR is 10%. A spreadsheet can do it with =(end/start)^(1/years)-1.',
    },
    {
      q: 'What is the difference between CAGR and average annual return?',
      a: 'The average annual return adds each year’s return and divides by the number of years. CAGR is the compounded rate that links the first and last values. A gain of 50% then a loss of 50% averages 0%, but you end at 75% of the start, a CAGR of about −13.4%.',
    },
    {
      q: 'Can CAGR be negative?',
      a: 'Yes. If the ending value is below the starting value, CAGR is negative and shows the steady yearly loss that would produce the same result. Falling from $10,000 to $7,290 over 3 years is a CAGR of −10%, since 0.9³ = 0.729.',
    },
    {
      q: 'What is a good CAGR?',
      a: 'It depends on what is growing and the risk taken. Compare it with a benchmark over the same years, such as a broad stock index for an investment, or inflation for prices and wages. A CAGR is only meaningful next to a comparison measured over the identical period.',
    },
    {
      q: 'Does CAGR work for periods shorter than a year?',
      a: 'The formula works, but it annualizes the result, so a 5% gain in three months becomes about 21.6% a year. That assumes the short-term pace continues, which rarely happens. For periods under a year, the plain percentage change is usually the more honest figure.',
    },
  ],
  ogSample: (r, fmt) => `CAGR ${fmt.pct(o(r), 2)}`,
};
