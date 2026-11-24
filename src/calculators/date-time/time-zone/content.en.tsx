import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { ZONES, zoneKey } from './zones';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Time Zone Converter',
  promise: 'Convert a date and time between world time zones, daylight saving included.',
  title: 'Time Zone Converter: Convert Times Between Cities and UTC',
  description:
    'Convert a date and time from one city’s time zone to another, with the time difference and UTC offsets, using the IANA database and its daylight saving rules.',
  summary:
    'Every time zone is an offset from Coordinated Universal Time (UTC), such as UTC−05:00 for New York in winter or UTC+05:30 for India. Converting a time means subtracting the first zone’s offset to get UTC, then adding the second zone’s. Daylight saving time changes the offset for part of the year, so the difference between two cities can change with the date.',
  synonyms: [
    'time zone calculator',
    'time difference calculator',
    'world clock converter',
    'meeting time converter',
    'UTC converter',
    'what time is it in',
  ],
  ui: {
    when: 'Date and time',
    date: 'Date',
    time: 'Time',
    from: 'From time zone',
    to: 'To time zone',
    ...Object.fromEntries(ZONES.map(([id, label]) => [zoneKey(id), label])),
    'out.result': 'Converted time',
    'out.diff': 'Time difference',
    'out.fromOffset': 'From zone offset',
    'out.toOffset': 'To zone offset',
    'out.utc': 'In UTC',
    explain: 'That moment is {r} in the second time zone, which is {diff} on this date.',
    'step.toUtc': 'Subtract the first zone’s UTC offset to get UTC.',
    'step.fromUtc': 'Add the second zone’s UTC offset.',
    'warn.gap':
      'This time does not exist in the first zone: clocks skip forward over it when daylight saving time starts. The result uses the offset from just before the change.',
    'warn.repeat':
      'This time happens twice in the first zone, when clocks go back. The result uses the first occurrence, still on daylight saving time.',
    rounding:
      'Exact to the minute. Offsets and daylight saving rules come from the IANA time zone database built into your browser.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Converting between zones">
        {'UTC = local time − offset of zone A\ntarget time = UTC + offset of zone B'}
      </Formula>
      <p>
        Offsets come from the IANA time zone database, the reference used by operating systems and
        browsers. It records each zone’s offset and daylight saving rules, including past changes,
        so the conversion uses the offset that applies on the date you choose.
      </p>
      <p>
        NIST describes the current US rule: daylight saving time begins at 2:00 a.m. on the second
        Sunday of March and ends at 2:00 a.m. on the first Sunday of November, and it is not
        observed in Hawaii or most of Arizona. Other countries switch on different dates, or not at
        all, so a difference such as New York to London is 5 hours for most of the year but 4 hours
        for a few weeks each spring and autumn.
      </p>
    </>
  ),
  examples: [
    {
      id: 'winter',
      title: '9:00 in New York in January, in London',
      body: (r) => (
        <p>
          New York is on {o(r, 'fromOffset')} and London on {o(r, 'toOffset')} in January, so London
          is <strong>{o(r, 'diff')}</strong> ahead: 9:00 in New York is {o(r)} in London.
        </p>
      ),
    },
    {
      id: 'india',
      title: '10:00 in India, in Los Angeles in July',
      body: (r) => (
        <p>
          India uses UTC+05:30 all year and Los Angeles is on daylight time (UTC−07:00) in July, a
          difference of <strong>{o(r, 'diff')}</strong>. 10:00 in India is {o(r, 'utc')} UTC, which
          is {o(r)} in Los Angeles.
        </p>
      ),
    },
    {
      id: 'arizona',
      title: 'Phoenix and Denver in summer',
      body: (r) => (
        <p>
          Arizona stays on {o(r, 'fromOffset')} all year, while Denver moves to daylight time in
          summer, so Denver is <strong>{o(r, 'diff')}</strong> ahead in July but at the same time as
          Phoenix in winter.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the date, not just the zones.</strong> Daylight saving changes on different
        dates around the world, so a difference that holds in July may not hold in March.
      </li>
      <li>
        <strong>Half-hour and 45-minute zones exist.</strong> India is UTC+05:30 and Nepal
        UTC+05:45.
      </li>
      <li>
        <strong>Use UTC for global events.</strong> Giving a time in UTC avoids confusion when
        participants are spread over many zones.
      </li>
      <li>
        <strong>Crossing the date line</strong> can change the date: an evening in Los Angeles can
        already be the next morning in Tokyo or Sydney.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert time between two time zones?',
      a: 'Find each zone’s offset from UTC on that date, take the difference, and add it to the time. New York in winter is UTC−5 and Paris is UTC+1, so Paris is 6 hours ahead: 10:00 in New York is 16:00 in Paris.',
    },
    {
      q: 'Why does the time difference change during the year?',
      a: 'Because regions start and end daylight saving time on different dates, and some never use it. The US switches on the second Sunday of March and the first Sunday of November, while the UK and EU switch on the last Sundays of March and October, so their difference shrinks by an hour for a few weeks.',
    },
    {
      q: 'What is UTC?',
      a: 'Coordinated Universal Time is the world’s reference time scale. Time zones are written as offsets from it, such as UTC−08:00 or UTC+09:00. It does not change for daylight saving, which makes it useful for scheduling across countries.',
    },
    {
      q: 'Is GMT the same as UTC?',
      a: 'For everyday purposes they show the same clock time, and London uses UTC+00:00 in winter. UTC is the precise atomic time standard, while GMT is also the name of the UK’s winter time zone; in summer the UK uses British Summer Time, UTC+01:00.',
    },
  ],
  ogSample: () => 'Convert times between world time zones',
};
