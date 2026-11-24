import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Time Unit Converter',
  promise: 'Convert milliseconds, seconds, minutes, hours, days, weeks and years.',
  title: 'Time Unit Converter: Hours to Minutes, Seconds to Days',
  description:
    'Convert lengths of time between milliseconds, seconds, minutes, hours, days, weeks and years, as decimal values, for schedules, timesheets and science.',
  summary:
    'Time units are fixed multiples of the second: a minute is 60 seconds, an hour 3,600 and a day 86,400. A week is 7 days. Years vary in length, so this converter uses the Julian year of exactly 365.25 days, the average length that includes leap years. Results are decimal, so 1.5 hours shows as 90 minutes.',
  synonyms: [
    'hours to minutes',
    'minutes to hours',
    'seconds to minutes',
    'days to hours',
    'weeks to days',
    'seconds to years',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Time units in seconds">
        {
          '1 min = 60 s\n1 h = 60 min = 3,600 s\n1 d = 24 h = 86,400 s\n1 wk = 7 d = 604,800 s\n1 Julian year = 365.25 d = 31,557,600 s'
        }
      </Formula>
      <p>
        The minute, hour and day are listed by the BIPM as units accepted for use with the SI. The
        Julian year of 365.25 days is the average calendar year over a four-year leap cycle; the
        Gregorian calendar averages 365.2425 days, so for spans of centuries the two drift apart.
      </p>
      <p>
        To add hours and minutes, or show results as hours, minutes and seconds, use the time
        calculator instead; this page converts a single amount between units.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hours',
      title: '1.5 hours in minutes',
      body: (r, fmt) => (
        <p>
          1.5 × 60 = <strong>{fmt.sig(o(r))} minutes</strong>. Decimal hours on timesheets work the
          same way: 7.25 hours is 435 minutes, or 7 hours 15 minutes.
        </p>
      ),
    },
    {
      id: 'week',
      title: 'One week in hours',
      body: (r, fmt) => (
        <p>
          7 × 24 = <strong>{fmt.sig(o(r))} hours</strong>. A 40-hour working week is about 24% of
          all the hours in a week.
        </p>
      ),
    },
    {
      id: 'million',
      title: 'How long is a million seconds?',
      body: (r, fmt) => (
        <p>
          1,000,000 ÷ 86,400 = <strong>{fmt.sig(o(r), 6)} days</strong>, a little over 11½ days. A
          billion seconds is about 31.7 years.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Decimal versus clock time.</strong> 1.25 hours is 1 hour 15 minutes, not 1 hour 25
        minutes.
      </li>
      <li>
        <strong>Months are not fixed.</strong> They run from 28 to 31 days, so convert between dates
        with the date calculators instead.
      </li>
      <li>
        <strong>Leap seconds</strong> are occasionally added to clock time but do not change these
        unit definitions.
      </li>
      <li>
        <strong>Computing:</strong> timestamps often count milliseconds; divide by 1,000 for
        seconds.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert hours to minutes?',
      a: 'Multiply by 60. 2.5 hours is 150 minutes, and 0.75 hours is 45 minutes. To convert minutes to hours divide by 60, so 100 minutes is 1.667 hours, or 1 hour 40 minutes.',
    },
    {
      q: 'How many seconds are in a day?',
      a: 'There are 86,400 seconds in a day: 24 hours × 60 minutes × 60 seconds. A week has 604,800 seconds and a Julian year 31,557,600 seconds, so a billion seconds is about 31.7 years.',
    },
    {
      q: 'How many days are in a year?',
      a: 'A common year has 365 days and a leap year 366. This converter uses the Julian year of 365.25 days, the average over a four-year cycle. The Gregorian calendar’s average is slightly shorter, 365.2425 days, because it skips three leap days every 400 years.',
    },
    {
      q: 'How many weeks are in a year?',
      a: 'A 365-day year is 52 weeks and 1 day; a leap year is 52 weeks and 2 days. Using the Julian year of 365.25 days gives 52.18 weeks on average.',
    },
  ],
  ogSample: (r, fmt) => `1.5 h = ${fmt.sig(o(r))} min`,
};
