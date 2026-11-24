import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'hm') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Time Duration Calculator',
  promise: 'How long between two clock times, including times that cross midnight.',
  title: 'Time Duration Calculator: Hours and Minutes Between Times',
  description:
    'Find the time between two clock times in hours and minutes, decimal hours, minutes and seconds, including spans that run past midnight such as night shifts.',
  summary:
    'The duration between two clock times is the later time minus the earlier one. From 9:15 to 17:40 is 8 hours 25 minutes: count the whole hours, then the minutes, borrowing an hour when the minutes would go negative. If the end time is earlier than the start, the span crosses midnight, so 24 hours are added: 23:00 to 07:00 is 8 hours.',
  synonyms: [
    'time between two times',
    'elapsed time calculator',
    'hours between times',
    'how many hours from',
    'time difference calculator',
    'duration calculator',
  ],
  ui: {
    start: 'Start time',
    end: 'End time',
    nextDay: 'Ends on the next day',
    'nextDay.help':
      'Tick this for spans of more than 24 hours or when start and end are the same time a day apart.',
    'out.hm': 'Duration',
    'out.hours': 'Decimal hours',
    'out.minutes': 'Minutes',
    'out.seconds': 'Seconds',
    'fmt.h': '{n} h',
    'fmt.m': '{n} min',
    explain: 'From {a} to {b} is {hm}.',
    'explain.overnight': 'From {a} to {b} the next day is {hm}.',
    'step.minutes':
      'Subtract the start from the end in minutes, adding 24 hours if the end is on the next day.',
    'step.hours': 'Divide by 60 for decimal hours.',
    'warn.overnight': 'The end time is on the next day, so the span runs past midnight.',
    rounding: 'Exact to the minute; decimal hours are shown to 4 places.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Duration">
        {
          'minutes = (end − start) in minutes\nif end is earlier than start: add 24 × 60 = 1,440 minutes'
        }
      </Formula>
      <p>
        Times are turned into minutes after midnight, so 17:40 is 17 × 60 + 40 = 1,060 and 9:15 is
        555. The difference, 505 minutes, is 8 hours and 25 minutes. A day has 24 hours of 60
        minutes each, the units the SI accepts for everyday use.
      </p>
      <p>
        <strong>Decimal hours</strong> divide the minutes by 60, so 25 minutes is 0.4167 hours.
        Timesheets and payroll use decimal hours; clocks use hours and minutes.
      </p>
    </>
  ),
  examples: [
    {
      id: 'day',
      title: 'A working day from 9:15 to 17:40',
      body: (r) => (
        <p>
          From 9:15 to 17:15 is 8 hours; 25 more minutes to 17:40 gives{' '}
          <strong>{String(o(r))}</strong>, or {String(o(r, 'hours'))} decimal hours.
        </p>
      ),
    },
    {
      id: 'night',
      title: 'Overnight from 23:00 to 07:00',
      body: (r) => (
        <p>
          The end is earlier than the start, so the span crosses midnight: 1 hour to midnight plus 7
          hours after it is <strong>{String(o(r))}</strong>, {String(o(r, 'minutes'))} minutes.
        </p>
      ),
    },
    {
      id: 'short',
      title: 'From 13:50 to 14:35',
      body: (r) => (
        <p>
          Ten minutes to 14:00 and 35 after it make <strong>{String(o(r))}</strong>, which is{' '}
          {String(o(r, 'hours'))} hours as a decimal.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>12-hour times:</strong> 2:30 PM is 14:30. The time fields follow your device’s 12-
        or 24-hour setting.
      </li>
      <li>
        <strong>Several shifts?</strong> The hours worked calculator adds up a whole week and takes
        off breaks.
      </li>
      <li>
        <strong>Across dates:</strong> for spans of several days, use the days between dates or date
        calculators.
      </li>
      <li>
        <strong>Clock changes:</strong> on the night daylight saving time starts or ends, an
        overnight span is an hour shorter or longer than the clock difference.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the time between two times?',
      a: 'Subtract the start time from the end time, hours and minutes separately. If the minutes go negative, borrow 60 minutes from the hours. From 10:45 to 15:20: 15:20 is 14:80, and 14:80 − 10:45 = 4 hours 35 minutes.',
    },
    {
      q: 'How do I calculate hours across midnight?',
      a: 'Add 24 hours to the end time before subtracting, or count the time to midnight and the time after it separately. From 21:30 to 05:15 is 2 h 30 min before midnight plus 5 h 15 min after, which is 7 hours 45 minutes.',
    },
    {
      q: 'How do I turn hours and minutes into decimal hours?',
      a: 'Divide the minutes by 60 and add them to the hours. 4 hours 35 minutes is 4 + 35/60 = 4.583 hours. This is the form timesheets and pay calculations need, since 4.35 would mean 4 hours 21 minutes.',
    },
    {
      q: 'How many minutes are between two times?',
      a: 'Convert both to minutes after midnight and subtract. 08:20 is 500 minutes and 11:05 is 665, so the gap is 165 minutes, or 2 hours 45 minutes. The calculator shows the result in minutes and seconds too.',
    },
  ],
  ogSample: (r) => `9:15 to 17:40 = ${String(o(r))}`,
};
