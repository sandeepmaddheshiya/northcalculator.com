import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'payment') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Auto Loan Calculator',
  promise: 'Your monthly car payment, with sales tax, fees, down payment and trade-in.',
  title: 'Auto Loan Calculator: Car Payment with Tax and Trade-In',
  description:
    'Estimate your monthly car payment from price, rate and term, including sales tax, fees, a down payment and a trade-in, plus total interest and cost.',
  summary:
    'A car loan finances the price of the car plus sales tax and dealer fees, minus your down payment and trade-in. The monthly payment then follows the standard loan formula: the amount financed, the monthly rate (APR ÷ 12) and the number of months. A longer term lowers the payment but increases the total interest you pay.',
  synonyms: [
    'car loan calculator',
    'car payment calculator',
    'vehicle loan calculator',
    'auto finance calculator',
    'monthly car payment',
    'car loan with trade-in',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    price: 'Car price',
    down: 'Down payment',
    tradeIn: 'Trade-in value',
    'tradeIn.help':
      'What the dealer pays for your current car, minus anything you still owe on it.',
    rate: 'Interest rate (APR %)',
    term: 'Loan term',
    'term.24': '24 months (2 years)',
    'term.36': '36 months (3 years)',
    'term.48': '48 months (4 years)',
    'term.60': '60 months (5 years)',
    'term.72': '72 months (6 years)',
    'term.84': '84 months (7 years)',
    taxRate: 'Sales tax (%)',
    taxOn: 'Sales tax is charged on',
    'taxOn.price': 'Full price',
    'taxOn.net': 'Price minus trade-in',
    'taxOn.help':
      'Places differ in whether the trade-in reduces the taxable price. Check your local rule.',
    fees: 'Fees added to the loan',
    'fees.help':
      'Title, registration, documentation and destination fees you finance rather than pay up front.',
    'out.payment': 'Monthly payment',
    'out.financed': 'Amount financed',
    'out.tax': 'Sales tax',
    'out.interest': 'Total interest',
    'out.totalCost': 'Total cost of the car',
    explain: '{pay} a month for {n} months repays {financed}, including {interest} of interest.',
    'explain.cash':
      'Your down payment and trade-in cover the whole cost, so there is nothing to finance.',
    'step.tax': 'Sales tax on the taxable price.',
    'step.financed': 'Amount financed = price + tax + fees − down payment − trade-in.',
    'step.payment': 'Monthly payment from the loan formula with the monthly rate (APR ÷ 12).',
    'warn.noLoan': 'Nothing needs to be financed with these numbers.',
    'warn.highRate':
      'This rate is high. Compare offers from banks and credit unions before signing.',
    rounding:
      'Money is calculated in cents. The payment is rounded half-up, each month’s interest is rounded, and the last payment absorbs the difference.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Amount financed">
        {'financed = price + sales tax + fees − down payment − trade-in'}
      </Formula>
      <p>
        OpenStax <em>Contemporary Mathematics</em> builds up the cost the same way: a $21,800 car
        with 6.75% sales tax ($1,471.50) and $1,206 of title, destination and documentation fees
        costs $24,477.50 before any down payment.
      </p>
      <Formula
        label="Monthly payment"
        where={[
          { symbol: 'P', meaning: 'amount financed' },
          { symbol: 'i', meaning: 'monthly rate, APR ÷ 12' },
          { symbol: 'n', meaning: 'number of monthly payments' },
        ]}
      >
        {'payment = P × i ÷ (1 − (1 + i)^−n)'}
      </Formula>
      <p>
        The book’s Example 6.100 finances $31,885 at 2.9% for 5 years: a payment of $571.52. The
        textbook always rounds payments up to the next cent; this calculator rounds to the nearest
        cent and settles the difference in the final payment, as most loan ledgers do, so results
        can differ by a cent.
      </p>
    </>
  ),
  examples: [
    {
      id: 'payment',
      title: '$31,885 at 2.9% for 5 years',
      body: (r, fmt) => (
        <p>
          The monthly rate is 0.029 ÷ 12 and there are 60 payments, giving{' '}
          <strong>{fmt.money(o(r))}</strong> a month, as in OpenStax’s Example 6.100. Over five
          years the interest adds {fmt.money(o(r, 'interest'))}.
        </p>
      ),
    },
    {
      id: 'totalCost',
      title: 'Tax and fees on a $21,800 car',
      body: (r, fmt) => (
        <p>
          6.75% sales tax is {fmt.money(o(r, 'tax'))}, and title, destination and documentation fees
          add $1,206. With nothing paid up front, the amount to finance is{' '}
          <strong>{fmt.money(o(r, 'financed'))}</strong>, OpenStax’s Example 6.98.
        </p>
      ),
    },
    {
      id: 'down',
      title: 'A $5,000 down payment on a $19,800 car',
      body: (r, fmt) => (
        <p>
          With 9.5% tax and $1,721.50 of fees the car costs $23,402.50; the $5,000 down payment
          leaves {fmt.money(o(r, 'financed'))} to finance (Example 6.99). At 4.5% over 6 years that
          is <strong>{fmt.money(o(r))}</strong> a month.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Compare the total, not just the payment.</strong> Stretching a loan from 60 to 84
        months lowers the payment but adds interest, and you may owe more than the car is worth for
        longer.
      </li>
      <li>
        <strong>Get a rate quote before visiting the dealer.</strong> A pre-approval from a bank or
        credit union gives you a rate to compare with dealer financing.
      </li>
      <li>
        <strong>Ask for the out-the-door price.</strong> Taxes and fees can add thousands. Make sure
        the price you enter includes everything you will finance.
      </li>
      <li>
        <strong>Trade-in equity can be negative.</strong> If you owe more on your current car than
        it is worth, the difference is often added to the new loan. Enter only positive equity as
        the trade-in value, and add any shortfall to fees.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How is a car payment calculated?',
      a: 'Work out the amount financed (price plus tax and fees, minus down payment and trade-in), then apply the loan formula with the monthly interest rate, APR ÷ 12, and the number of months. $20,000 at 6% for 60 months is $386.66 a month.',
    },
    {
      q: 'Is it better to choose a shorter or a longer loan?',
      a: 'A shorter loan has higher payments but less total interest. $25,000 at 7% costs $495.03 a month over 60 months with $4,701.82 of interest, or $377.32 over 84 months with $6,694.46 of interest. Choose the shortest term whose payment fits your budget.',
    },
    {
      q: 'Does a trade-in reduce sales tax?',
      a: 'In some places it does: tax is charged on the price minus the trade-in value. Elsewhere tax applies to the full price. The calculator lets you choose either; check with your state or local tax authority, or the dealer, for the rule that applies to you.',
    },
    {
      q: 'What fees can be financed with a car?',
      a: 'Title and registration, documentation fees, destination charges and sometimes extended warranties or add-ons. Financing them means paying interest on them for the life of the loan, so paying small fees up front saves money.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.money(o(r))} a month`,
};
