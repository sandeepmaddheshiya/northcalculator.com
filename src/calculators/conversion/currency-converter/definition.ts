import type { CalculatorDefinition } from '@/calculators/types';
import snapshot from './rates.snapshot.json';

export interface RateData {
  /** ISO code all rates are quoted against (1 base = rates[X] X). */
  base: string;
  /** Unix seconds of the provider's last update. */
  time: number;
  source: 'er-api' | 'fawazahmed0' | 'snapshot' | string;
  rates: Record<string, number>;
}

export const CODES = Object.keys((snapshot as RateData).rates);
const options = CODES.map((c) => ({ value: c, labelKey: `cur.${c}` }));

export const definition: CalculatorDefinition = {
  id: 'currency-converter',
  slug: { en: 'currency-converter' },
  category: 'conversion',
  tags: [
    'currency converter',
    'exchange rate',
    'forex',
    'USD to EUR',
    'USD to INR',
    'GBP to USD',
    'bank markup',
    'money converter',
  ],
  difficulty: 'basic',
  ymyl: true,
  currency: { input: 'to' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'amount',
      param: 'a',
      type: 'number',
      labelKey: 'amount',
      default: 100,
      min: 0,
      max: 1e15,
    },
    {
      id: 'from',
      param: 'from',
      type: 'select',
      labelKey: 'from',
      default: 'USD',
      options,
      swapWith: 'to',
    },
    { id: 'to', param: 'to', type: 'select', labelKey: 'to', default: 'EUR', options },
    {
      id: 'mode',
      param: 'm',
      type: 'segmented',
      labelKey: 'mode',
      default: 'ref',
      options: [
        { value: 'ref', labelKey: 'mode.ref' },
        { value: 'custom', labelKey: 'mode.custom' },
      ],
    },
    {
      id: 'rate',
      param: 'r',
      type: 'number',
      labelKey: 'rate',
      default: 1,
      min: 0,
      max: 1e9,
      showIf: { input: 'mode', in: ['custom'] },
      helpKey: 'rate.help',
    },
  ],
  outputs: [
    { id: 'result', labelKey: 'out.result', format: 'currency', primary: true },
    { id: 'rateText', labelKey: 'out.rate', format: 'text' },
    { id: 'inverseText', labelKey: 'out.inverse', format: 'text' },
    { id: 'refResult', labelKey: 'out.refResult', format: 'currency' },
    { id: 'markup', labelKey: 'out.markup', format: 'percent', decimals: 2 },
    { id: 'asOf', labelKey: 'out.asOf', format: 'text' },
  ],
  sources: [
    {
      title: 'ExchangeRate-API open access endpoint (free daily reference rates)',
      publisher: 'ExchangeRate-API',
      url: 'https://www.exchangerate-api.com/docs/free',
      accessed: '2026-11-24',
      locator: 'USD-based rates for 160 currencies, updated once a day; attribution required',
    },
    {
      title: 'Euro foreign exchange reference rates',
      publisher: 'European Central Bank',
      url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
      accessed: '2026-11-24',
      locator:
        'reference rates are for information purposes only; used for the triangulation test (2 January 2024)',
    },
    {
      title: 'ISO 4217 Currency codes',
      publisher: 'International Organization for Standardization',
      url: 'https://www.iso.org/iso-4217-currency-codes.html',
      accessed: '2026-11-24',
      locator: 'three-letter codes and minor units (e.g. JPY 0 decimals, BHD 3)',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['unit-converter', 'percentage', 'loan'],
  examples: [
    {
      id: 'bank',
      inputs: { amount: 1000, from: 'USD', to: 'EUR', mode: 'custom', rate: 0.88 },
      expect: { result: 880 },
    },
    {
      id: 'remit',
      inputs: { amount: 500, from: 'GBP', to: 'INR', mode: 'custom', rate: 119 },
      expect: { result: 59500 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
