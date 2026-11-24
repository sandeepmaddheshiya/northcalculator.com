import type { CalculatorDefinition } from '@/calculators/types';
import cpi from './cpi.json';

export const FIRST = cpi.first;
export const LAST = cpi.last;

export const definition: CalculatorDefinition = {
  id: 'inflation',
  slug: { en: 'inflation-calculator' },
  category: 'finance',
  tags: [
    'inflation calculator',
    'CPI',
    'value of a dollar',
    'purchasing power',
    'price change over time',
    'US inflation',
  ],
  difficulty: 'basic',
  ymyl: false,
  regions: ['US'],
  currency: { fixed: 'USD' },
  schemaCategory: 'FinanceApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'amount',
      param: 'a',
      type: 'currency',
      labelKey: 'amount',
      default: 100,
      min: 0,
      max: 1e12,
    },
    {
      id: 'from',
      param: 'f',
      type: 'number',
      labelKey: 'from',
      default: 2000,
      min: FIRST,
      max: LAST,
      integer: true,
      row: { id: 'years', legendKey: 'years' },
    },
    {
      id: 'to',
      param: 't',
      type: 'number',
      labelKey: 'to',
      default: LAST,
      min: FIRST,
      max: LAST,
      integer: true,
      row: { id: 'years', legendKey: 'years' },
    },
  ],
  outputs: [
    { id: 'value', labelKey: 'out.value', format: 'currency', primary: true },
    { id: 'change', labelKey: 'out.change', format: 'percent', decimals: 2 },
    { id: 'annual', labelKey: 'out.annual', format: 'percent', decimals: 2 },
    { id: 'cpiFrom', labelKey: 'out.cpiFrom', format: 'number', decimals: 3 },
    { id: 'cpiTo', labelKey: 'out.cpiTo', format: 'number', decimals: 3 },
  ],
  sources: [
    {
      title:
        'Consumer Price Index for All Urban Consumers (CPI-U), U.S. city average, all items (series CUUR0000SA0)',
      publisher: 'U.S. Bureau of Labor Statistics',
      url: 'https://www.bls.gov/cpi/',
      accessed: '2026-11-24',
      locator:
        'annual averages 1913–2025 (1982–84 = 100) from the BLS public data API; e.g. 2000 = 172.2, 2024 = 313.689, 2025 = 321.943',
    },
    {
      title: 'Principles of Macroeconomics 3e, 9.1 Tracking Inflation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/principles-macroeconomics-3e/pages/9-1-tracking-inflation',
      accessed: '2026-11-24',
      locator:
        'the inflation rate is the percentage change in a price index; an index from 69.71 to 89.90 is a 28.96% rise',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['cagr', 'compound-interest', 'percentage-change'],
  examples: [
    { id: 'since2000', inputs: { amount: 100, from: 2000, to: 2024 }, expect: { value: 182.17 } },
    { id: 'century', inputs: { amount: 1, from: 1913, to: 2025 }, expect: { value: 32.52 } },
    { id: 'back', inputs: { amount: 50000, from: 2024, to: 1990 }, expect: { value: 20832.74 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
