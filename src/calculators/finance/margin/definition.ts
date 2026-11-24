import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

const MODES = ['costPrice', 'costMargin', 'costMarkup', 'priceMargin', 'priceMarkup'] as const;

export const definition: CalculatorDefinition = {
  id: 'margin',
  slug: { en: 'margin-calculator' },
  category: 'finance',
  tags: [
    'margin',
    'markup',
    'profit margin',
    'gross margin',
    'markup percentage',
    'selling price',
    'margin vs markup',
  ],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'calc',
      param: 'm',
      type: 'select',
      labelKey: 'calc',
      default: 'costPrice',
      options: MODES.map((m) => ({ value: m, labelKey: `calc.${m}` })),
    },
    {
      id: 'cost',
      param: 'c',
      type: 'currency',
      labelKey: 'cost',
      default: 480,
      min: 0,
      max: 1e12,
      showIf: { input: 'calc', in: ['costPrice', 'costMargin', 'costMarkup'] },
    },
    {
      id: 'price',
      param: 'p',
      type: 'currency',
      labelKey: 'price',
      default: 840,
      min: 0,
      max: 1e12,
      showIf: { input: 'calc', in: ['costPrice', 'priceMargin', 'priceMarkup'] },
    },
    {
      id: 'marginPct',
      param: 'g',
      type: 'percent',
      labelKey: 'marginPct',
      default: 40,
      min: 0,
      max: 99.99,
      showIf: { input: 'calc', in: ['costMargin', 'priceMargin'] },
    },
    {
      id: 'markupPct',
      param: 'u',
      type: 'percent',
      labelKey: 'markupPct',
      default: 50,
      min: 0,
      max: 100000,
      showIf: { input: 'calc', in: ['costMarkup', 'priceMarkup'] },
    },
    currencySelect('USD'),
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'calc',
      format: 'currency',
      formatBy: { input: 'calc', map: { costPrice: 'percent' } },
      primary: true,
    },
    { id: 'price', labelKey: 'out.price', format: 'currency' },
    { id: 'cost', labelKey: 'out.cost', format: 'currency' },
    { id: 'profit', labelKey: 'out.profit', format: 'currency' },
    { id: 'margin', labelKey: 'out.margin', format: 'percent', decimals: 2 },
    { id: 'markup', labelKey: 'out.markup', format: 'percent', decimals: 2 },
  ],
  sources: [
    {
      title: 'Contemporary Mathematics, 6.2 Discounts, Markups, and Sales Tax',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/contemporary-mathematics/pages/6-2-discounts-markups-and-sales-tax',
      accessed: '2026-11-24',
      locator:
        'markup = percent markup × cost; retail price = cost × (1 + percent markup); Examples 6.16–6.21',
    },
    {
      title:
        'Principles of Accounting, Volume 1, 6.6 Describe and Prepare Multi-Step and Simple Income Statements for Merchandising Companies',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/principles-financial-accounting/pages/6-6-describe-and-prepare-multi-step-and-simple-income-statements-for-merchandising-companies',
      accessed: '2026-11-24',
      locator:
        'gross profit margin ratio = (net sales − cost of goods sold) ÷ net sales; CBS: ($293,500 − $180,000) ÷ $293,500 = 0.39',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['discount', 'percentage', 'sales-tax'],
  examples: [
    {
      id: 'phone',
      inputs: { calc: 'costPrice', cost: 480, price: 840 },
      expect: { result: 42.8571, markup: 75, profit: 360 },
    },
    {
      id: 'target',
      inputs: { calc: 'costMargin', cost: 62, marginPct: 40 },
      expect: { result: 103.33, markup: 66.6613 },
    },
    {
      id: 'shirt',
      inputs: { calc: 'priceMarkup', price: 29.5, markupPct: 18 },
      expect: { result: 25 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
