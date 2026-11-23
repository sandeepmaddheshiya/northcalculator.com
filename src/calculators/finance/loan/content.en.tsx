import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Loan Calculator',
  promise:
    'Monthly payment (EMI), total interest, the true APR with fees, and a repayment schedule.',
  title: 'Loan Calculator: EMI, Total Interest and APR with Fees',
  description:
    'Work out the monthly payment (EMI) on a personal, car or other fixed-rate loan, the total interest, the APR including fees, and a full repayment schedule.',
  summary:
    'An equated monthly instalment (EMI) is the fixed payment that repays a loan, with interest on the reducing balance, over a set number of months: P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where r is the annual rate ÷ 12. If the lender deducts a fee up front, you receive less, so the true rate (APR) is higher than the quoted rate.',
  synonyms: [
    'EMI calculator',
    'personal loan calculator',
    'car loan calculator',
    'auto loan calculator',
    'loan payment calculator',
    'loan EMI',
    'APR calculator',
    'amortization schedule',
  ],
  ui: {
    amount: 'Loan amount',
    rate: 'Interest rate (annual, reducing balance)',
    term: 'Loan term',
    'term.y': 'Loan term (years)',
    'term.m': 'Loan term (months)',
    unit: 'Term in',
    'unit.y': 'Years',
    'unit.m': 'Months',
    fee: 'Upfront fees (processing or origination)',
    'fee.help': 'Fees deducted from the loan or paid at the start. Used to work out the true APR.',
    extra: 'Extra payment each month',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.payment': 'Monthly payment (EMI)',
    'out.interest': 'Total interest',
    'out.total': 'Total of all payments',
    'out.apr': 'APR including fees',
    'out.ear': 'Effective annual rate including fees (APRC)',
    'out.received': 'Amount you actually receive',
    'out.payoff': 'Time to repay with extra payments',
    'out.saved': 'Interest saved by extra payments',
    'fmt.years': '{n} yr',
    'fmt.months': '{n} mo',
    'explain.base':
      'You pay {payment} a month for {n} months. Interest adds {interest} to what you borrowed.',
    'explain.fee':
      'You pay {payment} a month for {n} months. Because the fee is taken up front, the loan really costs {apr} a year, not {rate}.',
    'step.rate': 'Monthly rate: the annual rate divided by 12.',
    'step.n': 'Number of monthly payments.',
    'step.payment': 'Equated monthly instalment, rounded to the cent.',
    'step.first':
      'First month’s interest: the full balance times the monthly rate. The rest of the payment repays principal.',
    'step.interest': 'Total interest: everything you pay minus the amount borrowed.',
    'step.apr':
      'Find the monthly rate i at which the payments are worth exactly what you received ({received}), then annualise it.',
    'chart.xYear': 'Year',
    'chart.xMonth': 'Month',
    'chart.balance': 'Balance owed',
    'chart.interest': 'Interest paid to date',
    'chart.summary':
      'Interest is {first} of the first payment and {share} of everything you repay.',
    'table.captionYear': 'Repayment schedule by year',
    'table.captionMonth': 'Repayment schedule by month',
    'table.year': 'Year',
    'table.month': 'Month',
    'table.paid': 'Paid',
    'table.principal': 'Principal',
    'table.interest': 'Interest',
    'table.balance': 'Balance',
    'csv.extra': 'Extra',
    'warn.noLoan': 'Enter a loan amount above zero.',
    'warn.tooLong': 'Terms longer than 600 months (50 years) are not supported.',
    'warn.feeTooBig': 'The fees are as large as the loan itself. Check the amounts.',
    'warn.highRate':
      'This rate is unusually high. Check it is an annual rate on the reducing balance. A monthly or flat rate entered here gives a very wrong answer.',
    rounding:
      'Amounts are held in the currency’s smallest unit. The EMI and each month’s interest are rounded half-up to that unit, and the last payment absorbs any remaining difference so the balance ends at exactly zero. APR is solved numerically to better than 0.0001%.',
  },
  HowItWorks: () => (
    <>
      <p>
        Interest is charged each month on the balance still owed (a reducing-balance loan). The
        level payment that brings the balance to exactly zero after n months is:
      </p>
      <Formula
        label="Equated monthly instalment"
        where={[
          { symbol: 'P', meaning: 'amount borrowed' },
          { symbol: 'r', meaning: 'monthly rate = annual rate ÷ 12' },
          { symbol: 'n', meaning: 'number of monthly payments' },
        ]}
      >
        {'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)'}
      </Formula>
      <p>
        This is algebraically the same as the mortgage formula P × r ÷ (1 − (1 + r)^−n). Each month,
        interest = balance × r. The rest of the EMI reduces the balance, so the interest part
        shrinks and the principal part grows over time.
      </p>
      <h3>APR when there are fees</h3>
      <p>
        Suppose a lender deducts a processing fee from the loan. You receive less than P but still
        repay the full EMI schedule. The annual percentage rate (APR) answers what interest rate
        makes those payments worth exactly the amount you received. US Regulation Z defines APR as
        that monthly rate times 12:
      </p>
      <Formula label="APR (US, Regulation Z Appendix J)">
        {'P − fees = Σ EMIₖ ÷ (1 + i)^k  for k = 1…n\nAPR = 12 × i'}
      </Formula>
      <p>
        The EU and UK quote the annual percentage rate of charge (APRC), which compounds the monthly
        rate instead: (1 + i)^12 − 1. For the same loan it is slightly higher. This calculator shows
        both whenever you enter a fee.
      </p>
      <h3>What it doesn’t cover</h3>
      <p>
        It assumes a fixed rate, monthly payments and interest on the reducing balance. It ignores
        insurance bundled into the loan, taxes on fees (such as India’s GST on processing charges),
        payment holidays and late-payment charges.
      </p>
    </>
  ),
  examples: [
    {
      id: 'car',
      title: 'A $31,885 car loan at 2.9% for 5 years',
      body: (r, fmt) => (
        <p>
          The monthly rate is 2.9% ÷ 12 = 0.0024167, over 60 payments. The EMI formula gives{' '}
          <strong>{fmt.money(o(r, 'payment'))}</strong> a month, which matches OpenStax’s worked
          example. Over five years you repay {fmt.money(o(r, 'total'))}, so the loan costs{' '}
          {fmt.money(o(r, 'interest'))} in interest, about 7.5% of the amount borrowed.
        </p>
      ),
    },
    {
      id: 'fee',
      title: 'A ₹5 lakh personal loan at 11% with a ₹10,000 processing fee',
      body: (r, fmt) => (
        <p>
          Over 36 months the EMI is <strong>{fmt.money(o(r, 'payment'))}</strong>. The lender
          deducts the ₹10,000 fee, so you receive {fmt.money(o(r, 'received'))} but repay{' '}
          {fmt.money(o(r, 'total'))}. The monthly rate at which those 36 payments are worth
          ₹4,90,000 is about 1.034%, so the APR is <strong>{fmt.pct(o(r, 'apr'), 2)}</strong>, not
          11%. Compounded annually, it is {fmt.pct(o(r, 'ear'), 2)}. Compare loan offers on this
          figure, not on the headline rate.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check whether the rate is flat or reducing.</strong> Some lenders, especially for
        car and consumer loans in South Asia, quote a flat rate, charging interest on the original
        amount for the whole term. A 10% flat rate over 3 years on ₹5,00,000 means an EMI of
        ₹18,055.56, which equals a reducing-balance rate of about 17.9%. Convert to the reducing
        rate before using this calculator.
      </li>
      <li>
        <strong>A longer term lowers the EMI but raises total interest.</strong> At 9%, $25,000
        costs $794.99 a month over 3 years or $518.96 over 5 years. The 5-year loan’s lower payment
        comes with roughly 70% more interest. Pick the shortest term whose payment you can
        comfortably meet.
      </li>
      <li>
        <strong>Ask how prepayments are applied.</strong> This calculator applies extra payments to
        principal and keeps the EMI fixed, so the loan ends early. Some lenders reduce the EMI
        instead, and some charge a prepayment or foreclosure fee. Both change the saving.
      </li>
      <li>
        <strong>Include every upfront fee to see the APR.</strong> Processing, origination,
        documentation and mandatory insurance premiums all reduce what you actually receive. A
        small-looking 2% fee on a short loan adds more than one percentage point to the APR.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is EMI and how is it calculated?',
      a: 'EMI stands for equated monthly instalment: the fixed amount you pay each month until the loan is repaid. It is P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan, r the monthly rate (annual rate ÷ 12) and n the number of months. ₹5,00,000 at 11% over 36 months gives an EMI of ₹16,369.36.',
    },
    {
      q: 'How does a processing fee change the cost of a loan?',
      a: 'The fee means you receive less money but repay the same EMIs, so the effective rate rises. A ₹10,000 fee on a ₹5,00,000, 36-month loan at 11% raises the APR to about 12.40%. Enter the fee under “More options” to see the APR for your own loan.',
    },
    {
      q: 'What is the difference between APR and the interest rate?',
      a: 'The interest rate determines your EMI. The APR is the single annual rate that accounts for both interest and upfront fees, so it reflects the true cost of borrowing and lets you compare offers with different fees. Without fees, the two are the same.',
    },
    {
      q: 'Why does the UK or EU APR differ from the US APR for the same loan?',
      a: 'US Regulation Z multiplies the monthly rate by 12, a nominal rate. The EU and UK APRC compounds it, (1 + monthly rate)^12 − 1, an effective rate. For the ₹5,00,000 example, the US-style APR is 12.40% and the APRC is 13.13%. Both describe the same loan.',
    },
    {
      q: 'Is it better to prepay a loan or invest the money?',
      a: 'Prepaying earns you the loan’s interest rate with no risk, because every extra unit of principal stops being charged interest. If you can’t reliably earn more than that rate after tax elsewhere, prepaying usually wins. Check for prepayment charges first, and keep an emergency fund.',
    },
    {
      q: 'What is a flat interest rate, and how do I convert it?',
      a: 'A flat rate charges interest on the original loan amount for the whole term, even as you repay it. It looks cheaper than it is. A 10% flat rate on a 3-year loan costs about the same as a 17.9% reducing-balance rate. Use the reducing-balance rate in this calculator.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.money(o(r, 'payment'))} per month`,
};
