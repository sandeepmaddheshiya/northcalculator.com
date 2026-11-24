import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'week') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Week Number Calculator',
  promise: 'The week number of any date, in the ISO 8601 or US system.',
  title: 'Week Number Calculator: ISO and US Week of the Year',
  description:
    'Find the week number of any date in the ISO 8601 system (weeks start Monday) or the US system (weeks start Sunday), with the first and last day of that week.',
  summary:
    'There are two common ways to number weeks. ISO 8601 starts weeks on Monday and makes week 1 the week that contains the year’s first Thursday, so a year has 52 or 53 full weeks. The US system starts weeks on Sunday and makes week 1 the week that contains January 1. The two can differ by one for the same date.',
  synonyms: [
    'what week is it',
    'ISO week number',
    'calendar week calculator',
    'week of the year',
    'current week number',
    'Kalenderwoche',
    'week number today',
  ],
  ui: {
    date: 'Date',
    system: 'Numbering system',
    'system.iso': 'ISO 8601 (Monday)',
    'system.us': 'US (Sunday)',
    'system.help':
      'ISO weeks are standard in Europe and in most business and software calendars. US calendars and Excel’s default WEEKNUM start on Sunday.',
    'out.week': 'Week number',
    'out.weekYear': 'Week belongs to the year',
    'out.start': 'Week starts',
    'out.end': 'Week ends',
    'out.weeks': 'Weeks in that year',
    'out.dayOfYear': 'Day of the year',
    'explain.iso': '{date} is in ISO week {w} of {y}.',
    'explain.isoOther':
      '{date} is in ISO week {w} of {y}: it falls in a week that belongs to the neighbouring year.',
    'explain.us': '{date} is in week {w} of {y} in the US system.',
    'step.isoThursday':
      'Find the Thursday of the date’s Monday-to-Sunday week. Its year is the week-year.',
    'step.isoCount': 'Count which Thursday of {y} it is: that is the ISO week number.',
    'step.usJan1': 'January 1 falls {n} day(s) after the Sunday that starts week 1.',
    'step.usCount': 'Add the day of the year, divide by 7 and round down, then add 1.',
    'warn.otherYear':
      'This date belongs to an ISO week of {y}, not of its calendar year. Write it as {y}-W followed by the week number.',
    'warn.partial':
      'In the US system the first and last weeks of a year can be shorter than seven days. The dates shown stay within the calendar year.',
    rounding: 'Exact calendar arithmetic on the proleptic Gregorian calendar, with no time zones.',
  },
  HowItWorks: () => (
    <>
      <p>
        <strong>ISO 8601.</strong> Weeks run from Monday to Sunday. Week 1 is the week with the
        year’s first Thursday in it, which is the same as the week containing January 4. Every week
        belongs entirely to one week-year, so the last days of December can be in week 1 of the next
        year, and the first days of January in week 52 or 53 of the previous one.
      </p>
      <Formula label="ISO week number">
        {
          'T = the Thursday of the date’s Monday–Sunday week\nweek-year = year of T\nweek = ⌊(day of year of T − 1) ÷ 7⌋ + 1'
        }
      </Formula>
      <p>
        Python’s documentation gives the textbook case: 2004 began on a Thursday, so ISO week 1 of
        2004 ran from Monday 29 December 2003 to Sunday 4 January 2004.
      </p>
      <p>
        <strong>US system.</strong> Weeks run from Sunday to Saturday and week 1 is simply the week
        containing January 1, which Microsoft calls system 1 in Excel’s WEEKNUM function. The first
        and last weeks are often partial, and a year can have 54 numbered weeks.
      </p>
      <Formula
        label="US week number"
        where={[{ symbol: 'j', meaning: 'weekday of January 1, Sunday = 0' }]}
      >
        {'week = ⌊(day of year − 1 + j) ÷ 7⌋ + 1'}
      </Formula>
    </>
  ),
  examples: [
    {
      id: 'iso',
      title: 'Sunday 4 January 2004 in the ISO system',
      body: (r) => (
        <p>
          The Monday-to-Sunday week containing this date runs from 29 December 2003. Its Thursday is
          1 January 2004, the year’s first Thursday, so it is <strong>week {String(o(r))}</strong>{' '}
          of {String(o(r, 'weekYear'))}, as Python’s documentation shows.
        </p>
      ),
    },
    {
      id: 'boundary',
      title: 'New Year’s Day 2027 belongs to 2026',
      body: (r) => (
        <p>
          1 January 2027 is a Friday. Its week’s Thursday is 31 December 2026, so the date is in{' '}
          <strong>week {String(o(r))}</strong> of ISO year {String(o(r, 'weekYear'))}, written
          2026-W53. 2026 has 53 ISO weeks because it begins on a Thursday.
        </p>
      ),
    },
    {
      id: 'us',
      title: 'Friday 9 March 2012 in the US system',
      body: (r) => (
        <p>
          January 1, 2012 was a Sunday, so US week 1 ran January 1–7. March 9 is day 69 of the year:
          ⌊(69 − 1 + 0) ÷ 7⌋ + 1 = <strong>{String(o(r))}</strong>, the result Microsoft gives for
          =WEEKNUM(&quot;3/9/2012&quot;). The ISO system puts the same date in week 10 as well, but
          that agreement is a coincidence of the calendar.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Say which system you mean.</strong> When planning with people in other countries,
        write “ISO week 12” or give the date range. Around New Year the two systems can be a whole
        week apart.
      </li>
      <li>
        <strong>Use the week-year, not the calendar year.</strong> In ISO dates, 2027-01-01 is
        2026-W53-5. Spreadsheets and code that mix the calendar year with the ISO week produce wrong
        labels for a few days each year.
      </li>
      <li>
        <strong>In spreadsheets,</strong> =ISOWEEKNUM(date) or =WEEKNUM(date, 21) gives the ISO
        week, and =WEEKNUM(date) gives the US week.
      </li>
      <li>
        <strong>Fiscal weeks are different again.</strong> Many retailers use a 4-4-5 calendar or a
        fiscal year starting in another month. Check your company’s own calendar for those.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What week number is it today?',
      a: 'The calculator opens on today’s date, so the result at the top is the current week number. It uses your device’s date, so it is correct for your own time zone. Switch between ISO and US numbering to see both, since they can differ by a week.',
    },
    {
      q: 'How many weeks are in a year?',
      a: 'An ISO year has 52 or 53 full weeks. It has 53 when it starts on a Thursday, or on a Wednesday in a leap year, which happens 71 times in every 400 years. In the US system a year spans 53 numbered weeks, or 54 in a leap year that starts on a Saturday, because partial weeks are counted.',
    },
    {
      q: 'Why does January 1 sometimes show week 52 or 53?',
      a: 'In the ISO system each week belongs to the year that contains its Thursday. If January 1 is a Friday, Saturday or Sunday, its week’s Thursday is still in December, so those days belong to the last week of the previous year. The US system always puts January 1 in week 1.',
    },
    {
      q: 'Which countries use ISO week numbers?',
      a: 'ISO 8601 week numbers are standard across most of Europe, where week numbers are common in schedules, and in international business and software. The United States, Canada and some other countries usually start weeks on Sunday and number them from January 1, though ISO weeks are also used there in industry.',
    },
  ],
  ogSample: (r) => `Week ${String(o(r))}`,
};
