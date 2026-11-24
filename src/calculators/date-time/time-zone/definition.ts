import type { CalculatorDefinition } from '@/calculators/types';
import { ZONES, zoneKey } from './zones';

const options = ZONES.map(([id]) => ({ value: id, labelKey: zoneKey(id) }));

export const definition: CalculatorDefinition = {
  id: 'time-zone',
  slug: { en: 'time-zone-converter' },
  category: 'date-time',
  tags: [
    'time zone converter',
    'time difference',
    'world clock',
    'meeting planner',
    'UTC',
    'daylight saving time',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'date',
      param: 'd',
      type: 'date',
      labelKey: 'date',
      default: 'today',
      row: { id: 'when', legendKey: 'when' },
    },
    {
      id: 'time',
      param: 't',
      type: 'time',
      labelKey: 'time',
      default: '09:00',
      row: { id: 'when', legendKey: 'when' },
    },
    {
      id: 'from',
      param: 'from',
      type: 'select',
      labelKey: 'from',
      default: 'America/New_York',
      options,
      swapWith: 'to',
    },
    { id: 'to', param: 'to', type: 'select', labelKey: 'to', default: 'Europe/London', options },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'text', primary: true },
    { id: 'diff', labelKey: 'out.diff', format: 'text' },
    { id: 'fromOffset', labelKey: 'out.fromOffset', format: 'text' },
    { id: 'toOffset', labelKey: 'out.toOffset', format: 'text' },
    { id: 'utc', labelKey: 'out.utc', format: 'text' },
  ],
  sources: [
    {
      title: 'Time Zone Database',
      publisher: 'Internet Assigned Numbers Authority (IANA)',
      url: 'https://www.iana.org/time-zones',
      accessed: '2026-11-24',
      locator:
        'tz database of zone offsets and daylight saving rules, used through the browser’s Intl API',
    },
    {
      title: 'Daylight Saving Time',
      publisher: 'National Institute of Standards and Technology, Time and Frequency Division',
      url: 'https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst',
      accessed: '2026-11-24',
      locator:
        'US DST begins at 2:00 a.m. on the second Sunday of March and ends at 2:00 a.m. on the first Sunday of November; not observed in Hawaii or most of Arizona',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['time-duration', 'hours-worked', 'days-until'],
  examples: [
    {
      id: 'winter',
      inputs: { date: '2026-01-15', time: '09:00', from: 'America/New_York', to: 'Europe/London' },
      expect: { diff: '+5 h', toOffset: 'UTC+00:00' },
    },
    {
      id: 'india',
      inputs: {
        date: '2026-07-01',
        time: '10:00',
        from: 'Asia/Kolkata',
        to: 'America/Los_Angeles',
      },
      expect: { diff: '−12 h 30 min', utc: '2026-07-01 04:30' },
    },
    {
      id: 'arizona',
      inputs: { date: '2026-07-01', time: '12:00', from: 'America/Phoenix', to: 'America/Denver' },
      expect: { diff: '+1 h', fromOffset: 'UTC−07:00' },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
