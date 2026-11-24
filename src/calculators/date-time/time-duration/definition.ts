import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'time-duration',
  slug: { en: 'time-duration-calculator' },
  category: 'date-time',
  tags: [
    'time duration',
    'time between two times',
    'elapsed time',
    'hours between times',
    'shift length',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    { id: 'start', param: 's', type: 'time', labelKey: 'start', default: '09:15' },
    { id: 'end', param: 'e', type: 'time', labelKey: 'end', default: '17:40' },
    {
      id: 'nextDay',
      param: 'n',
      type: 'toggle',
      labelKey: 'nextDay',
      default: false,
      helpKey: 'nextDay.help',
      advanced: true,
    },
  ],
  outputs: [
    { id: 'hm', labelKey: 'out.hm', format: 'text', primary: true },
    { id: 'hours', labelKey: 'out.hours', format: 'number', decimals: 4 },
    { id: 'minutes', labelKey: 'out.minutes', format: 'integer' },
    { id: 'seconds', labelKey: 'out.seconds', format: 'integer' },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 7.5 Systems of Measurement',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/7-5-systems-of-measurement',
      accessed: '2026-11-24',
      locator: 'Table 7.2: 1 min = 60 s, 1 h = 60 min, 1 day = 24 h',
    },
    {
      title: 'The International System of Units (SI Brochure), 9th edition',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      accessed: '2026-11-24',
      locator: 'Table 8: minute, hour and day accepted for use with the SI (1 d = 86 400 s)',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['hours-worked', 'time', 'days-until'],
  examples: [
    {
      id: 'day',
      inputs: { start: '09:15', end: '17:40' },
      expect: { hm: '8 h 25 min', hours: 8.4167 },
    },
    { id: 'night', inputs: { start: '23:00', end: '07:00' }, expect: { hm: '8 h', minutes: 480 } },
    {
      id: 'short',
      inputs: { start: '13:50', end: '14:35' },
      expect: { hm: '45 min', hours: 0.75 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
