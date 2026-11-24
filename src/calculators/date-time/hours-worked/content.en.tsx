import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'hours') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Hours Worked Calculator',
  promise: 'Total your weekly hours from start and end times, with breaks and overtime pay.',
  title: 'Hours Worked Calculator: Time Card With Breaks and Overtime',
  description:
    'Add up hours worked from clock-in and clock-out times with unpaid breaks, including night shifts, and estimate weekly pay with overtime after 40 hours.',
  summary:
    'For each shift, hours worked are the time from start to finish minus any unpaid break: 9:00 to 17:30 with a 30-minute break is 8 hours. Shifts that end after midnight simply carry over. Adding the week gives total hours, shown both as hours and minutes and as decimal hours for payroll. With an hourly rate, hours over 40 can be paid at time and a half.',
  synonyms: [
    'time card calculator',
    'timesheet calculator',
    'work hours calculator',
    'hours calculator',
    'clock in clock out calculator',
    'overtime calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    days: 'Shifts this week',
    'days.help':
      'One row per shift. End times earlier than the start are treated as finishing after midnight.',
    'days.row': 'shift {n}',
    'days.add': 'Add a shift',
    'days.remove': 'Remove shift {n}',
    'col.start': 'Start',
    'col.end': 'End',
    'col.brk': 'Break (min)',
    rate: 'Hourly pay rate',
    'rate.help': 'Optional. Leave at 0 to total hours only.',
    otAfter: 'Overtime after (hours per week)',
    'otAfter.help':
      'US federal law (FLSA) requires overtime after 40 hours in a workweek for most employees.',
    otRate: 'Overtime multiple',
    'out.hours': 'Total hours (decimal)',
    'out.hm': 'Total in hours and minutes',
    'out.overtime': 'Overtime hours',
    'out.pay': 'Gross pay for the week',
    'fmt.h': '{n} h',
    'fmt.m': '{n} min',
    explain: 'You worked {hm} this week, which is {hours} hours as a decimal.',
    'explain.pay': 'You worked {hm} ({hours} decimal hours), for gross pay of {pay}.',
    'step.rows': 'Each shift: end − start − break (shifts past midnight wrap to the next day).',
    'step.total': 'Add the shifts and convert minutes to hours.',
    'step.pay': 'Regular hours at the hourly rate, overtime hours at the higher rate.',
    'table.caption': 'Hours for each shift',
    'table.n': 'Shift',
    'table.hours': 'Hours',
    'warn.empty': 'Enter at least one shift with a start and end time.',
    'warn.skipped': '{n} shift(s) without both times were left out.',
    'warn.break': 'The break on shift {n} is longer than the shift, so that shift counts as zero.',
    'warn.week':
      'Overtime is worked out on the total of all rows, as one workweek. US law does not allow averaging overtime across two weeks, so calculate each week separately.',
    rounding:
      'Minutes are counted exactly. Decimal hours are shown to 2 places, and pay is rounded half-up to the cent. Employers may round punch times under their own policy.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Each shift">{'hours = (end − start − break minutes) ÷ 60'}</Formula>
      <p>
        If the end time is earlier than the start, the shift ran past midnight, so 24 hours are
        added: 22:00 to 06:30 is 8½ hours before the break. Minutes become decimal hours by dividing
        by 60, so 7 h 45 min is 7.75 hours, not 7.45.
      </p>
      <Formula label="Pay with overtime">
        {'pay = rate × min(hours, 40) + rate × 1.5 × max(0, hours − 40)'}
      </Formula>
      <p>
        The US Department of Labor explains that, unless exempt, employees covered by the Fair Labor
        Standards Act must get at least time and one-half for hours over 40 in a workweek, that the
        workweek is a fixed period of seven consecutive days, and that hours may not be averaged
        over two or more weeks. Some states and other countries have different rules, such as daily
        overtime; change the threshold under More options if yours does.
      </p>
    </>
  ),
  examples: [
    {
      id: 'week',
      title: 'A standard week: 9:00 to 17:30, five days',
      body: (r, fmt) => (
        <p>
          Each day is 8½ hours minus a 30-minute break, so 8 hours. Five days make{' '}
          <strong>{String(o(r))} hours</strong>, and at $20 an hour that is{' '}
          {fmt.money(o(r, 'pay') as number)} before tax.
        </p>
      ),
    },
    {
      id: 'overtime',
      title: 'An extra Saturday morning',
      body: (r, fmt) => (
        <p>
          Adding 9:00 to 14:30 with a 30-minute break brings the week to{' '}
          <strong>{String(o(r))} hours</strong>, {String(o(r, 'overtime'))} of them overtime. Pay is
          40 × $20 + 5 × $30 = {fmt.money(o(r, 'pay') as number)}.
        </p>
      ),
    },
    {
      id: 'night',
      title: 'A night shift from 22:00 to 06:30',
      body: (r) => (
        <p>
          The shift crosses midnight: 2 hours before it and 6½ after, 8½ in all. Less a 30-minute
          break, that is <strong>{String(o(r, 'hm'))}</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Paid or unpaid breaks.</strong> Only enter breaks you are not paid for. Short rest
        breaks are often paid time; check your contract or local law.
      </li>
      <li>
        <strong>Use decimal hours for payroll.</strong> Payroll systems multiply decimal hours by
        the rate, so 37 h 30 min is entered as 37.5.
      </li>
      <li>
        <strong>One workweek at a time.</strong> Enter the shifts of a single workweek, as overtime
        is counted per week.
      </li>
      <li>
        <strong>Exempt employees</strong> on salary may not be owed overtime. The Department of
        Labor explains who is covered.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate hours worked?',
      a: 'For each shift subtract the start time from the end time, then subtract any unpaid break. From 8:15 to 16:45 is 8 h 30 min; minus a 45-minute lunch leaves 7 h 45 min, or 7.75 hours. Add the shifts to get the week.',
    },
    {
      q: 'How do I convert minutes to decimal hours?',
      a: 'Divide the minutes by 60. 15 minutes is 0.25 hours, 30 minutes 0.5, 45 minutes 0.75 and 20 minutes 0.333. So 6 hours 20 minutes is 6.33 hours. Writing it as 6.20 would underpay by 8 minutes.',
    },
    {
      q: 'How is overtime calculated?',
      a: 'Under the US federal rule, hours over 40 in a workweek are paid at least 1.5 times the regular rate. At $18 an hour, a 46-hour week pays 40 × $18 + 6 × $27 = $882. Some places add daily overtime or other rules.',
    },
    {
      q: 'How do I count a shift that ends after midnight?',
      a: 'Count it as running into the next day. From 23:00 to 07:00 is 8 hours: 1 hour before midnight and 7 after. The calculator does this automatically when the end time is earlier than the start.',
    },
  ],
  ogSample: (r) => `${String(o(r))} hours worked`,
};
