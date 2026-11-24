import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

export const PERIODS = ['hour', 'day', 'week', 'biweek', 'semimonth', 'month', 'year'] as const;
export type Period = (typeof PERIODS)[number];

export const definition: CalculatorDefinition = {
  id: 'salary',
  slug: { en: 'hourly-to-salary-calculator' },
  category: 'finance',
  tags: [
    'hourly to salary',
    'salary to hourly',
    'annual salary',
    'hourly wage',
    'pay converter',
    'monthly salary',
    'biweekly pay',
  ],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'amount',
      param: 'a',
      type: 'currency',
      labelKey: 'amount',
      default: 25,
      min: 0,
      max: 1e10,
      sensitive: true,
    },
    {
      id: 'per',
      param: 'p',
      type: 'select',
      labelKey: 'per',
      default: 'hour',
      options: PERIODS.map((p) => ({ value: p, labelKey: `per.${p}` })),
    },
    { id: 'hours', param: 'h', type: 'number', labelKey: 'hours', default: 40, min: 0.1, max: 168 },
    {
      id: 'days',
      param: 'd',
      type: 'number',
      labelKey: 'days',
      default: 5,
      min: 0.5,
      max: 7,
      advanced: true,
    },
    {
      id: 'weeks',
      param: 'w',
      type: 'number',
      labelKey: 'weeks',
      default: 52,
      min: 1,
      max: 53,
      advanced: true,
      helpKey: 'weeks.help',
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', labelBy: 'per', format: 'currency', primary: true },
    ...PERIODS.map((p) => ({ id: p, labelKey: `out.${p}`, format: 'currency' as const })),
  ],
  sources: [
    {
      title: 'Computing Hourly Rates of Pay Using the 2,087-Hour Divisor',
      publisher: 'U.S. Office of Personnel Management',
      url: 'https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor/',
      accessed: '2026-11-24',
      locator:
        'hourly rate = annual rate ÷ 2,087 hours, rounded to the nearest cent; example: $89,033 ÷ 2,087 = $42.66',
    },
    {
      title: 'Salary Table 2024-GS (annual rates) and Hourly Basic (B) Rates by Grade and Step',
      publisher: 'U.S. Office of Personnel Management',
      url: 'https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/salary-tables/24Tables/html/GS_h.aspx',
      accessed: '2026-11-24',
      locator: 'GS-11 step 1: $62,107 a year, $29.76 an hour; GS-13 step 1: $88,520, $42.41',
    },
    {
      title: 'Overtime Pay',
      publisher: 'U.S. Department of Labor, Wage and Hour Division',
      url: 'https://www.dol.gov/agencies/whd/overtime',
      accessed: '2026-11-24',
      locator: 'FLSA: at least 1.5 times the regular rate after 40 hours in a workweek',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['percentage', 'tip', 'sales-tax'],
  examples: [
    {
      id: 'hourly',
      inputs: { amount: 25, per: 'hour' },
      expect: { result: 52000, month: 4333.33 },
    },
    {
      id: 'federal',
      inputs: { amount: 88520, per: 'year', hours: 40, weeks: 52.175 },
      expect: { result: 42.41 },
    },
    {
      id: 'monthly',
      inputs: { amount: 4500, per: 'month' },
      expect: { result: 54000, hour: 25.96 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
