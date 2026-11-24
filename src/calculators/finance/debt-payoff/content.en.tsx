import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'months') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Debt Payoff Calculator',
  promise:
    'When you will be debt-free, and how much interest the snowball or avalanche method costs.',
  title: 'Debt Payoff Calculator: Snowball vs Avalanche Method',
  description:
    'Plan paying off credit cards and loans with the snowball (smallest balance first) or avalanche (highest interest first) method: debt-free date and interest.',
  summary:
    'Both methods pay the minimum on every debt and put any extra money toward one target debt. The snowball method targets the smallest balance first, so debts disappear quickly. The highest-interest-rate method, often called the avalanche, targets the most expensive debt first, which usually costs less in total. When a debt is paid off, its payment rolls over to the next one.',
  synonyms: [
    'debt snowball calculator',
    'debt avalanche calculator',
    'credit card payoff calculator',
    'debt free calculator',
    'pay off debt faster',
    'debt repayment planner',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    debts: 'Your debts',
    'debts.help':
      'One row per debt: current balance, interest rate (APR %) and minimum monthly payment.',
    'debts.row': 'debt {n}',
    'debts.add': 'Add a debt',
    'debts.remove': 'Remove debt {n}',
    'col.balance': 'Balance',
    'col.apr': 'APR %',
    'col.minimum': 'Minimum',
    extra: 'Extra each month',
    'extra.help': 'Money you can pay on top of all the minimums.',
    method: 'Method',
    'method.avalanche': 'Highest interest first (avalanche)',
    'method.snowball': 'Smallest balance first (snowball)',
    'out.months': 'Months until debt-free',
    'out.interest': 'Total interest paid',
    'out.otherMonths.avalanche': 'Months with the snowball method',
    'out.otherMonths.snowball': 'Months with the avalanche method',
    'out.otherInterest.avalanche': 'Interest with the snowball method',
    'out.otherInterest.snowball': 'Interest with the avalanche method',
    'out.order': 'Payoff order',
    'fmt.debt': 'Debt {n}',
    'explain.better':
      'You would be debt-free in {months} months ({y} years {m} months), paying {interest} of interest, {diff} less than the other method.',
    'explain.costlier':
      'You would be debt-free in {months} months ({y} years {m} months), paying {interest} of interest, {diff} more than the other method.',
    'step.budget': 'Monthly budget = all minimum payments + extra.',
    'step.avalanche':
      'Each month: add interest, pay every minimum, then put the rest on the debt with the highest APR.',
    'step.snowball':
      'Each month: add interest, pay every minimum, then put the rest on the debt with the smallest balance.',
    'warn.empty': 'Enter at least one debt with a balance above zero.',
    'warn.never':
      'These payments never clear the debts: the interest added each month is at least as large as what is being paid. Increase the payments.',
    rounding:
      'Simulated month by month in cents: interest is APR ÷ 12 on the balance, rounded to the cent. Real lenders may use daily balances, so actual totals differ slightly.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Each month">
        {
          '1. every balance grows by APR ÷ 12\n2. pay the minimum on every debt\n3. send the rest of the budget to the target debt'
        }
      </Formula>
      <p>
        The Consumer Financial Protection Bureau describes both approaches. The snowball method
        focuses on the smallest debt: you see progress quickly, but may pay more in the long run.
        The highest interest rate method focuses on the debts that cost the most and can save money
        over time.
      </p>
      <p>
        The budget stays the same throughout: when a debt is cleared, its minimum payment is added
        to the extra money and goes to the next target. That rolling payment is what speeds up the
        later debts. Interest here is a monthly approximation; card issuers usually charge on the
        average daily balance.
      </p>
    </>
  ),
  examples: [
    {
      id: 'avalanche',
      title: 'Three debts, highest rate first',
      body: (r, fmt) => (
        <p>
          $7,500 at 24.9%, $3,000 at 7.5% and $4,500 at 18.9%, with minimums of $190, $90 and $110
          plus $200 extra. Targeting the 24.9% card first clears everything in{' '}
          <strong>{String(o(r))} months</strong> with {fmt.money(o(r, 'interest') as number)} of
          interest. The snowball order would take {String(o(r, 'otherMonths'))} months.
        </p>
      ),
    },
    {
      id: 'snowball',
      title: 'The same debts, smallest balance first',
      body: (r, fmt) => (
        <p>
          Paying off the $3,000 loan first gives a quick win, but the expensive card keeps growing
          for longer: <strong>{String(o(r))} months</strong> and{' '}
          {fmt.money(o(r, 'interest') as number)} of interest,{' '}
          {fmt.money((o(r, 'interest') as number) - (o(r, 'otherInterest') as number))} more than
          the avalanche order.
        </p>
      ),
    },
    {
      id: 'single',
      title: 'One card: $5,000 at 18% with $200 a month',
      body: (r, fmt) => (
        <p>
          With one debt both methods are the same. It takes <strong>{String(o(r))} months</strong>{' '}
          and {fmt.money(o(r, 'interest') as number)} of interest; the loan formula gives 31.6
          months, so the 32nd payment is a smaller final one.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Pick the method you will stick with.</strong> The CFPB notes that the highest-rate
        method saves the most, while the snowball shows progress sooner. Either beats paying only
        the minimums.
      </li>
      <li>
        <strong>Keep paying every minimum.</strong> Missing minimum payments can add fees and hurt
        your credit, whichever method you choose.
      </li>
      <li>
        <strong>Avoid adding new debt.</strong> The plan only works if balances are not topped up
        while you pay them down.
      </li>
      <li>
        <strong>Ask about lower rates.</strong> A lower APR on your most expensive debt helps either
        method. Free credit counselling from a reputable non-profit can help you compare options.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between the debt snowball and avalanche?',
      a: 'Both pay the minimum on every debt and put extra money on one debt at a time. The snowball targets the smallest balance first, for quick wins. The avalanche targets the highest interest rate first, which usually costs less overall. The calculator shows both for your debts.',
    },
    {
      q: 'Which method saves more money?',
      a: 'Paying the highest-interest debt first saves the most interest, or ties when the smallest debt also has the highest rate. With the example debts here, it saves about $1,117 and two months compared with the snowball. The CFPB suggests choosing based on whether savings or quick progress motivates you more.',
    },
    {
      q: 'How long will it take to pay off my debt?',
      a: 'It depends on the balances, interest rates and how much you pay each month. Enter each debt and your extra payment and the calculator simulates every month. A single $5,000 card at 18% APR with $200 a month takes 32 months and costs about $1,314 in interest.',
    },
    {
      q: 'What if I can only pay the minimums?',
      a: 'Set the extra payment to zero. Paying only minimums often takes many years, and if a minimum does not cover the monthly interest the balance never falls; the calculator warns you when that happens. Even a small extra amount shortens the time considerably.',
    },
  ],
  ogSample: (r) => `Debt-free in ${String(o(r))} months`,
};
