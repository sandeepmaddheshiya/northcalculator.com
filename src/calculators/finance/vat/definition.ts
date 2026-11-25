import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

export const definition: CalculatorDefinition = {
  id: 'vat',
  slug: { en: 'vat-calculator' },
  category: 'finance',
  tags: ['VAT', 'value added tax', 'add VAT', 'remove VAT', 'VAT fraction', 'net and gross price'],
  difficulty: 'basic',
  ymyl: false,
  regions: ['GB'],
  currency: { input: 'cur' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'mode',
      param: 'm',
      type: 'segmented',
      labelKey: 'mode',
      default: 'add',
      options: [
        { value: 'add', labelKey: 'mode.add' },
        { value: 'remove', labelKey: 'mode.remove' },
      ],
    },
    {
      id: 'amount',
      param: 'a',
      type: 'currency',
      labelKey: 'amount',
      labelBy: 'mode',
      default: 60,
      min: 0,
      max: 1e12,
    },
    {
      id: 'rate',
      param: 'r',
      type: 'number',
      labelKey: 'rate',
      default: 20,
      min: 0,
      max: 100,
      helpKey: 'rate.help',
    },
    currencySelect('GBP'),
  ],
  outputs: [
    { id: 'gross', labelKey: 'out.gross', format: 'currency', primary: true },
    { id: 'net', labelKey: 'out.net', format: 'currency' },
    { id: 'vat', labelKey: 'out.vat', format: 'currency' },
    { id: 'fraction', labelKey: 'out.fraction', format: 'text' },
  ],
  sources: [
    {
      title: 'VAT guide (VAT Notice 700), 7.3.1 VAT fraction',
      publisher: 'HM Revenue & Customs (GOV.UK)',
      url: 'https://www.gov.uk/guidance/vat-guide-notice-700',
      accessed: '2026-11-25',
      locator:
        'VAT fraction = rate ÷ (100 + rate): 20% → 1/6, 5% → 1/21, 12.5% → 1/9, 17.5% → 7/47; £2.40 including VAT at 20% contains 40p of VAT',
    },
    {
      title: 'Charge, reclaim and record VAT',
      publisher: 'GOV.UK',
      url: 'https://www.gov.uk/charge-reclaim-record-vat',
      accessed: '2026-11-25',
      locator:
        'multiply the price excluding VAT by 1.2 (standard rate): £60 → £72; £200 at 5% → £210; divide by 1.2 to remove it: £180 → £150 + £30 VAT; £483 at 5% → £460 + £23',
    },
    {
      title: 'VAT rates',
      publisher: 'GOV.UK',
      url: 'https://www.gov.uk/vat-rates',
      accessed: '2026-11-25',
      locator: 'standard rate 20%, reduced rate 5%, zero rate 0%',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['sales-tax', 'margin', 'discount'],
  examples: [
    {
      id: 'chair',
      inputs: { mode: 'add', amount: 60, rate: 20, cur: 'GBP' },
      expect: { gross: 72, vat: 12 },
    },
    {
      id: 'table',
      inputs: { mode: 'remove', amount: 180, rate: 20, cur: 'GBP' },
      expect: { net: 150, vat: 30 },
    },
    {
      id: 'stairlift',
      inputs: { mode: 'remove', amount: 483, rate: 5, cur: 'GBP' },
      expect: { net: 460, vat: 23 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
