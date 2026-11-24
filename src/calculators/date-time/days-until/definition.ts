import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'days-until',
  slug: { en: 'days-until-calculator' },
  category: 'date-time',
  tags: ['days until', 'countdown', 'how many days until', 'days left', 'days to go', 'days since'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'target', param: 'd', type: 'date', labelKey: 'target', default: '2027-01-01' },
    {
      id: 'from',
      param: 'f',
      type: 'date',
      labelKey: 'from',
      default: 'today',
      advanced: true,
      helpKey: 'from.help',
    },
  ],
  outputs: [
    { id: 'days', labelKey: 'out.days', format: 'integer', primary: true },
    { id: 'weeks', labelKey: 'out.weeks', format: 'text' },
    { id: 'ymd', labelKey: 'out.ymd', format: 'text' },
    { id: 'weekdays', labelKey: 'out.weekdays', format: 'integer' },
    { id: 'weekendsLeft', labelKey: 'out.weekends', format: 'integer' },
  ],
  sources: [
    {
      title: 'datetime: examples of usage, counting days to an event',
      publisher: 'Python Software Foundation',
      url: 'https://docs.python.org/3/library/datetime.html',
      accessed: '2026-11-24',
      locator:
        'from 2007-12-05 to the birthday 2008-06-24 is 202 days; date.fromordinal(730920) is 2002-03-11',
    },
    {
      title: 'Leap Years',
      publisher: 'U.S. Naval Observatory, Astronomical Applications Department',
      url: 'https://aa.usno.navy.mil/faq/leap_years',
      accessed: '2026-11-24',
      locator:
        'Gregorian rule: every year divisible by 4, except century years not divisible by 400',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['date-difference', 'date-add', 'age'],
  examples: [
    {
      id: 'birthday',
      inputs: { from: '2007-12-05', target: '2008-06-24' },
      expect: { days: 202, weeks: '28 weeks, 6 days' },
    },
    { id: 'newyear', inputs: { from: '2026-11-24', target: '2027-01-01' }, expect: { days: 38 } },
    { id: 'since', inputs: { from: '2026-11-24', target: '2000-01-01' }, expect: { days: 9824 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
