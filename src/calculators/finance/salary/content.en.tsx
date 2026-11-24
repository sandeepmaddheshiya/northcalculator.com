import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Hourly to Salary Calculator',
  promise: 'Convert pay between hourly, daily, weekly, biweekly, monthly and annual amounts.',
  title: 'Hourly to Salary Calculator: Hourly, Monthly and Annual Pay',
  description:
    'Convert an hourly wage to an annual salary or a salary to an hourly rate, with daily, weekly, biweekly, semimonthly and monthly pay. Hours are editable.',
  summary:
    'To turn an hourly wage into an annual salary, multiply it by the hours you work each week and by the weeks you are paid each year. A 40-hour week for 52 weeks is 2,080 hours, so $25 an hour is $52,000 a year. To go from salary to hourly, divide by the same number of hours. These figures are gross pay, before tax and deductions.',
  synonyms: [
    'salary to hourly calculator',
    'hourly wage to annual salary',
    'annual salary to hourly',
    'wage calculator',
    'paycheck converter',
    'monthly salary to hourly',
    'how much is $20 an hour per year',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    amount: 'Pay',
    per: 'Paid per',
    'per.hour': 'Hour',
    'per.day': 'Day',
    'per.week': 'Week',
    'per.biweek': 'Two weeks (biweekly)',
    'per.semimonth': 'Half month (semimonthly)',
    'per.month': 'Month',
    'per.year': 'Year',
    hours: 'Hours worked per week',
    days: 'Days worked per week',
    weeks: 'Paid weeks per year',
    'weeks.help':
      'A calendar year has 52.18 weeks on average (365.25 ÷ 7). Lower it for unpaid time off. US federal pay uses 2,087 hours a year, which is 40 × 52.175.',
    'out.result.hour': 'Annual salary',
    'out.result.day': 'Annual salary',
    'out.result.week': 'Annual salary',
    'out.result.biweek': 'Annual salary',
    'out.result.semimonth': 'Annual salary',
    'out.result.month': 'Annual salary',
    'out.result.year': 'Hourly rate',
    'out.hour': 'Hourly',
    'out.day': 'Daily',
    'out.week': 'Weekly',
    'out.biweek': 'Biweekly (every two weeks)',
    'out.semimonth': 'Semimonthly (twice a month)',
    'out.month': 'Monthly',
    'out.year': 'Annual',
    explain:
      'At {hours} hours a week for {weeks} weeks, {hour} an hour is {year} a year, before tax.',
    'step.toYear.hour': 'Multiply the hourly rate by the hours in a year ({n}).',
    'step.toYear.day': 'Multiply the daily rate by the working days in a year ({n}).',
    'step.toYear.week': 'Multiply the weekly pay by the paid weeks in a year ({n}).',
    'step.toYear.biweek': 'Multiply the biweekly pay by the pay periods in a year ({n}).',
    'step.toYear.semimonth': 'Multiply the semimonthly pay by 24 pay periods.',
    'step.toYear.month': 'Multiply the monthly pay by 12.',
    'step.hoursYear': 'Hours in a year = hours per week × paid weeks per year.',
    'step.fromYear': 'Hourly rate = annual pay ÷ hours in a year.',
    'warn.hours':
      'More than 60 hours a week. If overtime is paid at a higher rate, the annual figure here is too low, because it assumes one rate for every hour.',
    'warn.days': 'The hours per week don’t fit in the days per week. Check both values.',
    rounding:
      'The annual figure is kept exact. Each pay period is then rounded half-up to the smallest unit of the currency, the rule OPM uses for hourly rates.',
  },
  HowItWorks: () => (
    <>
      <p>
        Every conversion goes through the annual figure. The calculator multiplies your pay by the
        number of those periods in a year, then divides the annual figure by the number of the
        period you want.
      </p>
      <Formula
        label="Hourly and annual pay"
        where={[
          { symbol: 'h', meaning: 'hours worked per week' },
          { symbol: 'w', meaning: 'paid weeks per year' },
        ]}
      >
        {'annual = hourly × h × w\nhourly = annual ÷ (h × w)'}
      </Formula>
      <Formula label="Periods per year">
        {
          'day = days per week × w    week = w    two weeks = w ÷ 2\nhalf month = 24    month = 12    year = 1'
        }
      </Formula>
      <p>
        The US Office of Personnel Management computes federal hourly rates by dividing annual pay
        by 2,087 hours, the average number of paid hours in a year, and rounding to the nearest
        cent. Setting 40 hours and 52.175 weeks reproduces that rule. Its 2024 table lists GS-13
        step 1 at $88,520 a year and $42.41 an hour.
      </p>
      <h3>Biweekly is not the same as semimonthly</h3>
      <p>
        Biweekly pay comes every two weeks, which is 26 paychecks in a 52-week year. Semimonthly pay
        comes twice a month, 24 paychecks. On the same salary, each semimonthly check is larger, but
        there are two fewer of them.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hourly',
      title: '$25 an hour, full time',
      body: (r, fmt) => (
        <p>
          At 40 hours a week for 52 weeks, you work 2,080 hours a year, and 2,080 × $25 ={' '}
          <strong>{fmt.money(o(r, 'result'))}</strong>. Divided by 12, that is{' '}
          {fmt.money(o(r, 'month'))} a month before tax. A quick rule of thumb is to double the
          hourly rate and add three zeros: $25 becomes $50,000, a slight underestimate.
        </p>
      ),
    },
    {
      id: 'federal',
      title: 'A US federal salary of $88,520',
      body: (r, fmt) => (
        <p>
          Choose “Year”, then set 40 hours and 52.175 paid weeks under “More options”, which gives
          OPM’s 2,087-hour year. $88,520 ÷ 2,087 = 42.4149…, which rounds to{' '}
          <strong>{fmt.money(o(r, 'result'))}</strong>, the hourly rate printed in OPM’s 2024 GS
          table for grade 13, step 1.
        </p>
      ),
    },
    {
      id: 'monthly',
      title: 'A monthly salary of $4,500',
      body: (r, fmt) => (
        <p>
          $4,500 × 12 = <strong>{fmt.money(o(r, 'result'))}</strong> a year. Over 2,080 working
          hours, that is {fmt.money(o(r, 'hour'))} an hour. A month is not four weeks: it averages
          4.33 weeks, so dividing $4,500 by 160 hours would overstate the hourly rate at $28.13.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>This is gross pay.</strong> Income tax, social security, pension contributions and
        health premiums come out before you are paid. How much lower your take-home pay is depends
        on where you live and what you contribute.
      </li>
      <li>
        <strong>Paid time off changes the comparison.</strong> A salaried job with paid holidays
        pays for 52 weeks. An hourly contract without them may only pay for the weeks you work, so
        lower the paid weeks to compare offers fairly.
      </li>
      <li>
        <strong>Benefits are part of the pay.</strong> Employer pension matches, health cover and
        bonuses don’t show in an hourly rate. When comparing a contract rate with a salary, add the
        value of the benefits you would lose.
      </li>
      <li>
        <strong>Overtime is paid differently.</strong> In the US, the Fair Labor Standards Act
        requires most hourly workers to get 1.5 times their rate after 40 hours in a week. Enter 40
        hours and add overtime pay separately.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How much is $20 an hour per year?',
      a: 'At 40 hours a week for 52 weeks, $20 an hour is $41,600 a year before tax, or about $3,467 a month. At 37.5 hours a week it is $39,000. Without paid holidays, if you work 50 weeks a year, it drops to $40,000.',
    },
    {
      q: 'How many working hours are in a year?',
      a: 'A 40-hour week for 52 weeks is 2,080 hours. Because a year is 52 weeks and one or two days, the long-run average is closer to 2,087, the figure the US federal government uses. Hours actually worked are lower once holidays and leave are taken, but those are usually paid hours.',
    },
    {
      q: 'How do I convert my salary to an hourly rate?',
      a: 'Divide your annual salary by the hours you are paid for in a year. For $60,000 at 40 hours a week and 52 weeks, divide by 2,080 to get $28.85 an hour. If you regularly work longer unpaid hours, divide by your real hours instead to see your effective rate.',
    },
    {
      q: 'Is biweekly pay the same as twice a month?',
      a: 'No. Biweekly means every two weeks, which gives 26 paychecks a year, and occasionally a month with three. Twice a month, or semimonthly, gives exactly 24. On a $52,000 salary, a biweekly check is $2,000 and a semimonthly check is $2,166.67.',
    },
    {
      q: 'Why does dividing my monthly pay by 160 give the wrong hourly rate?',
      a: 'Because 160 hours assumes a month is exactly four weeks. A year has 52 weeks, so a month averages 52 ÷ 12 = 4.33 weeks, about 173 hours at 40 hours a week. Dividing by 160 overstates the hourly rate by about 8%.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.money(o(r, 'result'))} a year`,
};
