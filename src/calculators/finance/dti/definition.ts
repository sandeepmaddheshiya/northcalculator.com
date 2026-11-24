import type { CalculatorDefinition, NumberInput } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

export const DEBTS = ['housing', 'auto', 'student', 'cards', 'other'] as const;
const money = (id: string, param: string, def: number): NumberInput => ({
  id,
  param,
  type: 'currency',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e9,
  sensitive: true,
});

export const definition: CalculatorDefinition = {
  id: 'dti',
  slug: { en: 'debt-to-income-ratio-calculator' },
  category: 'finance',
  tags: [
    'debt-to-income ratio',
    'DTI',
    'mortgage qualification',
    'front-end ratio',
    'back-end ratio',
    'debt ratio',
  ],
  difficulty: 'basic',
  ymyl: true,
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    { ...money('income', 'i', 6000), helpKey: 'income.help' },
    {
      id: 'period',
      param: 'per',
      type: 'segmented',
      labelKey: 'period',
      default: 'month',
      options: [
        { value: 'month', labelKey: 'period.month' },
        { value: 'year', labelKey: 'period.year' },
      ],
    },
    { ...money('housing', 'h', 1500), helpKey: 'housing.help' },
    money('auto', 'a', 100),
    money('student', 's', 0),
    { ...money('cards', 'c', 0), helpKey: 'cards.help' },
    { ...money('other', 'o', 400), helpKey: 'other.help' },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'dti', labelKey: 'out.dti', format: 'percent', decimals: 1, primary: true },
    { id: 'frontEnd', labelKey: 'out.frontEnd', format: 'percent', decimals: 1 },
    { id: 'debt', labelKey: 'out.debt', format: 'currency' },
    { id: 'monthlyIncome', labelKey: 'out.monthlyIncome', format: 'currency' },
    { id: 'roomTo36', labelKey: 'out.roomTo36', format: 'currency' },
  ],
  sources: [
    {
      title: 'What is a debt-to-income ratio?',
      publisher: 'Consumer Financial Protection Bureau',
      url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/',
      accessed: '2026-11-24',
      locator:
        'DTI = all monthly debt payments ÷ gross monthly income; example: $1,500 mortgage + $100 auto + $400 other = $2,000 on $6,000 income = 33%; limits differ by loan and lender',
    },
    {
      title: 'Selling Guide B3-6-02, Debt-to-Income Ratios',
      publisher: 'Fannie Mae',
      url: 'https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios',
      accessed: '2026-11-24',
      locator:
        'manually underwritten: maximum total DTI 36% of stable monthly income, up to 45% with credit score and reserve requirements; Desktop Underwriter: maximum 50%',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['mortgage', 'loan', 'auto-loan'],
  examples: [
    {
      id: 'cfpb',
      inputs: { income: 6000, housing: 1500, auto: 100, other: 400 },
      expect: { dti: 33.3333, frontEnd: 25 },
    },
    {
      id: 'annual',
      inputs: {
        income: 84000,
        period: 'year',
        housing: 2100,
        auto: 450,
        student: 300,
        cards: 150,
        other: 0,
      },
      expect: { dti: 42.8571 },
    },
    {
      id: 'room',
      inputs: { income: 7500, housing: 0, auto: 350, student: 250, cards: 100, other: 0 },
      expect: { roomTo36: 2000 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
