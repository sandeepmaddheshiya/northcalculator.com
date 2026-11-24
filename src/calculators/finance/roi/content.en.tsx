import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'roi') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'ROI Calculator',
  promise: 'Return on investment as a percentage, plus the equivalent yearly return.',
  title: 'ROI Calculator: Return on Investment and Annualized ROI',
  description:
    'Calculate return on investment (ROI) from what you paid and what you got back, the gain or loss, and the annualized return over the years you held it.',
  summary:
    'Return on investment (ROI) measures profit relative to cost: subtract what you paid from what you got back, divide by what you paid, and multiply by 100. Buying for $2,187 and selling for $2,915 is a $728 gain and an ROI of 33.29%. ROI ignores time, so to compare investments held for different periods, convert it to an annualized return.',
  synonyms: [
    'return on investment calculator',
    'investment return calculator',
    'annualized ROI calculator',
    'profit percentage calculator',
    'gain or loss calculator',
    'stock return calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    cost: 'Amount invested',
    value: 'Amount returned',
    'value.help': 'Sale proceeds or current value, plus any dividends or interest received.',
    years: 'Years held',
    'years.help': 'Used for the annualized return. Enter 0 to skip it.',
    'out.roi': 'Return on investment',
    'out.gain': 'Gain or loss',
    'out.annualized': 'Annualized return',
    'out.multiple': 'Money multiple (returned ÷ invested)',
    'explain.gain': 'You made {gain} on {cost}, a return of {roi}.',
    'explain.loss': 'You lost {gain} on {cost}, a return of −{roi}.',
    'step.gain': 'Gain = amount returned − amount invested.',
    'step.roi': 'ROI = gain ÷ amount invested.',
    'step.annualized': 'Annualized return = (returned ÷ invested)^(1 ÷ years) − 1.',
    'warn.cost': 'Enter an amount invested above zero.',
    'warn.short':
      'For less than a year, the annualized figure scales a short-term result up to a full year, which can exaggerate it.',
    rounding:
      'Money amounts keep full precision; percentages are rounded half-up to 4 decimal places and shown to 2.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Return on investment">
        {'ROI = (amount returned − amount invested) ÷ amount invested × 100'}
      </Formula>
      <p>
        OpenStax <em>Contemporary Mathematics</em> works the example of 100 shares bought at $21.87
        and sold a year later at $29.15: the gain is $728 on $2,187 invested, an ROI of 33.29%.
        Count everything the investment paid you, including dividends and interest, in the amount
        returned, and include fees and commissions in the amount invested.
      </p>
      <p>
        <strong>Why annualize?</strong> A 22% ROI earned over 4 years is not as good as 22% earned
        in one. The annualized return finds the single yearly rate that produces the same result:
      </p>
      <Formula label="Annualized return">
        {'annual = (returned ÷ invested)^(1 ÷ years) − 1'}
      </Formula>
      <p>
        For a $3,000 bond that returned $3,660 over 4 years, that is 1.22^(1/4) − 1 = 5.10% a year.
      </p>
    </>
  ),
  examples: [
    {
      id: 'shares',
      title: 'Shares held for a year',
      body: (r, fmt) => (
        <p>
          100 shares bought for $2,187 and sold for $2,915 earn {fmt.money(o(r, 'gain'))}. Divided
          by the $2,187 invested, the ROI is <strong>{fmt.pct(o(r), 2)}</strong>, OpenStax’s Example
          6.67. Held for exactly one year, the annualized return is the same.
        </p>
      ),
    },
    {
      id: 'bond',
      title: 'A bond held for four years',
      body: (r, fmt) => (
        <p>
          A $3,000 bond paying $165 a year returns $3,660 after 4 years: an ROI of{' '}
          <strong>{fmt.pct(o(r), 0)}</strong> (Example 6.70). Spread over 4 years with compounding,
          that is {fmt.pct(o(r, 'annualized'), 2)} a year.
        </p>
      ),
    },
    {
      id: 'long',
      title: 'Twenty years of reinvested dividends',
      body: (r, fmt) => (
        <p>
          $13,000 that grows to $132,293.49 in 20 years has an ROI of{' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. That large number corresponds to a steady{' '}
          {fmt.pct(o(r, 'annualized'), 1)} a year, as Example 6.72 shows.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Include all costs.</strong> Purchase fees, commissions, taxes paid and money you
        added later all belong in the amount invested. Leaving them out overstates ROI.
      </li>
      <li>
        <strong>Compare like with like.</strong> Use annualized returns to compare investments held
        for different lengths of time, and compare after fees and taxes.
      </li>
      <li>
        <strong>ROI says nothing about risk.</strong> A higher return often comes with a higher
        chance of loss. Two investments with the same ROI can have very different risks.
      </li>
      <li>
        <strong>For projects and marketing,</strong> the same formula applies: (benefit − cost) ÷
        cost. Be explicit about which benefits and costs you counted.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you calculate ROI?',
      a: 'Subtract the amount invested from the amount returned, divide by the amount invested, and multiply by 100. Investing $5,000 and getting back $6,200 gives a $1,200 gain and an ROI of 1,200 ÷ 5,000 = 24%.',
    },
    {
      q: 'What is a good ROI?',
      a: 'There is no single answer: it depends on the risk, the time involved and what else the money could have earned. Compare the annualized return with a safe alternative such as a savings account or government bonds over the same period, and with inflation.',
    },
    {
      q: 'What is the difference between ROI and annualized ROI?',
      a: 'Plain ROI is the total return over the whole holding period. Annualized ROI converts it into a yearly rate with compounding. A 50% ROI over 5 years is about 8.45% a year, while 50% in one year is 50% a year.',
    },
    {
      q: 'Can ROI be negative?',
      a: 'Yes. If you get back less than you put in, the gain is negative and so is the ROI. Investing $1,000 and recovering $850 is an ROI of −15%. The worst possible ROI is −100%, when the whole investment is lost.',
    },
  ],
  ogSample: (r, fmt) => `ROI ${fmt.pct(o(r), 2)}`,
};
