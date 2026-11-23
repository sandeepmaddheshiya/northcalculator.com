import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Date Calculator',
  promise: 'The date a number of days, weeks, months or years before or after another date.',
  title: 'Date Calculator: Add or Subtract Days, Weeks, Months',
  description:
    'Add or subtract days, weeks, months and years from a date to find a deadline, with the weekday, ISO week and a business-days option.',
  summary:
    'To find a date before or after another, the calculator applies years and months first, keeping the same day of the month, then adds or subtracts weeks and days. When the day doesn’t exist, such as 31 February, it uses the last day of that month. Business-day mode counts only Monday to Friday and does not skip public holidays.',
  synonyms: [
    'add days to date',
    'days from today',
    'date plus days',
    'subtract days from date',
    'weeks from today',
    'business days from date',
    'deadline calculator',
  ],
  ui: {
    start: 'Start date',
    op: 'Add or subtract',
    'op.add': 'Add',
    'op.sub': 'Subtract',
    years: 'Years',
    months: 'Months',
    weeks: 'Weeks',
    days: 'Days',
    business: 'Count days as business days (Monday to Friday)',
    'business.help':
      'Weekends are skipped. Public holidays are not, because they differ by country.',
    'out.result': 'Date',
    'out.weekday': 'Day of the week',
    'out.offset': 'Calendar days from the start date',
    'out.isoWeek': 'ISO week',
    explain: 'The date is {weekday}, {date}.',
    'step.months': 'Add the months (and years as 12 months each), keeping the day of the month.',
    'step.days': 'Add the weeks and days.',
    'step.business': 'Step through weekdays only, skipping Saturdays and Sundays.',
    'warn.clamped': 'That month has fewer days, so the date moved to its last day.',
    'warn.tooMany': 'Business-day counts are limited to 20,000 days.',
    rounding: 'No rounding: results are exact calendar dates in the Gregorian calendar.',
  },
  HowItWorks: () => (
    <>
      <p>
        Years and months are applied first, because they are calendar units of varying length.
        Adding one month moves to the same day of the next month. If that day doesn’t exist, the
        result is the last day of the month, so 31 January plus one month is 28 February (29 in a
        leap year). Weeks and days are then added as exact counts of 7 and 1 days.
      </p>
      <Formula label="Order of operations">
        {'1. date + (12 × years + months), same day of month or last day\n2. + 7 × weeks + days'}
      </Formula>
      <p>
        The order matters. 30 January plus one month and one day is 1 March when the month is
        applied first (28 February, then one day), but 28 February if the day is added first (31
        January, then one month). Python’s widely used dateutil library applies months first in the
        same way, and the calculator is tested against it.
      </p>
      <h3>Business days</h3>
      <p>
        With the business-day option, the days are counted on weekdays only: from a Friday, one
        business day later is the following Monday. Weeks are still calendar weeks.
      </p>
    </>
  ),
  examples: [
    {
      id: 'ninety',
      title: '90 days after 24 November 2026',
      body: (r, fmt) => (
        <p>
          Counting 90 days forward crosses the end of December, January and most of February. The
          result is <strong>{fmt.date(String(o(r, 'result')))}</strong>, a {String(o(r, 'weekday'))}
          .
        </p>
      ),
    },
    {
      id: 'monthEnd',
      title: 'One month after 31 January',
      body: (r, fmt) => (
        <p>
          February has no 31st, so one month after 31 January 2026 is{' '}
          <strong>{fmt.date(String(o(r, 'result')))}</strong>, the last day of February. In a leap
          year such as 2028, it would be 29 February.
        </p>
      ),
    },
    {
      id: 'business',
      title: '10 business days from Tuesday 24 November 2026',
      body: (r, fmt) => (
        <p>
          Skipping two weekends, ten weekdays later is{' '}
          <strong>{fmt.date(String(o(r, 'result')))}</strong>, which is {String(o(r, 'offset'))}{' '}
          calendar days away. This count does not skip public holidays. If one falls in the period,
          such as Thanksgiving in the US, add a day for it.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Months are not 30 days.</strong> “In 3 months” and “in 90 days” give different
        dates. Use months when an agreement says months, and days when it says days.
      </li>
      <li>
        <strong>Check whether the start day counts.</strong> Some deadlines count the day of the
        event as day 1. In that case, add one day fewer.
      </li>
      <li>
        <strong>For the gap between two dates, use the days-between-dates calculator.</strong> It
        counts days, weeks, months and weekdays between any two dates.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What date is 90 days from today?',
      a: 'Enter today as the start date and 90 days. The calculator counts 90 calendar days forward and shows the date and weekday. From 24 November 2026, 90 days later is Monday 22 February 2027. Months have different lengths, so 90 days is not the same as 3 months.',
    },
    {
      q: 'What is one month after 31 January?',
      a: 'There is no 31 February, so the calculator uses the last day of February: 28 February, or 29 February in a leap year. This is the convention most calendar software and date libraries use.',
    },
    {
      q: 'How do I add business days to a date?',
      a: 'Tick “count days as business days” under More options. The calculator then steps forward one weekday at a time, skipping Saturdays and Sundays. Ten business days from Tuesday 24 November 2026 is Tuesday 8 December. Public holidays are not skipped, so add one day for each.',
    },
    {
      q: 'What is an ISO week number?',
      a: 'ISO 8601 numbers weeks from Monday to Sunday, and week 1 is the week containing the year’s first Thursday. A date near New Year can belong to the previous or next year’s weeks: 1 January 2027 falls in week 53 of 2026.',
    },
  ],
  ogSample: (r, fmt) => `+90 days: ${fmt.date(String(r.outputs.result ?? ''))}`,
};
