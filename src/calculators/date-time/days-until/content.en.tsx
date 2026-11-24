import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'days') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Days Until Calculator',
  promise: 'A countdown to any date: days, weeks and working days to go.',
  title: 'Days Until Calculator: Countdown to Any Date in Days',
  description:
    'Count how many days are left until a birthday, holiday, deadline or trip, with the countdown in weeks, months and working days, or how long ago a past date was.',
  summary:
    'The days until a date is the target date minus today, counted in whole days: tomorrow is 1 day away. The calculator uses calendar dates, so time zones and clock changes cannot shift the count. It also breaks the countdown into weeks and days, years, months and days, and the number of Monday-to-Friday working days still to come.',
  synonyms: [
    'countdown calculator',
    'how many days until',
    'days left calculator',
    'days to go',
    'days since calculator',
    'countdown to date',
  ],
  ui: {
    target: 'Count down to',
    from: 'Counting from',
    'from.help': 'Today by default. Change it to count from another date.',
    'out.days': 'Days',
    'out.weeks': 'In weeks',
    'out.ymd': 'In years, months and days',
    'out.weekdays': 'Weekdays (Mon–Fri) in that time',
    'out.weekends': 'Weekend days in that time',
    'unit.year.one': '{n} year',
    'unit.year.other': '{n} years',
    'unit.month.one': '{n} month',
    'unit.month.other': '{n} months',
    'unit.week.one': '{n} week',
    'unit.week.other': '{n} weeks',
    'unit.day.one': '{n} day',
    'unit.day.other': '{n} days',
    'explain.until': '{date} is {n} away.',
    'explain.since': '{date} was {n} ago.',
    'explain.today': 'That date is today.',
    'step.subtract': 'Subtract the earlier date from the later one, using day numbers.',
    'step.weeks': 'Split into whole weeks and remaining days.',
    'warn.past': 'This date is in the past, so the result is the number of days since it.',
    rounding:
      'Whole calendar days, counted exactly with the Gregorian calendar; no hours or time zones are involved.',
  },
  HowItWorks: () => (
    <>
      <p>
        Each calendar date has a day number, a count of days from a fixed starting point. The days
        until a date is just the difference between two day numbers, so month lengths and leap years
        are handled automatically.
      </p>
      <Formula label="Days until">{'days = day number of target − day number of today'}</Formula>
      <p>
        Python’s documentation uses this as its example of counting days to an event: on 5 December
        2007, a birthday on 24 June 2008 is 202 days away. The count does not include today, so a
        date tomorrow is 1 day away and today is 0.
      </p>
      <p>
        The working-day figure counts Mondays to Fridays after today up to and including the target
        date. It does not remove public holidays; use the business days calculator for that.
      </p>
    </>
  ),
  examples: [
    {
      id: 'birthday',
      title: 'Python’s example: a birthday on 24 June',
      body: (r) => (
        <p>
          From 5 December 2007 to 24 June 2008 is <strong>{String(o(r))} days</strong>, or{' '}
          {String(o(r, 'weeks'))}. February 2008 had 29 days, which the count includes
          automatically.
        </p>
      ),
    },
    {
      id: 'newyear',
      title: 'Until New Year’s Day 2027',
      body: (r) => (
        <p>
          From 24 November 2026, 1 January 2027 is <strong>{String(o(r))} days</strong> away: 6 days
          left in November, 31 in December and the 1st itself. That includes{' '}
          {String(o(r, 'weekdays'))} weekdays.
        </p>
      ),
    },
    {
      id: 'since',
      title: 'How long since 1 January 2000?',
      body: (r, fmt) => (
        <p>
          Enter a past date and the calculator counts backwards: on 24 November 2026, the year 2000
          began <strong>{fmt.int(o(r) as number)} days</strong> ago, which is {String(o(r, 'ymd'))}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Sleeps versus days.</strong> Children often count “sleeps”: the number of nights
        until the day, which is the same as the days-until figure.
      </li>
      <li>
        <strong>Deadlines may count differently.</strong> Some rules include both the first and last
        day, or skip weekends and holidays. Check how your deadline is defined.
      </li>
      <li>
        <strong>Share the countdown.</strong> The page address keeps your target date, so you can
        bookmark it or send it to someone and it will count from their today.
      </li>
      <li>
        <strong>Time zones don’t matter here.</strong> The count changes at your local midnight,
        because it uses your device’s date.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many days until Christmas?',
      a: 'Set the target to 25 December. From 24 November there are 31 days to go: 6 left in November plus 25 in December. The calculator counts from your device’s current date, so the number updates each day when you return to the page.',
    },
    {
      q: 'Does the count include today?',
      a: 'No. The result is the number of days you have to wait: tomorrow is 1 day away, and the target date itself is the last day counted. If you want to count both today and the target day, add 1.',
    },
    {
      q: 'How do I count days since a past date?',
      a: 'Enter the past date as the target. The calculator notices it is before today and shows how many days ago it was, along with the same span in years, months and days and in weeks.',
    },
    {
      q: 'Are leap years included?',
      a: 'Yes. Every calendar day is counted, including 29 February in leap years. Under the Gregorian rule, years divisible by 4 are leap years except century years not divisible by 400, so 2000 was a leap year and 2100 will not be.',
    },
  ],
  ogSample: (r) => `${String(o(r))} days to go`,
};
