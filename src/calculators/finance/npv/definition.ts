import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

export const definition: CalculatorDefinition = {
  id: 'npv',
  slug: { en: 'npv-irr-calculator' },
  category: 'finance',
  tags: [
    'NPV',
    'net present value',
    'IRR',
    'internal rate of return',
    'payback period',
    'capital budgeting',
  ],
  difficulty: 'advanced',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'rate',
      param: 'r',
      type: 'number',
      labelKey: 'rate',
      default: 9,
      allowNegative: true,
      min: -99,
      max: 1000,
    },
    {
      id: 'flows',
      param: 'f',
      type: 'text',
      labelKey: 'flows',
      default: '-16000, 2000, 4000, 5000, 5000, 5000, 5000',
      maxLength: 5000,
      helpKey: 'flows.help',
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'npv', labelKey: 'out.npv', format: 'currency', primary: true },
    { id: 'irr', labelKey: 'out.irr', format: 'percent', decimals: 4 },
    { id: 'payback', labelKey: 'out.payback', format: 'sig', decimals: 6 },
    { id: 'pi', labelKey: 'out.pi', format: 'sig', decimals: 6 },
    { id: 'pvIn', labelKey: 'out.pvIn', format: 'currency' },
  ],
  sources: [
    {
      title:
        'Principles of Finance, 16.1 Payback Period, 16.2 Net Present Value and 16.3 Internal Rate of Return',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method',
      accessed: '2026-11-25',
      locator:
        'NPV = PV of inflows − PV of outflows (Eq. 16.1); Sam’s Sporting Goods: −16,000, then 2,000, 4,000, 5,000 × 4 at 9% → NPV 2,835.63, IRR 14.09%, payback 4 years; NPV profile 10,000 at 0%, 42 at 14%, (442) at 15%; second project at 9% → 26,946.90',
    },
    {
      title:
        'Principles of Accounting, Volume 2, 11.4 Use Discounted Cash Flow Models to Make Capital Investment Decisions',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/principles-managerial-accounting/pages/11-4-use-discounted-cash-flow-models-to-make-capital-investment-decisions',
      accessed: '2026-11-25',
      locator:
        'NPV and profitability index = PV of cash flows ÷ initial investment; 200,000 with 40,000 a year for 10 years at 8% → NPV 68,400 and index 1.342 (with the 6.710 table factor); Yellow Industries 135,000, 40,000 × 5 at 10% → 16,640',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['roi', 'compound-interest', 'break-even'],
  examples: [
    {
      id: 'sam',
      inputs: { rate: 9, flows: '-16000, 2000, 4000, 5000, 5000, 5000, 5000', cur: 'USD' },
      expect: { npv: 2835.62, payback: 4 },
    },
    {
      id: 'growth',
      inputs: {
        rate: 9,
        flows: '-30000, 6000, 8000, 10000, 12000, 14000, 16000, 18000',
        cur: 'USD',
      },
      expect: { npv: 26946.9 },
    },
    {
      id: 'xray',
      inputs: {
        rate: 8,
        flows: '-200000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000',
        cur: 'USD',
      },
      expect: { npv: 68403.26 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
