import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

const day = (start: string, end: string, brk = 30) => ({ start, end, brk });
export const WEEK = [1, 2, 3, 4, 5].map(() => day('09:00', '17:30'));

export const definition: CalculatorDefinition = {
  id: 'hours-worked',
  slug: { en: 'hours-worked-calculator' },
  category: 'date-time',
  tags: ['hours worked', 'time card', 'timesheet', 'work hours', 'overtime', 'payroll hours'],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'days',
      param: 'd',
      type: 'list',
      labelKey: 'days',
      maxRows: 14,
      columns: [
        { id: 'start', param: 's', type: 'time', labelKey: 'col.start', default: '09:00' },
        { id: 'end', param: 'e', type: 'time', labelKey: 'col.end', default: '17:00' },
        {
          id: 'brk',
          param: 'b',
          type: 'number',
          labelKey: 'col.brk',
          default: 30,
          min: 0,
          max: 1440,
        },
      ],
      default: WEEK,
      helpKey: 'days.help',
    },
    {
      id: 'rate',
      param: 'r',
      type: 'currency',
      labelKey: 'rate',
      default: 0,
      min: 0,
      max: 1e6,
      helpKey: 'rate.help',
      sensitive: true,
    },
    {
      id: 'otAfter',
      param: 'ot',
      type: 'number',
      labelKey: 'otAfter',
      default: 40,
      min: 0,
      max: 168,
      advanced: true,
      helpKey: 'otAfter.help',
    },
    {
      id: 'otRate',
      param: 'om',
      type: 'number',
      labelKey: 'otRate',
      default: 1.5,
      min: 1,
      max: 5,
      step: 0.25,
      advanced: true,
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'hours', labelKey: 'out.hours', format: 'number', decimals: 2, primary: true },
    { id: 'hm', labelKey: 'out.hm', format: 'text' },
    { id: 'overtime', labelKey: 'out.overtime', format: 'number', decimals: 2 },
    { id: 'pay', labelKey: 'out.pay', format: 'currency' },
  ],
  sources: [
    {
      title: 'Overtime Pay',
      publisher: 'U.S. Department of Labor, Wage and Hour Division',
      url: 'https://www.dol.gov/agencies/whd/overtime',
      accessed: '2026-11-24',
      locator:
        'FLSA: overtime at not less than time and one-half the regular rate for hours worked over 40 in a workweek; workweek basis; averaging over two or more weeks not permitted',
    },
    {
      title: 'Prealgebra 2e, 7.5 Systems of Measurement',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/7-5-systems-of-measurement',
      accessed: '2026-11-24',
      locator: 'Table 7.2: 1 h = 60 min, 1 day = 24 h',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['salary', 'time', 'time-duration'],
  examples: [
    { id: 'week', inputs: { days: WEEK, rate: 20 }, expect: { hours: 40, pay: 800 } },
    {
      id: 'overtime',
      inputs: { days: [...WEEK, day('09:00', '14:30', 30)], rate: 20 },
      expect: { hours: 45, overtime: 5, pay: 950 },
    },
    { id: 'night', inputs: { days: [day('22:00', '06:30', 30)] }, expect: { hours: 8, hm: '8 h' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
