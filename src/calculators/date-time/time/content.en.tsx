import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Time Calculator',
  promise: 'Add or subtract hours, minutes and seconds, with the total in any unit.',
  title: 'Time Calculator: Add and Subtract Hours, Minutes, Seconds',
  description:
    'Add or subtract two lengths of time in days, hours, minutes and seconds. Get the answer in h:m:s and as decimal hours, total minutes or total seconds.',
  summary:
    'To add times, add the seconds, minutes, hours and days separately, then carry: every 60 seconds becomes a minute, every 60 minutes an hour and every 24 hours a day. Subtracting works the same way, borrowing 60 minutes from an hour when needed. The calculator converts both times to seconds, does the arithmetic, and converts the answer back.',
  synonyms: [
    'add time calculator',
    'hours and minutes calculator',
    'subtract time calculator',
    'time duration calculator',
    'hours calculator',
    'minutes to hours',
    'time addition',
  ],
  ui: {
    a: 'First time',
    b: 'Second time',
    'unit.days': 'Days',
    'unit.hours': 'Hours',
    'unit.minutes': 'Minutes',
    'unit.seconds': 'Seconds',
    op: 'Operation',
    'op.add': 'Add (+)',
    'op.sub': 'Subtract (−)',
    'out.result': 'Result',
    'out.hours': 'In hours',
    'out.minutes': 'In minutes',
    'out.seconds': 'In seconds',
    'out.days': 'In days',
    'fmt.d': '{n} d',
    'fmt.h': '{n} h',
    'fmt.m': '{n} min',
    'fmt.s': '{n} s',
    'explain.add': 'Together the two times come to {r}, or {hms} as hours:minutes:seconds.',
    'explain.sub': 'The difference is {r}, or {hms} as hours:minutes:seconds.',
    'step.seconds': 'Convert both times to seconds and add or subtract.',
    'step.split':
      'Split the seconds back into days (86,400 s), hours (3,600 s), minutes (60 s) and seconds.',
    'warn.negative':
      'The second time is longer than the first, so the result is negative. Swap them for a positive difference.',
    rounding:
      'Arithmetic is exact to the millisecond. Decimal hours are rounded to 6 places, minutes to 4. A day is always 24 hours here, so clock changes for daylight saving are not taken into account.',
  },
  HowItWorks: () => (
    <>
      <p>
        Time is not decimal: there are 60 seconds in a minute, 60 minutes in an hour and 24 hours in
        a day. Adding 1:45 and 0:30 as decimals gives 1.75 + 0.30, which is wrong. The calculator
        avoids this by working in seconds.
      </p>
      <Formula label="Total seconds">{'seconds = d × 86,400 + h × 3,600 + m × 60 + s'}</Formula>
      <p>
        After adding or subtracting, the total is split back into units, largest first, using
        whole-number division:
      </p>
      <Formula label="Back to days, hours, minutes and seconds">
        {'d = ⌊T ÷ 86,400⌋\nh = ⌊(T mod 86,400) ÷ 3,600⌋\nm = ⌊(T mod 3,600) ÷ 60⌋\ns = T mod 60'}
      </Formula>
      <p>
        <strong>Decimal hours.</strong> Timesheets and payroll often need hours as a decimal. Divide
        the minutes by 60: 4 h 15 min is 4 + 15 ÷ 60 = 4.25 hours, and 7 h 40 min is 7.667 hours,
        not 7.40.
      </p>
    </>
  ),
  examples: [
    {
      id: 'add',
      title: 'Adding 2 h 45 min and 1 h 30 min',
      body: (r) => (
        <p>
          Minutes first: 45 + 30 = 75 minutes, which is 1 hour and 15 minutes. Hours: 2 + 1 + the
          carried 1 = 4. The answer is <strong>{String(o(r))}</strong>, or {String(o(r, 'hours'))}{' '}
          hours as a decimal.
        </p>
      ),
    },
    {
      id: 'shift',
      title: 'Time left in an 8-hour shift after 3 h 25 min 40 s',
      body: (r) => (
        <p>
          Choose Subtract. 8:00:00 − 3:25:40 needs borrowing: take 1 hour as 60 minutes, then 1
          minute as 60 seconds, so 7:59:60 − 3:25:40 = <strong>{String(o(r))}</strong>.
        </p>
      ),
    },
    {
      id: 'weeks',
      title: 'How many minutes is 9 weeks?',
      body: (r, fmt) => (
        <p>
          Nine weeks is 63 days. Enter 63 in the days field. The total is{' '}
          <strong>{fmt.int(o(r, 'minutes') as number)} minutes</strong> (63 × 24 × 60), matching
          OpenStax Prealgebra’s Example 7.46.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Durations, not clock times.</strong> This adds lengths of time. To find the time
        between 9:15 and 17:40, subtract 9 h 15 min from 17 h 40 min: the answer is 8 h 25 min.
        Across midnight, add 24 hours to the later time first.
      </li>
      <li>
        <strong>Enter any amount in any field.</strong> 90 minutes or 200 seconds are fine: the
        result is normalized, so 0 h 90 min becomes 1 h 30 min.
      </li>
      <li>
        <strong>Daylight saving days are 23 or 25 hours.</strong> If you are measuring between two
        calendar dates and a clock change falls between them, adjust by an hour.
      </li>
      <li>
        <strong>Adding many times?</strong> Chain the calculations: add the first two, then enter
        the result as the first time and add the next.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I add hours and minutes?',
      a: 'Add the minutes and the hours separately. If the minutes total 60 or more, subtract 60 and add 1 to the hours. For 3 h 50 min + 2 h 25 min: 75 minutes is 1 h 15 min, and 3 + 2 + 1 = 6, so the total is 6 h 15 min.',
    },
    {
      q: 'How do I convert hours and minutes to decimal hours?',
      a: 'Divide the minutes by 60 and add the result to the hours. 7 h 30 min is 7.5 hours, 7 h 20 min is 7.333 hours, and 7 h 45 min is 7.75 hours. Timesheets often use this, so writing 7.45 for 7 h 45 min underpays by 18 minutes.',
    },
    {
      q: 'How do I subtract times that need borrowing?',
      a: 'When the minutes you subtract are larger, borrow an hour: reduce the hours by one and add 60 to the minutes. For 5 h 10 min − 2 h 35 min, rewrite it as 4 h 70 min − 2 h 35 min, which is 2 h 35 min.',
    },
    {
      q: 'How many seconds are in a day?',
      a: 'A day of 24 hours has 24 × 60 × 60 = 86,400 seconds, the value the International System of Units uses for the day. Occasionally a leap second is added to clock time, but that has no effect on durations you add here.',
    },
  ],
  ogSample: (r) => `2 h 45 min + 1 h 30 min = ${String(o(r))}`,
};
