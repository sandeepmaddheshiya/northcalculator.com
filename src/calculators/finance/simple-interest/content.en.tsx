import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Simple Interest Calculator',
  promise: 'Interest and total repaid for a term in years, months or days.',
  title: 'Simple Interest Calculator: Interest for Years or Days',
  description:
    'Calculate simple interest with I = P × r × t for a term in years, months or days, with a 365-day or 360-day year, and see the total to repay or receive.',
  summary:
    'Simple interest is charged only on the original amount, never on earlier interest: I = P × r × t, with the rate as a decimal and the time in years. $4,000 at 5.5% for 4 years earns $880. For a term in months, t is months ÷ 12; for days, t is days ÷ 365, or ÷ 360 if the lender uses the banker’s rule.',
  synonyms: [
    'I = Prt calculator',
    'interest calculator',
    'simple interest formula',
    'interest for days calculator',
    'short term loan interest',
    'banker’s rule',
  ],
  ui: {
    principal: 'Principal (amount borrowed or invested)',
    rate: 'Annual interest rate',
    time: 'Time',
    'time.y': 'Time (years)',
    'time.m': 'Time (months)',
    'time.d': 'Time (days)',
    unit: 'Time in',
    'unit.y': 'Years',
    'unit.m': 'Months',
    'unit.d': 'Days',
    basis: 'Days in a year',
    'basis.365': '365 (actual/365)',
    'basis.360': '360 (banker’s rule)',
    'basis.help':
      'Some lenders divide by 360, which charges slightly more interest for the same number of days.',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.interest': 'Interest',
    'out.total': 'Total (principal plus interest)',
    'out.years': 'Time in years',
    explain: 'Interest is {i}, so the total is {total}.',
    'step.rate': 'Rate as a decimal.',
    'step.time': 'Time in years.',
    'step.interest': 'Interest: principal × rate × time, rounded to the cent.',
    'step.total': 'Total: principal plus interest.',
    rounding:
      'Interest is rounded half-up to the smallest currency unit. Some lenders always round interest up, which can differ by one cent.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Simple interest"
        where={[
          { symbol: 'I', meaning: 'interest' },
          { symbol: 'P', meaning: 'principal' },
          { symbol: 'r', meaning: 'annual rate as a decimal' },
          { symbol: 't', meaning: 'time in years' },
        ]}
      >
        {'I = P × r × t\ntotal = P + I'}
      </Formula>
      <p>
        Interest grows in a straight line: twice the time means twice the interest. That’s the
        difference from compound interest, where each period’s interest is added to the balance and
        earns interest itself.
      </p>
      <h3>Months and days</h3>
      <p>
        The rate is annual, so time must be in years. Four months is 4 ÷ 12 = 0.333 years. For days,
        divide by 365 (actual/365), or by 360 if the lender uses the banker’s rule. Dividing by 360
        makes each day a slightly larger fraction of a year, so the same loan costs about 1.4% more
        interest.
      </p>
      <h3>Where simple interest is used</h3>
      <p>
        Short-term business and personal loans, some car loans in the US, certificates of deposit
        that pay interest out rather than reinvesting it, and bonds’ coupon payments all use simple
        interest. Most savings accounts and mortgages compound instead.
      </p>
    </>
  ),
  examples: [
    {
      id: 'loan',
      title: '$4,000 at 5.5% for 4 years',
      body: (r, fmt) => (
        <p>
          I = 4,000 × 0.055 × 4 = <strong>{fmt.money(o(r, 'interest'))}</strong>, so the total to
          repay is {fmt.money(o(r, 'total'))}. Each year adds the same $220, because interest is
          never charged on interest.
        </p>
      ),
    },
    {
      id: 'months',
      title: 'A 4-month $20,000 loan at 6.75%',
      body: (r, fmt) => (
        <p>
          Time is 4 ÷ 12 of a year, so I = 20,000 × 0.0675 × 4/12 ={' '}
          <strong>{fmt.money(o(r, 'interest'))}</strong>, and the payoff is{' '}
          {fmt.money(o(r, 'total'))}.
        </p>
      ),
    },
    {
      id: 'days',
      title: 'Interest for 45 days on $6,500 at 12.6%',
      body: (r, fmt) => (
        <p>
          I = 6,500 × 0.126 × 45/365 = 100.9726, which rounds to{' '}
          <strong>{fmt.money(o(r, 'interest'))}</strong>. OpenStax’s version of this example rounds
          up to $100.98, as some lenders do. With a 360-day year, the same 45 days would cost
          $102.38.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the day count in the loan agreement.</strong> “Actual/365” and “actual/360”
        give different interest for the same loan. The 360 version charges 365 ÷ 360 times as much,
        about 1.4% more.
      </li>
      <li>
        <strong>Simple interest understates long-term growth.</strong> For savings left to grow for
        years, use the compound interest calculator. Simple interest is accurate only when interest
        is paid out or the term is short.
      </li>
      <li>
        <strong>Early repayment changes the interest.</strong> On a simple-interest loan, repaying
        early usually means paying interest only for the days the money was borrowed. Enter the
        actual number of days to see the saving.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for simple interest?',
      a: 'I = P × r × t: principal times the annual rate as a decimal times the time in years. $14,800 at 7.9% for 7 years gives 14,800 × 0.079 × 7 = $8,184.40 of interest, for a total of $22,984.40.',
    },
    {
      q: 'How is simple interest different from compound interest?',
      a: 'Simple interest is charged only on the original principal, so it grows by the same amount every year. Compound interest is charged on the principal plus earlier interest, so it grows faster. $1,000 at 5% for 10 years earns $500 simple interest but $628.89 compounded annually.',
    },
    {
      q: 'How do I calculate simple interest for a number of days?',
      a: 'Divide the days by 365 to get the time in years, then use I = P × r × t. For $6,500 at 12.6% over 45 days, I = 6,500 × 0.126 × 45 ÷ 365 = $100.97. Some lenders divide by 360 instead, which gives slightly more interest.',
    },
    {
      q: 'What is the banker’s rule?',
      a: 'It is the practice of computing daily interest as if a year had 360 days. Each day then counts as 1/360 of a year instead of 1/365, so the borrower pays about 1.4% more interest than with an actual/365 count for the same loan.',
    },
  ],
  ogSample: (r, fmt) => `Interest ${fmt.money(o(r, 'interest'))}`,
};
