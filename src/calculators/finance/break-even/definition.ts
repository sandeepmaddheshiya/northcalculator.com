import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

export const definition: CalculatorDefinition = {
  id: 'break-even',
  slug: { en: 'break-even-calculator' },
  category: 'finance',
  tags: [
    'break-even point',
    'break-even analysis',
    'contribution margin',
    'fixed costs',
    'target profit',
    'units to sell',
  ],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'fixed',
      param: 'f',
      type: 'currency',
      labelKey: 'fixed',
      default: 18000,
      min: 0,
      max: 1e12,
      helpKey: 'fixed.help',
    },
    {
      id: 'price',
      param: 'p',
      type: 'currency',
      labelKey: 'price',
      default: 100,
      min: 0,
      max: 1e9,
    },
    {
      id: 'variable',
      param: 'v',
      type: 'currency',
      labelKey: 'variable',
      default: 20,
      min: 0,
      max: 1e9,
      helpKey: 'variable.help',
    },
    {
      id: 'profit',
      param: 't',
      type: 'currency',
      labelKey: 'profit',
      default: 0,
      min: 0,
      max: 1e12,
      advanced: true,
      helpKey: 'profit.help',
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'units', labelKey: 'out.units', format: 'integer', primary: true },
    { id: 'sales', labelKey: 'out.sales', format: 'currency' },
    { id: 'cm', labelKey: 'out.cm', format: 'currency' },
    { id: 'cmRatio', labelKey: 'out.cmRatio', format: 'percent', decimals: 2 },
    { id: 'exact', labelKey: 'out.exact', format: 'number', decimals: 4 },
  ],
  sources: [
    {
      title:
        'Principles of Accounting, Volume 2: Managerial Accounting, 3.2 Calculate a Break-Even Point in Units and Dollars',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars',
      accessed: '2026-11-24',
      locator:
        'units = fixed costs ÷ contribution margin per unit; dollars = fixed costs ÷ contribution margin ratio; Hicks: $18,000 ÷ $80 = 225 units ($22,500); with a $40,000 target profit, 725 units; tax returns: $14,000 ÷ $250 = 56, $14,000 ÷ 0.625 = $22,400',
    },
    {
      title:
        'Principles of Accounting, Volume 2: Managerial Accounting, 3.1 Explain Contribution Margin',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin',
      accessed: '2026-11-24',
      locator:
        'contribution margin per unit = price − variable cost; Blue Jay: $100 − $20 = $80, ratio 80%',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['margin', 'roi', 'percentage'],
  examples: [
    {
      id: 'hicks',
      inputs: { fixed: 18000, price: 100, variable: 20 },
      expect: { units: 225, sales: 22500 },
    },
    {
      id: 'target',
      inputs: { fixed: 18000, price: 100, variable: 20, profit: 40000 },
      expect: { units: 725, sales: 72500 },
    },
    {
      id: 'service',
      inputs: { fixed: 14000, price: 400, variable: 150 },
      expect: { units: 56, sales: 22400, cmRatio: 62.5 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
