import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'week-number',
  slug: { en: 'week-number-calculator' },
  category: 'date-time',
  tags: ['week number', 'ISO week', 'what week is it', 'calendar week', 'week of the year', 'KW'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'date', param: 'd', type: 'date', labelKey: 'date', default: 'today' },
    {
      id: 'system',
      param: 's',
      type: 'segmented',
      labelKey: 'system',
      default: 'iso',
      options: [
        { value: 'iso', labelKey: 'system.iso' },
        { value: 'us', labelKey: 'system.us' },
      ],
      helpKey: 'system.help',
    },
  ],
  outputs: [
    { id: 'week', labelKey: 'out.week', format: 'integer', primary: true },
    { id: 'weekYear', labelKey: 'out.weekYear', format: 'text' },
    { id: 'start', labelKey: 'out.start', format: 'date' },
    { id: 'end', labelKey: 'out.end', format: 'date' },
    { id: 'weeks', labelKey: 'out.weeks', format: 'integer' },
    { id: 'dayOfYear', labelKey: 'out.dayOfYear', format: 'integer' },
  ],
  sources: [
    {
      title: 'datetime: date.isocalendar()',
      publisher: 'Python Software Foundation',
      url: 'https://docs.python.org/3/library/datetime.html',
      accessed: '2026-11-24',
      locator:
        'ISO weeks start on Monday; week 1 is the week containing the year’s first Thursday; 2003-12-29 and 2004-01-04 are in ISO week 1 of 2004; 2002-03-11 is week 11',
    },
    {
      title: 'WEEKNUM function',
      publisher: 'Microsoft Support',
      url: 'https://support.microsoft.com/en-us/office/weeknum-function-e5c43a03-b4ab-426c-b411-b18c13c75340',
      accessed: '2026-11-24',
      locator:
        'System 1: the week containing January 1 is week 1 (weeks begin Sunday by default); System 2 is ISO 8601; 3/9/2012 is week 10',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['date-add', 'date-difference', 'business-days'],
  examples: [
    {
      id: 'iso',
      inputs: { date: '2004-01-04', system: 'iso' },
      expect: { week: 1, weekYear: '2004' },
    },
    {
      id: 'boundary',
      inputs: { date: '2027-01-01', system: 'iso' },
      expect: { week: 53, weekYear: '2026' },
    },
    { id: 'us', inputs: { date: '2012-03-09', system: 'us' }, expect: { week: 10 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
