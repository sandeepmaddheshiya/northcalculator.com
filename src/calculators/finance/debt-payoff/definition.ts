import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

const debt = (balance: number, apr: number, minimum: number) => ({ balance, apr, minimum });
export const SAMPLE = [debt(7500, 24.9, 190), debt(3000, 7.5, 90), debt(4500, 18.9, 110)];

export const definition: CalculatorDefinition = {
  id: 'debt-payoff',
  slug: { en: 'debt-payoff-calculator' },
  category: 'finance',
  tags: [
    'debt payoff',
    'debt snowball',
    'debt avalanche',
    'pay off credit cards',
    'debt free date',
    'highest interest first',
  ],
  difficulty: 'basic',
  ymyl: true,
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'debts',
      param: 'd',
      type: 'list',
      labelKey: 'debts',
      maxRows: 15,
      columns: [
        {
          id: 'balance',
          param: 'b',
          type: 'number',
          labelKey: 'col.balance',
          default: 1000,
          min: 0,
          max: 1e9,
        },
        {
          id: 'apr',
          param: 'r',
          type: 'number',
          labelKey: 'col.apr',
          default: 20,
          min: 0,
          max: 100,
        },
        {
          id: 'minimum',
          param: 'm',
          type: 'number',
          labelKey: 'col.minimum',
          default: 25,
          min: 0,
          max: 1e7,
        },
      ],
      default: SAMPLE,
      helpKey: 'debts.help',
      sensitive: true,
    },
    {
      id: 'extra',
      param: 'x',
      type: 'currency',
      labelKey: 'extra',
      default: 200,
      min: 0,
      max: 1e7,
      helpKey: 'extra.help',
    },
    {
      id: 'method',
      param: 'o',
      type: 'segmented',
      labelKey: 'method',
      default: 'avalanche',
      options: [
        { value: 'avalanche', labelKey: 'method.avalanche' },
        { value: 'snowball', labelKey: 'method.snowball' },
      ],
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'months', labelKey: 'out.months', format: 'integer', primary: true },
    { id: 'interest', labelKey: 'out.interest', format: 'currency' },
    { id: 'otherMonths', labelKey: 'out.otherMonths', labelBy: 'method', format: 'integer' },
    { id: 'otherInterest', labelKey: 'out.otherInterest', labelBy: 'method', format: 'currency' },
    { id: 'order', labelKey: 'out.order', format: 'text' },
  ],
  sources: [
    {
      title: 'How to reduce your debt',
      publisher: 'Consumer Financial Protection Bureau',
      url: 'https://www.consumerfinance.gov/about-us/blog/how-reduce-your-debt/',
      accessed: '2026-11-24',
      locator:
        'snowball method: minimum payments on all debts, extra funds to the smallest debt; highest interest rate method: pay off the highest-rate debt first, which can save money in the long run',
    },
    {
      title: 'Contemporary Mathematics, 6.11 Buying or Leasing a Car',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/6-11-buying-or-leasing-a-car',
      accessed: '2026-11-24',
      locator:
        'monthly loan payment formula with monthly rate r/12, used to check single-debt payoff times',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['loan', 'dti', 'compound-interest'],
  examples: [
    {
      id: 'avalanche',
      inputs: { debts: SAMPLE, extra: 200, method: 'avalanche' },
      expect: { months: 33, interest: 4304.53 },
    },
    {
      id: 'snowball',
      inputs: { debts: SAMPLE, extra: 200, method: 'snowball' },
      expect: { months: 35, interest: 5421.48 },
    },
    {
      id: 'single',
      inputs: { debts: [debt(5000, 18, 200)], extra: 0 },
      expect: { months: 32, interest: 1313.97 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
