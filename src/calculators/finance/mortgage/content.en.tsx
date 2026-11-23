import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';
import { compute } from './compute';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Mortgage Calculator',
  promise:
    'Monthly payment, total interest, payoff time with extra payments, and a full amortization schedule.',
  title: 'Mortgage Calculator: Payment, Interest and Amortization',
  description:
    'Calculate your monthly mortgage payment with taxes, insurance and PMI, see total interest, and find how much extra payments save. Full schedule as CSV.',
  summary:
    'A fixed-rate mortgage payment is the loan amount times the monthly interest rate, divided by one minus (1 + rate) raised to minus the number of payments. Each payment covers that month’s interest first and the rest reduces the balance, so early payments are mostly interest. Property tax, insurance, HOA dues and mortgage insurance are added on top when your lender collects them monthly.',
  synonyms: [
    'home loan calculator',
    'house payment calculator',
    'mortgage payment calculator',
    'amortization calculator',
    'PITI calculator',
    'mortgage payoff calculator',
    'extra payment calculator',
  ],
  ui: {
    price: 'Home price',
    down: 'Down payment',
    'down.help':
      'As a percentage of the price. 20% avoids mortgage insurance with most US lenders.',
    rate: 'Interest rate (annual)',
    years: 'Loan term (years)',
    extra: 'Extra payment each month',
    'extra.help':
      'Paid on top of the regular payment from the first month, straight off the balance.',
    tax: 'Property tax per year',
    ins: 'Home insurance per year',
    hoa: 'HOA or service charge per month',
    pmi: 'Mortgage insurance (PMI), % of loan per year',
    'pmi.help':
      'Applied only when the down payment is under 20%. Stops when the scheduled balance reaches 78% of the price.',
    comp: 'How interest compounds',
    'comp.monthly': 'Monthly (US, UK, India, most countries)',
    'comp.semiannual': 'Semi-annually (Canadian fixed-rate mortgages)',
    'comp.help':
      'Canadian lenders quote rates compounded twice a year, which lowers the effective monthly rate.',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.monthly': 'Monthly payment',
    'out.pi': 'Principal and interest',
    'out.taxMo': 'Property tax',
    'out.insMo': 'Home insurance',
    'out.hoaMo': 'HOA or service charge',
    'out.pmiMo': 'Mortgage insurance (PMI)',
    'out.loan': 'Loan amount',
    'out.downAmt': 'Down payment',
    'out.interest': 'Total interest',
    'out.total': 'Total of principal and interest payments',
    'out.payoff': 'Time to pay off',
    'out.saved': 'Interest saved by extra payments',
    'out.pmiMonths': 'PMI is paid for',
    'fmt.years': '{n} yr',
    'fmt.months': '{n} mo',
    'explain.base':
      'You borrow {loan} and pay {pi} a month for {n} months. Over the life of the loan that includes {interest} of interest.',
    'explain.extra':
      'Paying extra each month clears the loan {months} months early and saves {saved} of interest. Total interest falls to {interest}.',
    'step.loan': 'Loan amount: price minus the down payment.',
    'step.rate': 'Monthly interest rate: the annual rate divided by 12.',
    'step.rateSemi':
      'Monthly rate equivalent to semi-annual compounding: (1 + annual rate ÷ 2) to the power 1/6, minus 1.',
    'step.n': 'Number of monthly payments.',
    'step.payment': 'Level monthly payment, rounded to the cent.',
    'step.escrow': 'Add the monthly share of tax, insurance, HOA and PMI.',
    'step.interest': 'Total interest: everything paid minus the amount borrowed.',
    'step.extra': 'Interest saved by paying {extra} extra each month.',
    'chart.x': 'Year',
    'chart.balance': 'Remaining balance',
    'chart.interest': 'Interest paid to date',
    'chart.summary':
      'Half the loan is repaid by year {year}. Interest makes up {share} of everything you pay.',
    'table.caption': 'Amortization by year',
    'table.year': 'Year',
    'table.principal': 'Principal paid',
    'table.interest': 'Interest paid',
    'table.balance': 'Balance at year end',
    'csv.month': 'Month',
    'csv.payment': 'Payment',
    'csv.principal': 'Principal',
    'csv.interest': 'Interest',
    'csv.extra': 'Extra',
    'csv.balance': 'Balance',
    'warn.noLoan': 'With a 100% down payment there is nothing to borrow.',
    'warn.pmi':
      'With less than 20% down, most US lenders charge mortgage insurance. Add its rate under “More options” to include it (typically quoted by your lender as a % of the loan per year).',
    'warn.semi':
      'Semi-annual compounding is the Canadian convention. Elsewhere, lenders almost always compound monthly.',
    rounding:
      'Amounts are held in whole cents (or the currency’s smallest unit). The monthly payment and each month’s interest are rounded half-up to the cent, and the final payment clears whatever balance remains, so the schedule ends at exactly zero.',
  },
  HowItWorks: () => (
    <>
      <p>
        A fixed-rate mortgage is repaid in equal monthly payments. The payment is chosen so that,
        after the last one, the balance is exactly zero. This is the present value of an annuity
        solved for the payment, the same formula OpenStax uses in its worked mortgage examples.
      </p>
      <Formula
        label="Monthly principal and interest"
        where={[
          { symbol: 'M', meaning: 'monthly payment' },
          { symbol: 'L', meaning: 'loan amount (price minus down payment)' },
          { symbol: 'r', meaning: 'monthly interest rate (annual rate ÷ 12)' },
          { symbol: 'n', meaning: 'number of payments (years × 12)' },
        ]}
      >
        {'M = L × r ÷ (1 − (1 + r)^−n)'}
      </Formula>
      <p>
        Each month, interest is charged on the balance still owed: balance × r. The rest of the
        payment reduces the balance. Early on the balance is large, so most of the payment is
        interest. On a $320,000 loan at 6.5%, the first payment of $2,022.62 is $1,733.33 interest
        and only $289.29 principal. The amortization table shows that shift year by year.
      </p>
      <h3>Taxes, insurance, HOA and PMI</h3>
      <p>
        In the US, lenders usually collect property tax and home insurance monthly through an escrow
        account, so the payment you actually make is principal, interest, tax and insurance (PITI).
        This calculator divides the annual amounts by 12 and adds them, along with any HOA dues.
      </p>
      <p>
        Private mortgage insurance (PMI) is charged when you put down less than 20%. Under the US
        Homeowners Protection Act, the lender must cancel it automatically when the balance is
        scheduled to reach 78% of the home’s original value. The calculator uses the original
        schedule, without extra payments, to find that month, as the law does. You can ask to cancel
        at 80%, earlier than the automatic date.
      </p>
      <h3>Canadian mortgages</h3>
      <p>
        Canada’s Interest Act requires mortgage interest to be stated as calculated yearly or
        half-yearly, and fixed-rate lenders compound semi-annually. The equivalent monthly rate is
        (1 + annual rate ÷ 2)^(1/6) − 1, which is slightly lower than annual rate ÷ 12. Choose
        semi-annual compounding under “More options” for a Canadian mortgage.
      </p>
      <h3>What this calculator leaves out</h3>
      <p>
        It assumes a fixed rate for the whole term. It doesn’t model adjustable or variable rates,
        interest-only periods, closing costs, points, or a Canadian renewal at a new rate after a
        5-year term. The interest rate you enter is the note rate, not the APR, which also folds in
        fees.
      </p>
    </>
  ),
  examples: [
    {
      id: 'standard',
      title: 'A $400,000 home with 20% down at 6.5% for 30 years',
      body: (r, fmt) => (
        <p>
          The down payment is $80,000, so you borrow {fmt.money(o(r, 'loan'))}. The monthly rate is
          6.5% ÷ 12 = 0.0054167 over 360 payments, giving a payment of{' '}
          <strong>{fmt.money(o(r, 'pi'))}</strong>. Over 30 years you pay {fmt.money(o(r, 'total'))}{' '}
          in total, of which {fmt.money(o(r, 'interest'))} is interest, more than the amount
          borrowed.
        </p>
      ),
    },
    {
      id: 'extra',
      title: 'The same loan with $200 extra each month',
      body: (r, fmt) => (
        <p>
          Paying {fmt.money(200)} on top of the regular payment from the first month clears the loan
          after{' '}
          <strong>
            {fmt.int(o(r, 'payoff'))} payments ({fmt.int(Math.floor(o(r, 'payoff') / 12))} years{' '}
            {fmt.int(o(r, 'payoff') % 12)} months)
          </strong>{' '}
          instead of 360. Total interest falls to {fmt.money(o(r, 'interest'))}, which saves{' '}
          {fmt.money(o(r, 'saved'))}. The extra $200 a month adds up to{' '}
          {fmt.money(200 * o(r, 'payoff'))} paid in, and each extra dollar stops being charged 6.5%
          for the rest of the loan.
        </p>
      ),
    },
    {
      id: 'canada',
      title: 'A Canadian mortgage with semi-annual compounding',
      body: (r, fmt, inputs) => {
        const monthly = compute({ ...inputs, comp: 'monthly' }, { today: '', fmt });
        return (
          <p>
            A C$625,000 home with 20% down leaves a C$500,000 mortgage at 5%, amortized over 25
            years. Compounded semi-annually, the monthly rate is 1.025^(1/6) − 1 = 0.0041239, and
            the payment is <strong>{fmt.money(o(r, 'pi'))}</strong>. With monthly compounding at the
            same quoted rate, it would be {fmt.money(o(monthly, 'pi'))}, which is{' '}
            {fmt.money(o(monthly, 'pi') - o(r, 'pi'))} more each month. This is why a US calculator
            overstates a Canadian payment.
          </p>
        );
      },
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Compare terms by total interest, not just the payment.</strong> At 6.5%, $320,000
        over 15 years costs $2,787.54 a month against $2,022.62 over 30, but total interest is
        $181,757 instead of $408,141. 15-year loans also tend to carry lower rates, which widens the
        gap.
      </li>
      <li>
        <strong>Extra payments work best early.</strong> A dollar of principal repaid in year one
        stops accruing interest for the remaining 29 years. Check that your lender applies extra
        payments to principal and doesn’t charge a prepayment penalty, which some UK, Canadian and
        Indian fixed-rate loans do.
      </li>
      <li>
        <strong>The rate is not the APR.</strong> Lenders’ APR folds in origination fees and points,
        so it’s higher than the note rate. Compare offers using APR, and use the note rate here to
        work out the payment.
      </li>
      <li>
        <strong>Escrow amounts change.</strong> Property tax and insurance are reassessed, often
        yearly, so the total monthly payment can rise even on a fixed-rate loan. Only the
        principal-and-interest part is fixed.
      </li>
      <li>
        <strong>Not for adjustable or variable rates.</strong> For an ARM or a variable-rate loan,
        this shows the payment only while the initial rate lasts. Run it again at a higher rate to
        see what a reset would do.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How is a monthly mortgage payment calculated?',
      a: 'The principal-and-interest payment is M = L × r ÷ (1 − (1 + r)^−n), where L is the loan amount, r the monthly rate (annual rate ÷ 12) and n the number of monthly payments. For $320,000 at 6.5% over 30 years that is $2,022.62. Tax, insurance, HOA dues and PMI are then added if your lender collects them monthly.',
    },
    {
      q: 'Why is most of my early mortgage payment interest?',
      a: 'Interest each month is the balance times the monthly rate, and the balance is largest at the start. On a $320,000 loan at 6.5%, the first month’s interest is $1,733.33, so only $289.29 of a $2,022.62 payment reduces the balance. As the balance falls, the interest share shrinks and the principal share grows.',
    },
    {
      q: 'How much do extra mortgage payments save?',
      a: 'It depends on the rate and how early you start. On a $320,000, 30-year loan at 6.5%, an extra $200 a month from the first payment saves about $105,428 of interest and ends the loan 79 months early. Enter your own figures under “More options” to see the exact saving and payoff time.',
    },
    {
      q: 'When does PMI go away?',
      a: 'In the US, the Homeowners Protection Act requires lenders to end PMI automatically when your balance is scheduled to reach 78% of the home’s original value, if you are current on payments. You can request cancellation earlier, at 80%. Some loan types, such as FHA loans, have their own insurance rules.',
    },
    {
      q: 'Does this calculator work for UK, Indian or Canadian mortgages?',
      a: 'Yes for the payment maths. Choose your currency under “More options”. UK and Indian lenders compound monthly, like US lenders. For a Canadian fixed-rate mortgage, select semi-annual compounding. US-specific items such as PMI and escrow can be left at zero where they don’t apply.',
    },
    {
      q: 'What is the difference between the interest rate and the APR?',
      a: 'The interest rate (note rate) sets your monthly payment. The annual percentage rate (APR) also spreads lender fees and points over the loan, so it is higher and better for comparing offers. Enter the note rate here to calculate the payment.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.money(o(r, 'monthly'))} a month`,
};
