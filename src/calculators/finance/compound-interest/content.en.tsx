import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Compound Interest Calculator',
  promise:
    'Future balance, interest earned and effective annual yield, with monthly or yearly deposits.',
  title: 'Compound Interest Calculator with Monthly Deposits',
  description:
    'See how savings grow with compound interest: future value, interest earned, APY and doubling time, with monthly or yearly deposits and any compounding.',
  summary:
    'Compound interest pays interest on earlier interest as well as on your deposits. A single deposit grows to P × (1 + r/n)^(n × t), where r is the annual rate, n the compounding periods per year and t the years. Regular deposits each grow the same way from the day they are made. The effective annual yield, (1 + r/n)^n − 1, compares accounts that compound differently.',
  synonyms: [
    'savings calculator',
    'investment calculator',
    'future value calculator',
    'APY calculator',
    'interest calculator',
    'SIP calculator',
    'savings growth calculator',
  ],
  ui: {
    principal: 'Starting amount',
    rate: 'Annual interest rate',
    years: 'Years',
    comp: 'Compounding',
    'comp.annual': 'Annually',
    'comp.semiannual': 'Semi-annually',
    'comp.quarterly': 'Quarterly',
    'comp.monthly': 'Monthly',
    'comp.daily': 'Daily (365 days)',
    'comp.continuous': 'Continuously',
    add: 'Regular deposit',
    'add.monthly': 'Deposit each month',
    'add.annually': 'Deposit each year',
    freq: 'Deposit frequency',
    'freq.monthly': 'Monthly',
    'freq.annually': 'Yearly',
    timing: 'Deposits are made at the',
    'timing.end': 'End of each period',
    'timing.start': 'Start of each period',
    'timing.help': 'Depositing at the start gives each deposit one more period of interest.',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.fv': 'Future balance',
    'out.contrib': 'Total deposited (including the starting amount)',
    'out.interest': 'Interest earned',
    'out.apy': 'Effective annual yield (APY)',
    'out.double': 'Years for a single deposit to double',
    explain:
      'After {years} years you would have {fv}: {contrib} you put in plus {interest} of interest, which is {share} of the final balance.',
    'step.periodic': 'Rate per compounding period: the annual rate divided by {n}.',
    'step.growthCont': 'Growth of the starting amount with continuous compounding: P × e^(r × t).',
    'step.growth': 'Growth of the starting amount: P × (1 + r/n)^(n × t).',
    'step.annuity': 'Future value of the {n} deposits made at the end of each period.',
    'step.annuityDue':
      'Future value of the {n} deposits made at the start of each period (one extra period of growth).',
    'step.total': 'Interest earned: the final balance minus everything deposited.',
    'step.apy': 'Effective annual yield: the growth over one full year.',
    'chart.x': 'Year',
    'chart.balance': 'Balance',
    'chart.contrib': 'Total deposited',
    'chart.summary':
      'From year {year}, the interest earned so far is more than everything you have deposited. Interest is {share} of the final balance.',
    'chart.summaryNot':
      'Over this period your deposits stay larger than the interest earned. Interest is {share} of the final balance.',
    'table.caption': 'Balance at the end of each year',
    'table.year': 'Year',
    'table.contrib': 'Deposited to date',
    'table.interest': 'Interest to date',
    'table.balance': 'Balance',
    'warn.nothing': 'Enter a starting amount or a regular deposit.',
    rounding:
      'The balance is computed month by month without rounding and shown rounded half-up to the cent. A bank that rounds interest every period can differ by a few cents over many years.',
  },
  HowItWorks: () => (
    <>
      <p>
        When interest compounds, each period’s interest is added to the balance and earns interest
        itself from then on. For a single deposit the result has a closed form:
      </p>
      <Formula
        label="Single deposit"
        where={[
          { symbol: 'A', meaning: 'balance after t years' },
          { symbol: 'P', meaning: 'starting amount' },
          { symbol: 'r', meaning: 'annual interest rate as a decimal' },
          { symbol: 'n', meaning: 'compounding periods per year (1, 2, 4, 12 or 365)' },
          { symbol: 't', meaning: 'number of years' },
        ]}
      >
        {'A = P × (1 + r/n)^(n × t)\nA = P × e^(r × t)        (continuous)'}
      </Formula>
      <p>
        Regular deposits of the same size form an annuity. If each deposit is made at the end of a
        period with rate i per period:
      </p>
      <Formula label="Regular deposits">
        {'FV = D × ((1 + i)^k − 1) ÷ i\nFV(start of period) = FV × (1 + i)'}
      </Formula>
      <p>
        The calculator steps through every month at the monthly rate equivalent to your compounding,
        i = (1 + r/n)^(n/12) − 1. That gives exactly the textbook result at each compounding date.
        It also handles monthly deposits into an account that compounds quarterly or daily, which no
        single closed formula covers.
      </p>
      <h3>Effective annual yield</h3>
      <p>
        Two accounts quoting the same rate can pay different amounts if they compound differently.
        The effective annual yield, called APY in the US Truth in Savings rules, is the actual
        growth over one year: (1 + r/n)^n − 1, or e^r − 1 for continuous compounding. Compare
        savings accounts on APY.
      </p>
      <p>
        The doubling time shown is exact: ln 2 ÷ ln(1 + APY). The familiar rule of 72 (72 ÷ rate) is
        a shortcut that is accurate near 8% and drifts at very low or very high rates.
      </p>
    </>
  ),
  examples: [
    {
      id: 'cd',
      title: '$7,500 at 4.5% compounded quarterly for 10 years',
      body: (r, fmt) => (
        <p>
          The quarterly rate is 0.045 ÷ 4 = 0.01125, and there are 40 quarters. The balance grows to
          7,500 × 1.01125^40 = <strong>{fmt.money(o(r, 'fv'))}</strong>, so the deposit earns{' '}
          {fmt.money(o(r, 'interest'))} without any further deposits. The effective annual yield is{' '}
          {fmt.pct(o(r, 'apy'), 3)}, a little above the quoted 4.5% because the interest compounds
          four times a year.
        </p>
      ),
    },
    {
      id: 'monthly',
      title: 'Saving $250 a month at 3.75% for 8 years',
      body: (r, fmt) => (
        <p>
          With deposits at the end of each month and monthly compounding, i = 0.0375 ÷ 12 = 0.003125
          and there are 96 deposits. The future value is 250 × (1.003125^96 − 1) ÷ 0.003125 ={' '}
          <strong>{fmt.money(o(r, 'fv'))}</strong>. You deposit {fmt.money(o(r, 'contrib'))}, and
          interest adds {fmt.money(o(r, 'interest'))}.
        </p>
      ),
    },
    {
      id: 'college',
      title: 'Saving $2,500 a year from birth for college at 3.4%',
      body: (r, fmt) => (
        <p>
          One deposit a year, compounded annually, for 18 years: 2,500 × (1.034^18 − 1) ÷ 0.034 ={' '}
          <strong>{fmt.money(o(r, 'fv'))}</strong>. Of that, {fmt.money(o(r, 'contrib'))} is
          deposits and {fmt.money(o(r, 'interest'))} is interest. Making each deposit at the start
          of the year instead (open “More options”) adds one more year of growth to every deposit.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>The rate and time matter far more than the compounding frequency.</strong> $10,000
        at 5% for 10 years becomes $16,288.95 with annual compounding, $16,470.09 monthly, and
        $16,486.65 daily. Even continuous compounding only reaches $16,487.21.
      </li>
      <li>
        <strong>Starting early beats depositing more later.</strong> At 7% a year compounded
        monthly, $200 a month for 30 years grows to about $243,994 from $72,000 deposited. Over 20
        years the same deposits reach only $104,185, less than half, from two-thirds of the money.
      </li>
      <li>
        <strong>Use a realistic rate, after fees and inflation.</strong> For investments, returns
        vary year to year and are not guaranteed. A steady assumed rate shows the long-run
        arithmetic, not a forecast. Subtract fund fees from the rate, and subtract expected
        inflation to see the result in today’s money.
      </li>
      <li>
        <strong>Taxes reduce compounding.</strong> If interest is taxed each year, the rate that
        actually compounds is the after-tax rate. Use that rate for a taxable account.
        Tax-advantaged accounts, such as an ISA, a Roth IRA or a PPF, compound at the full rate.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for compound interest?',
      a: 'A = P × (1 + r/n)^(n × t), where P is the starting amount, r the annual rate as a decimal, n the number of compounding periods per year and t the years. $1,000 at 4% compounded annually for 3 years gives 1,000 × 1.04³ = $1,124.86. With regular deposits, each deposit is grown separately and added.',
    },
    {
      q: 'What is the difference between APR and APY?',
      a: 'APR is the quoted annual rate before compounding. APY, the effective annual yield, includes compounding: (1 + APR/n)^n − 1. A 5% rate compounded daily has an APY of about 5.13%. Savings accounts in the US must advertise APY, which makes accounts with different compounding directly comparable.',
    },
    {
      q: 'How long does it take money to double?',
      a: 'Exactly ln 2 ÷ ln(1 + APY) years. At 8% a year that is 9.01 years, and the rule of 72 (72 ÷ 8 = 9) is almost perfect. At 2% the rule says 36 years but the true figure is 35.0, so the shortcut drifts at low rates.',
    },
    {
      q: 'Does daily compounding make a big difference compared with monthly?',
      a: 'Very little. At 5%, monthly compounding gives an APY of 5.116% and daily 5.127%. On $10,000 over 10 years the gap is under $17. The interest rate and the number of years have a far larger effect than the compounding frequency.',
    },
    {
      q: 'Can I use this as a SIP or recurring deposit calculator?',
      a: 'Yes for the arithmetic of a fixed monthly investment at a fixed rate. Enter the monthly amount as the regular deposit, set the starting amount to zero, and choose the compounding your scheme uses. Market-linked SIP returns are not fixed, so treat the result as an illustration at the rate you entered.',
    },
    {
      q: 'Should deposits be at the start or the end of the month?',
      a: 'Choose whichever matches when the money actually goes in. A deposit at the start of a period earns one extra period of interest, so it ends slightly higher, by a factor of (1 + monthly rate). If you are unsure, use the end of the period, which gives the more conservative figure.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.money(o(r, 'fv'))} after 10 years`,
};
