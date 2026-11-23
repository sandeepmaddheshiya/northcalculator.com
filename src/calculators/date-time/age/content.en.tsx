import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Age Calculator',
  promise: 'Exact age in years, months and days, plus total days, weeks and your next birthday.',
  title: 'Age Calculator: Exact Age in Years, Months and Days',
  description:
    'Find your exact age in years, months and days from your date of birth, your age on any date, total days and weeks, and the days until your next birthday.',
  summary:
    'Your age is the number of complete years since your date of birth, then the complete months since your last birthday, then the remaining days. The calculator counts calendar dates, not 24-hour blocks, so time zones and daylight saving can’t shift the result. For people born on 29 February, you can choose whether the birthday falls on 28 February or 1 March in other years.',
  synonyms: [
    'how old am I',
    'date of birth calculator',
    'age in days',
    'birthday calculator',
    'chronological age calculator',
    'age on a date',
    'days since birth',
  ],
  ui: {
    dob: 'Date of birth',
    asOf: 'Age on this date',
    'asOf.help': 'Defaults to today. Change it to find someone’s age on a past or future date.',
    rule: 'Birthday for 29 February births in common years',
    'rule.feb28': '28 February',
    'rule.mar1': '1 March',
    'rule.help': 'Jurisdictions differ. 28 February is the most common convention.',
    'out.age': 'Age',
    'out.months': 'Total months',
    'out.weeks': 'Total weeks',
    'out.days': 'Total days',
    'out.next': 'Next birthday',
    'out.until': 'Days until next birthday',
    'out.weekday': 'Day of the week you were born',
    'unit.year.one': '{n} year',
    'unit.year.other': '{n} years',
    'unit.month.one': '{n} month',
    'unit.month.other': '{n} months',
    'unit.week.one': '{n} week',
    'unit.week.other': '{n} weeks',
    'unit.day.one': '{n} day',
    'unit.day.other': '{n} days',
    'fmt.ymd': '{y}, {m}, {d}',
    'fmt.weeks': '{w} and {d}',
    explain: 'Born on {weekday}, {dob}. The next birthday is {next}, in {until}.',
    'explain.birthday': 'Happy birthday. Born on {weekday}, {dob}. The next birthday is {next}.',
    'step.years': 'Count whole years up to the most recent birthday.',
    'step.months': 'Count whole months from that birthday, keeping the same day of the month.',
    'step.days': 'Count the remaining days.',
    'step.total': 'Total days between the two dates, divided into weeks.',
    'warn.future': 'The date of birth is after the “age on” date. Check both dates.',
    'warn.leap':
      'Born on 29 February: in common years the birthday is taken as the date chosen under “More options”. Legal rules differ between countries, so check locally if the date matters for a legal age.',
    rounding:
      'No rounding: whole years, months and days are counted on the calendar. Totals are exact day counts between the two dates.',
  },
  HowItWorks: () => (
    <>
      <p>
        Age is counted the way people state it: whole years first, then whole months, then days. The
        calculator works on calendar dates (year, month, day) in the Gregorian calendar, the system
        that ISO 8601 standardises, rather than on clock time. A birth just before midnight in one
        time zone can’t change the answer.
      </p>
      <Formula label="Steps">
        {
          'years  = complete years to the most recent birthday\nmonths = complete months after that birthday\ndays   = days left over\ntotal days = date − date of birth'
        }
      </Formula>
      <h3>Months of different lengths</h3>
      <p>
        A month step keeps the day of the month you were born on. When that day doesn’t exist in the
        target month, it uses the month’s last day. Someone born on 31 January is one month old on
        28 February (29 in a leap year), and one month and one day old on 1 March. This matches
        common date libraries and the way most people count.
      </p>
      <h3>Leap years and 29 February</h3>
      <p>
        A year is a leap year if it is divisible by 4, except century years, which must be divisible
        by 400. So 2000 was a leap year and 1900 wasn’t. For people born on 29 February, the
        birthday in a common year is usually taken as 28 February, so the age changes on the last
        day of February. Some legal systems use 1 March instead. You can choose either rule.
      </p>
    </>
  ),
  examples: [
    {
      id: 'basic',
      title: 'Born 15 May 1990, age on 24 November 2026',
      body: (r, fmt) => (
        <p>
          The most recent birthday was 15 May 2026, which gives 36 complete years. From 15 May to 15
          November is 6 complete months, and from 15 to 24 November is 9 days:{' '}
          <strong>{String(o(r, 'age'))}</strong>. That is {fmt.int(o(r, 'months') as number)} months
          or {fmt.int(o(r, 'days') as number)} days in total. 15 May 1990 was a{' '}
          {String(o(r, 'weekday'))}.
        </p>
      ),
    },
    {
      id: 'monthEnd',
      title: 'From 31 January to 1 March',
      body: (r) => (
        <p>
          A baby born on 31 January 2025 has no “31 February” to reach, so the first month ends on
          28 February, the last day of that month. On 1 March the age is{' '}
          <strong>{String(o(r, 'age'))}</strong>, which is {String(o(r, 'days'))} days in total.
          Counting days alone hides this: 29 days is less than the 31 days of January, yet a full
          calendar month has passed.
        </p>
      ),
    },
    {
      id: 'leap',
      title: 'A 29 February birthday in a common year',
      body: (r, fmt) => (
        <p>
          Someone born on 29 February 2000 turns 25 in 2025, a year without 29 February. With the 28
          February rule, their age on 28 February 2025 is <strong>{String(o(r, 'age'))}</strong>,
          which is {fmt.int(o(r, 'months') as number)} months. With the 1 March rule, they are still
          24 that day, at 24 years, 11 months and 30 days, and turn 25 the next morning.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>For legal ages, check the local rule.</strong> Eligibility for school, retirement or
        alcohol can depend on the exact rule a country uses, including for 29 February births and
        for whether the birthday itself counts. Treat the result as arithmetic, not legal advice.
      </li>
      <li>
        <strong>Some cultures count age differently.</strong> Traditional East Asian age reckoning
        starts at one at birth and adds a year at the new year. South Korea adopted international
        age for most legal purposes in 2023. This calculator gives the international age.
      </li>
      <li>
        <strong>Use “age on this date” for past and future dates.</strong> Enter a historical date
        to find someone’s age when an event happened, or a future date to see how old you will be at
        a deadline.
      </li>
      <li>
        <strong>Totals in days are exact, totals in months are not.</strong> Months vary from 28 to
        31 days, so “438 months” is a count of calendar months. Don’t multiply it by 30.44 to get
        days. Use the total-days figure, which is an exact count.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate my exact age?',
      a: 'Count the complete years to your most recent birthday, then the complete months since that birthday, then the remaining days. Someone born on 15 May 1990 is 36 years, 6 months and 9 days old on 24 November 2026. The calculator does this from your date of birth, using today’s date unless you choose another.',
    },
    {
      q: 'How old is someone born on 29 February in a non-leap year?',
      a: 'Most systems treat 28 February as the birthday in common years, so the age changes on the last day of February. Some jurisdictions use 1 March instead. Both conventions give the same age on every other day of the year, and the calculator lets you choose.',
    },
    {
      q: 'How many days old am I?',
      a: 'The calculator shows the exact number of days between your date of birth and today (or the date you choose). It counts calendar days, so leap days are included automatically. A person born on 15 May 1990 is 13,342 days old on 24 November 2026.',
    },
    {
      q: 'Why does a month sometimes have only 28 or 29 days in the result?',
      a: 'Months are counted on the calendar, keeping your birth day of the month. If you were born on the 31st and a month has only 28, 29 or 30 days, that month ends on its last day. That’s why a baby born on 31 January is one month old on 28 February.',
    },
    {
      q: 'Does the time of birth or my time zone change the result?',
      a: 'No. The calculator works with dates, not times, so the result depends only on the two calendar dates. If you need age to the hour, for example for a newborn, count hours from the recorded time of birth in the time zone where the birth took place.',
    },
  ],
  ogSample: (r) => String(r.outputs.age ?? ''),
};
