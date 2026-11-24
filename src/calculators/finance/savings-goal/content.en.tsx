import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'payment') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Savings Goal Calculator',
  promise: 'How much to save each month, quarter or year to reach a target amount.',
  title: 'Savings Goal Calculator: How Much to Save Each Month',
  description:
    'Work out the monthly, quarterly or yearly amount you need to save to reach a savings goal by a date, with interest and an optional starting balance.',
  summary:
    'To reach a savings goal, you need regular deposits that, together with the interest they earn, add up to the target. The required deposit comes from the future value of an annuity, solved for the payment. Interest does more of the work the longer you save, so starting earlier lowers the deposit. Money you already have also grows and reduces what you need to add.',
  synonyms: [
    'how much should I save calculator',
    'monthly savings calculator',
    'savings plan calculator',
    'save for a house calculator',
    'sinking fund calculator',
    'target savings calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    goal: 'Savings goal',
    years: 'Years to save',
    rate: 'Annual interest rate (%)',
    'rate.help': 'The nominal yearly rate, compounded at the same frequency as your deposits.',
    freq: 'Deposit',
    'freq.12': 'Monthly',
    'freq.4': 'Quarterly',
    'freq.1': 'Yearly',
    'freq.help': 'How often you put money in. Interest compounds at the same frequency.',
    start: 'Already saved',
    timing: 'Deposits made',
    'timing.end': 'End of each period',
    'timing.begin': 'Start of each period',
    'out.payment.12': 'Save each month',
    'out.payment.4': 'Save each quarter',
    'out.payment.1': 'Save each year',
    'out.contributed': 'Total you put in',
    'out.interest': 'Interest earned',
    'out.periods': 'Number of deposits',
    'explain.12': 'Saving {pmt} a month for {years} years at {rate} reaches {goal}.',
    'explain.4': 'Saving {pmt} a quarter for {years} years at {rate} reaches {goal}.',
    'explain.1': 'Saving {pmt} a year for {years} years at {rate} reaches {goal}.',
    'explain.reached':
      'Your {start} already grows to {grown} by then, so no further deposits are needed.',
    'step.rate': 'Rate per period and number of deposits.',
    'step.start': 'Growth of the amount already saved.',
    'step.payment': 'Deposit = (goal − grown savings) × i ÷ ((1 + i)^N − 1).',
    'step.paymentBegin':
      'Deposits at the start of each period earn one extra period of interest, so divide by (1 + i).',
    'warn.years': 'The saving period is too short for even one deposit at this frequency.',
    'warn.reached': 'Your current savings reach the goal on their own at this rate.',
    rounding:
      'Computed in double precision; the deposit is rounded half-up to the smallest unit of the currency. Totals use the rounded deposit.',
  },
  HowItWorks: () => (
    <>
      <p>
        Regular deposits earning compound interest form an annuity. OpenStax{' '}
        <em>Contemporary Mathematics</em> gives its future value and, rearranged, the deposit needed
        for a goal:
      </p>
      <Formula
        label="Deposit needed"
        where={[
          { symbol: 'FV', meaning: 'savings goal' },
          { symbol: 'i', meaning: 'interest rate per period (annual rate ÷ deposits per year)' },
          { symbol: 'N', meaning: 'number of deposits' },
        ]}
      >
        {'pmt = FV × i ÷ ((1 + i)^N − 1)'}
      </Formula>
      <p>
        If you already have savings S, they grow to S × (1 + i)^N on their own, and only the rest of
        the goal needs new deposits. Deposits made at the start of each period earn one more period
        of interest, so they can be smaller by a factor of 1 + i.
      </p>
      <p>
        The book’s Example 6.73 asks how much Richard must invest each year at 12% to have $37,500
        in 10 years: $37,500 × 0.12 ÷ (1.12¹⁰ − 1) = $2,136.91.
      </p>
    </>
  ),
  examples: [
    {
      id: 'richard',
      title: '$37,500 in 10 years at 12%, saving yearly',
      body: (r, fmt) => (
        <p>
          1.12¹⁰ − 1 = 2.1058, and 4,500 ÷ 2.1058 = <strong>{fmt.money(o(r))} a year</strong>. Over
          ten years that is {fmt.money(o(r, 'contributed'))} of deposits, so interest supplies{' '}
          {fmt.money(o(r, 'interest'))} of the goal.
        </p>
      ),
    },
    {
      id: 'quarterly',
      title: 'Checking a quarterly plan',
      body: (r, fmt) => (
        <p>
          OpenStax’s Example 6.68 shows $1,300 a quarter for 5 years at 11.62% growing to
          $34,595.88. Entering that goal with quarterly deposits returns{' '}
          <strong>{fmt.money(o(r))}</strong>, confirming the calculation runs both ways.
        </p>
      ),
    },
    {
      id: 'house',
      title: 'A house deposit with savings already started',
      body: (r, fmt) => (
        <p>
          Goal $60,000 in 5 years, $10,000 already saved, 4% a year compounded monthly. The $10,000
          grows to about $12,210 by itself, so the monthly deposit needed is{' '}
          <strong>{fmt.money(o(r))}</strong>, rather than $905 with nothing saved.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Rates are not guaranteed.</strong> Savings rates change, and investments can lose
        value. Use a cautious rate, and recheck the plan once a year.
      </li>
      <li>
        <strong>Inflation raises the target.</strong> A goal priced in today’s money will cost more
        in five or ten years. Increase the goal if it is linked to prices.
      </li>
      <li>
        <strong>Automate the deposit.</strong> A standing transfer on payday makes the plan happen
        without relying on willpower each month.
      </li>
      <li>
        <strong>Tax can reduce interest.</strong> Interest outside tax-advantaged accounts may be
        taxed, which lowers the effective rate.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How much do I need to save each month to reach my goal?',
      a: 'Divide the goal by the number of months for a no-interest estimate, then let interest reduce it. Saving $20,000 in 3 years needs $555.56 a month with no interest, and $527.71 a month at 3.5% compounded monthly. Enter your goal, time and rate for your figure.',
    },
    {
      q: 'Does saving at the start of the month make a difference?',
      a: 'Yes, a little. A deposit made at the start of each period earns interest for one extra period, so the required amount is smaller by the factor 1 + i. At 4% a year compounded monthly, that is about 0.33% less each month.',
    },
    {
      q: 'What interest rate should I use?',
      a: 'Use the rate you can realistically expect on the account you will use, such as a savings account or a deposit account’s published rate. For investments, a cautious long-term assumption is safer than recent returns. Using 0% gives the most conservative plan.',
    },
    {
      q: 'What if I already have some money saved?',
      a: 'Enter it under More options. It grows at the same rate for the whole period, and only the remaining gap needs new deposits. If your current savings would already grow to the goal, the calculator tells you no more deposits are needed.',
    },
  ],
  ogSample: (r, fmt) => `Save ${fmt.money(o(r))} a year`,
};
