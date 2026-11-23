import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Days Between Dates Calculator',
  promise: 'Days, weeks, months and weekdays between two dates.',
  title: 'Days Between Dates Calculator: Days, Weeks, Weekdays',
  description:
    'Count the days between two dates, optionally including the end date, and see the span in weeks and months plus weekdays and weekends.',
  summary:
    'The number of days between two dates is the later date minus the earlier one, counting the start date but not the end date, the way you would count nights. Tick “include the end date” to count both, which adds one. Weekdays are Monday to Friday. Public holidays are not removed, because they differ by country and region.',
  synonyms: [
    'date difference calculator',
    'how many days until',
    'how many days between',
    'day counter',
    'weeks between dates',
    'business days calculator',
    'working days between dates',
  ],
  ui: {
    start: 'Start date',
    end: 'End date',
    inclusive: 'Include the end date',
    'inclusive.help':
      'Counts both the first and the last day, as for a hotel stay counted in days rather than nights.',
    'out.days': 'Days',
    'out.weeks': 'In weeks',
    'out.ymd': 'In months and days',
    'out.weekdays': 'Weekdays (Monday to Friday)',
    'out.weekend': 'Weekend days',
    'out.hours': 'Hours',
    'unit.year.one': '{n} year',
    'unit.year.other': '{n} years',
    'unit.month.one': '{n} month',
    'unit.month.other': '{n} months',
    'unit.week.one': '{n} week',
    'unit.week.other': '{n} weeks',
    'unit.day.one': '{n} day',
    'unit.day.other': '{n} days',
    'fmt.weeks': '{w} and {d}',
    'fmt.plusOne': '(plus the end date)',
    explain: 'From {from} to {to} is {days}, not counting the end date.',
    'explain.inclusive': 'From {from} to {to} is {days}, counting both dates.',
    'step.dayNumbers': 'Number each date as days since 1 January 1970 and subtract.',
    'step.inclusive': 'Add one to include the end date.',
    'step.weekdays': 'Each full week has 5 weekdays; count the remaining days one by one.',
    'warn.swapped': 'The end date was before the start date, so the dates were swapped.',
    rounding:
      'No rounding: the count is exact in whole calendar days. Hours are days × 24 and ignore daylight-saving changes.',
  },
  HowItWorks: () => (
    <>
      <p>
        Each date is converted to a day number, a count of days from a fixed starting point, using
        the Gregorian calendar rules for leap years. Subtracting the two numbers gives the days
        between them. Because the calculation uses calendar dates rather than clock times, time
        zones and daylight-saving changes can’t shift the answer by a day.
      </p>
      <Formula label="Counting">
        {
          'days = day number(end) − day number(start)\ninclusive = days + 1\nweekdays = 5 × full weeks + weekdays in the remainder'
        }
      </Formula>
      <h3>Should the end date be included?</h3>
      <p>
        By default the count works like subtraction: 1 January to 2 January is 1 day. That suits
        deadlines, ages and “how many days until” questions. If you are counting days you are
        present, such as 2–6 March for a course, the end date belongs in the count, so tick “include
        the end date” to get 5 instead of 4.
      </p>
      <h3>Weekdays and holidays</h3>
      <p>
        Weekdays are Monday to Friday, the working week in most countries. Public holidays are not
        subtracted, because they vary by country, region and year. Take them off the weekday count
        yourself.
      </p>
    </>
  ),
  examples: [
    {
      id: 'year',
      title: 'From 1 January to 31 December 2026',
      body: (r) => (
        <p>
          2026 is not a leap year, so it has 365 days. Counting from 1 January to 31 December
          without the end date gives <strong>{String(o(r, 'days'))} days</strong>, which is{' '}
          {String(o(r, 'weeks'))}. Of those, {String(o(r, 'weekdays'))} are weekdays.
        </p>
      ),
    },
    {
      id: 'project',
      title: 'A project from Monday 2 March to Friday 26 June 2026',
      body: (r) => (
        <p>
          Counting both the first and last day, the project lasts{' '}
          <strong>{String(o(r, 'days'))} days</strong>, of which {String(o(r, 'weekdays'))} are
          weekdays. That is 17 full weeks of 5 working days. Subtract any public holidays in that
          period to get the working days.
        </p>
      ),
    },
    {
      id: 'leap',
      title: 'February in a leap year',
      body: (r) => (
        <p>
          2028 is divisible by 4 and is not a century year, so it is a leap year. From 1 February to
          1 March 2028 is <strong>{String(o(r, 'days'))} days</strong>. In 2100, which is a century
          year not divisible by 400, the same span is 28 days.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check how a deadline is counted.</strong> “Within 30 days” can mean 30 days after an
        event, or 30 days including the day it happened. Contracts and regulations usually say
        which. Use the inclusive option when the first day counts.
      </li>
      <li>
        <strong>For dates far in the past, check the calendar.</strong> The calculator uses the
        Gregorian calendar for all dates. Countries adopted it at different times, from 1582 to the
        20th century, so historical dates recorded in the Julian calendar need converting first.
      </li>
      <li>
        <strong>Add or subtract days with the date calculator.</strong> To find the date 90 days
        from today rather than the gap between two dates, use the date calculator.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the number of days between two dates?',
      a: 'Subtract the earlier date from the later one. The calculator converts both to day numbers using the Gregorian calendar and subtracts them, so leap years are handled automatically. From 1 January to 31 December 2026 is 364 days, or 365 if you include the end date.',
    },
    {
      q: 'Does the count include the start and end dates?',
      a: 'By default it counts the start date but not the end date, like subtracting dates: Monday to Tuesday is one day. Tick “include the end date” to count both, which adds one. Use this for spans you attend or occupy on both days, such as a course or event.',
    },
    {
      q: 'How many weekdays are there between two dates?',
      a: 'Count five weekdays for each full week, then add the weekdays in the remaining days. Monday 2 March to Friday 26 June 2026, inclusive, has 85 weekdays. Public holidays are not removed, so subtract the holidays that apply where you are.',
    },
    {
      q: 'Can daylight saving time change the number of days?',
      a: 'No. The calculator works with calendar dates, not clock times, so a 23-hour or 25-hour day at a daylight-saving change still counts as one day. Only the hours figure assumes 24 hours per day.',
    },
  ],
  ogSample: (r) => `${String(r.outputs.days)} days`,
};
