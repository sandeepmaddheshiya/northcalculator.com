import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Business Days Calculator',
  promise: 'Count working days between two dates, or add working days to a date.',
  title: 'Business Days Calculator: Count or Add Working Days',
  description:
    'Count the working days between two dates, or find the date a number of business days away, skipping weekends and the public holidays you list.',
  summary:
    'Business days are the days a business is normally open: calendar days minus weekends and public holidays. To count them, take every day in the range, remove Saturdays and Sundays (or your own weekend days), and remove holidays that fall on a working day. Holidays differ by country, region and employer, so you can edit the list.',
  synonyms: [
    'working days calculator',
    'workday calculator',
    'business days between dates',
    'add business days',
    'weekdays calculator',
    'how many working days',
    'deadline calculator',
  ],
  ui: {
    mode: 'What do you want to do?',
    'mode.count': 'Count working days',
    'mode.add': 'Add working days',
    start: 'Start date',
    end: 'End date',
    days: 'Working days to add',
    'days.help': 'Counting starts the day after the start date. Use a negative number to go back.',
    weekend: 'Weekend',
    'weekend.satSun': 'Saturday and Sunday',
    'weekend.friSat': 'Friday and Saturday',
    'weekend.sun': 'Sunday only',
    'weekend.none': 'No weekend',
    holidays: 'Holidays to skip',
    'holidays.help':
      'Dates as YYYY-MM-DD, separated by commas or new lines. Pre-filled with the 2026 US federal holidays (OPM). Replace them with your own.',
    'out.result.count': 'Working days',
    'out.result.add': 'Date',
    'out.calendar': 'Calendar days',
    'out.weekendDays': 'Weekend days',
    'out.holidaysOff': 'Holidays on working days',
    'explain.count': 'There are {n} working days from {a} to {b}, counting both dates.',
    'explain.add': '{n} working days after {start} is {date}.',
    'explain.addBack': '{n} working days before {start} is {date}.',
    'step.calendar': 'Count every calendar day in the range, including both ends.',
    'step.subtract': 'Subtract weekend days and the holidays that fall on working days.',
    'step.add':
      'Step forward one day at a time, counting only working days, until {n} have passed.',
    'warn.badHoliday': 'Ignored {n} holiday entries that are not dates in YYYY-MM-DD form: {list}.',
    'warn.swapped': 'The end date was before the start date, so they were swapped.',
    'warn.span': 'The range is too long. Use dates less than 200 years apart.',
    rounding: 'Exact calendar arithmetic on dates, with no time zones or hours involved.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Working days in a range">
        {'working days = calendar days − weekend days − holidays on working days'}
      </Formula>
      <p>
        Both the start and the end date are counted, so 1–31 January is 31 calendar days. A holiday
        that falls on a weekend is not subtracted twice: it is already a non-working day.
      </p>
      <p>
        <strong>Adding working days</strong> works like a deadline: the start date is day zero, and
        each following working day counts as one. Ten business days after Friday 20 November 2026 is
        Monday 7 December, because the two weekends and Thanksgiving (26 November) are skipped.
      </p>
      <p>
        <strong>Observed holidays.</strong> When a fixed-date holiday lands on a weekend, many
        employers give the nearest weekday off instead. The US Office of Personnel Management lists
        Independence Day 2026, a Saturday, as observed on Friday 3 July, and the pre-filled list
        uses the observed dates.
      </p>
    </>
  ),
  examples: [
    {
      id: 'year',
      title: 'Working days in 2026 in the US',
      body: (r) => (
        <p>
          2026 has 365 days, of which 104 are Saturdays or Sundays, leaving 261 weekdays. All 11
          federal holidays (as observed) fall on weekdays, so a federal employee has{' '}
          <strong>{String(o(r))}</strong> working days. 2025 also has 250: 261 weekdays minus 11
          holidays.
        </p>
      ),
    },
    {
      id: 'deadline',
      title: 'A deadline of 10 business days',
      body: (r, fmt) => (
        <p>
          A notice served on Friday 20 November 2026 gives 10 business days to reply. Counting from
          Monday 23 November and skipping Thanksgiving and both weekends, the deadline is{' '}
          <strong>{fmt.date(String(o(r)))}</strong>, which spans {String(o(r, 'calendar'))} calendar
          days.
        </p>
      ),
    },
    {
      id: 'gulf',
      title: 'March 2026 with a Friday–Saturday weekend',
      body: (r) => (
        <p>
          Several countries in the Middle East and North Africa rest on Friday and Saturday. March
          2026 has 31 days, including 4 Fridays and 4 Saturdays, so with no holidays listed it has{' '}
          <strong>{String(o(r))}</strong> working days. Clear the holiday box and add your own
          public holidays before relying on the figure.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use your own holiday list.</strong> Public holidays depend on the country, the state
        or province, and the employer. Banks and courts may close on days your office does not.
      </li>
      <li>
        <strong>Legal deadlines have their own rules.</strong> Court rules and contracts define
        whether the first day counts and what happens when a deadline lands on a closed day. Check
        the rule that applies before relying on a date.
      </li>
      <li>
        <strong>Half days are not counted.</strong> Days like Christmas Eve, when offices close
        early, count as full working days here. Add them to the holiday list if they are days off.
      </li>
      <li>
        <strong>Shipping estimates</strong> usually count business days from the day after an order
        ships, which is what the add mode does.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many working days are in a year?',
      a: 'A year has 260 to 262 weekdays, depending on which day it starts on and whether it is a leap year. Subtract public holidays to get working days: with the 11 US federal holidays, both 2025 and 2026 have 250. Use your own country’s list to get the right figure where you work.',
    },
    {
      q: 'Does the count include the start and end dates?',
      a: 'Yes. Counting working days from Monday to Friday of the same week gives 5. When adding working days, the start date itself is not counted, so 1 business day after Monday is Tuesday, which matches how deadlines and delivery times are usually stated.',
    },
    {
      q: 'Are weekends always Saturday and Sunday?',
      a: 'No. Saudi Arabia, Egypt and several other countries rest on Friday and Saturday, and some workplaces have one rest day only. Choose the weekend that applies; the holiday list works with any of them.',
    },
    {
      q: 'What if a holiday falls on a weekend?',
      a: 'It is only removed once, since the day was already not a working day. Many employers give a substitute day off, usually the Friday before or the Monday after. List that observed date as the holiday, as the pre-filled US list does for Friday 3 July 2026.',
    },
    {
      q: 'Can I count business days backwards?',
      a: 'Yes. In the add mode, enter a negative number. For example, −5 from Friday 11 December 2026 gives Friday 4 December, which helps when you know a due date and need to work out when to start or when something must be sent.',
    },
  ],
  ogSample: (r) => `${String(o(r))} working days in 2026`,
};
