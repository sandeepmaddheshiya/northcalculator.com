import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'dti') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Debt-to-Income Ratio Calculator',
  promise: 'Your debt-to-income ratio, the figure lenders check before approving a loan.',
  title: 'Debt-to-Income Ratio Calculator: DTI for Mortgages and Loans',
  description:
    'Calculate your debt-to-income ratio (DTI) from gross income and monthly debts, see the housing-only ratio, and compare it with Fannie Mae’s mortgage limits.',
  summary:
    'Your debt-to-income ratio is all your monthly debt payments divided by your gross monthly income, the income before tax and deductions. With $2,000 of monthly debt payments and $6,000 of gross monthly income, DTI is 33%. Lenders use it to judge whether you can take on a new payment, and each loan type and lender sets its own limit.',
  synonyms: [
    'DTI calculator',
    'debt to income calculator',
    'mortgage DTI calculator',
    'front-end ratio calculator',
    'back-end ratio calculator',
    'debt ratio calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    income: 'Gross income (before tax)',
    'income.help': 'Total income of everyone on the application, before tax and deductions.',
    period: 'Income is per',
    'period.month': 'Month',
    'period.year': 'Year',
    housing: 'Rent or mortgage payment',
    'housing.help': 'For a mortgage, include property tax, insurance and HOA dues paid monthly.',
    auto: 'Car loan or lease payments',
    student: 'Student loan payments',
    cards: 'Credit card minimum payments',
    'cards.help': 'The minimum due each month, not the full balance.',
    other: 'Other monthly debts',
    'other.help': 'Personal loans, child support or alimony, and other recurring obligations.',
    'out.dti': 'Debt-to-income ratio',
    'out.frontEnd': 'Housing-only (front-end) ratio',
    'out.debt': 'Total monthly debt payments',
    'out.monthlyIncome': 'Gross monthly income',
    'out.roomTo36': 'Extra monthly debt before reaching 36%',
    'explain.low': 'Your {debt} of monthly debt is {dti} of your {income} gross monthly income.',
    'explain.mid': 'Your {debt} of monthly debt is {dti} of your {income} gross monthly income.',
    'explain.high': 'Your {debt} of monthly debt is {dti} of your {income} gross monthly income.',
    'explain.over': 'Your {debt} of monthly debt is {dti} of your {income} gross monthly income.',
    'info.low':
      'This is within Fannie Mae’s 36% maximum for manually underwritten conventional mortgages. Other lenders and loan types set their own limits.',
    'info.mid':
      'Above 36%: Fannie Mae allows up to 45% on manually underwritten loans only when credit score and reserve requirements are met.',
    'info.high':
      'Above 45%: within Fannie Mae’s 50% maximum for loans assessed by its Desktop Underwriter system, but above its manual-underwriting limits.',
    'info.over':
      'Above 50%, the highest total DTI Fannie Mae allows. Reducing debt or adding income would be needed for most conventional mortgages.',
    'step.monthly': 'Convert yearly income to a monthly figure.',
    'step.debt': 'Add up the monthly debt payments.',
    'step.ratio': 'Divide total monthly debt by gross monthly income.',
    'warn.income': 'Enter an income above zero.',
    rounding: 'Ratios are rounded half-up to 4 decimal places and shown to 1; money to the cent.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Debt-to-income ratio">
        {'DTI = total monthly debt payments ÷ gross monthly income × 100'}
      </Formula>
      <p>
        The Consumer Financial Protection Bureau’s example: a $1,500 mortgage payment, a $100 car
        payment and $400 of other debts make $2,000 a month. On $6,000 of gross monthly income the
        DTI is 2,000 ÷ 6,000 = 33%.
      </p>
      <p>
        <strong>Front-end and back-end.</strong> Mortgage lenders sometimes also look at the housing
        payment alone as a share of income, the front-end ratio. The total DTI above is the back-end
        ratio, and it is the one Fannie Mae’s rules use.
      </p>
      <p>
        <strong>Limits.</strong> Fannie Mae’s Selling Guide sets a maximum total DTI of 36% of
        stable monthly income for manually underwritten loans, up to 45% when the borrower meets
        credit score and reserve requirements, and 50% for loans assessed through its Desktop
        Underwriter system. Government-backed loans and other lenders have their own rules.
      </p>
    </>
  ),
  examples: [
    {
      id: 'cfpb',
      title: 'The CFPB example: $2,000 of debt on $6,000 a month',
      body: (r, fmt) => (
        <p>
          $1,500 + $100 + $400 = $2,000 of monthly debt, and $2,000 ÷ $6,000 gives a DTI of{' '}
          <strong>{fmt.pct(o(r), 1)}</strong>, which CFPB rounds to 33%. The housing payment alone
          is {fmt.pct(o(r, 'frontEnd'), 0)} of income.
        </p>
      ),
    },
    {
      id: 'annual',
      title: 'A household earning $84,000 a year',
      body: (r, fmt) => (
        <p>
          $84,000 a year is $7,000 a month. Payments of $2,100 (mortgage), $450 (car), $300 (student
          loan) and $150 (cards) total $3,000, a DTI of <strong>{fmt.pct(o(r), 1)}</strong>. That is
          above 36%, so under Fannie Mae’s manual underwriting it would need to meet the extra
          requirements for ratios up to 45%.
        </p>
      ),
    },
    {
      id: 'room',
      title: 'How big a new payment fits under 36%?',
      body: (r, fmt) => (
        <p>
          With $7,500 of monthly income, 36% is $2,700. Existing debts of $700 leave{' '}
          <strong>{fmt.money(o(r, 'roomTo36'))}</strong> a month for a new housing payment before
          the ratio reaches 36%.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use gross income.</strong> DTI uses income before tax, so it understates how much of
        your take-home pay goes to debt. Check the payment against your own budget too.
      </li>
      <li>
        <strong>Count minimum payments, not balances.</strong> For credit cards, use the minimum due
        on your statement. Monthly bills like utilities and phone plans are not debts in DTI.
      </li>
      <li>
        <strong>Paying off small debts helps.</strong> Clearing a loan with a few payments left, or
        a card balance, can lower DTI quickly before you apply.
      </li>
      <li>
        <strong>Limits vary.</strong> Government-backed mortgages, other lenders and other countries
        use different rules. Ask your lender which limit applies to your application.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate my debt-to-income ratio?',
      a: 'Add up your monthly debt payments, such as rent or mortgage, car loan, student loans, credit card minimums and other loans, and divide by your gross monthly income. $2,000 of payments on $6,000 of income is 33%.',
    },
    {
      q: 'What is a good debt-to-income ratio?',
      a: 'Lower is better. Fannie Mae allows a total DTI of up to 36% for manually underwritten conventional mortgages, up to 45% with strong credit and reserves, and up to 50% through its automated underwriting. Other lenders and loan types set different limits.',
    },
    {
      q: 'Does DTI use gross or net income?',
      a: 'Gross income, before taxes and deductions, as the CFPB definition states. Because take-home pay is lower, a 36% DTI can mean that half or more of your take-home pay goes to debt payments, so also check your actual budget.',
    },
    {
      q: 'What is the difference between front-end and back-end DTI?',
      a: 'The front-end ratio counts only housing costs, such as the mortgage payment with taxes and insurance. The back-end ratio counts all monthly debt payments including housing. Most lending rules, including Fannie Mae’s, are based on the back-end, total ratio.',
    },
  ],
  ogSample: (r, fmt) => `DTI ${fmt.pct(o(r), 1)}`,
};
