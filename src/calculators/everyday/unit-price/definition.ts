import type { CalculatorDefinition } from '@/calculators/types';
import { currencySelect } from '@/calculators/currencies';

const item = (price: number, qty: number) => ({ price, qty });

export const definition: CalculatorDefinition = {
  id: 'unit-price',
  slug: { en: 'unit-price-calculator' },
  category: 'everyday',
  tags: [
    'unit price',
    'price per unit',
    'better buy',
    'compare prices',
    'price per ounce',
    'grocery',
  ],
  difficulty: 'basic',
  ymyl: false,
  currency: { input: 'cur' },
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'items',
      param: 'i',
      type: 'list',
      labelKey: 'items',
      maxRows: 10,
      columns: [
        {
          id: 'price',
          param: 'p',
          type: 'number',
          labelKey: 'col.price',
          default: 5,
          min: 0,
          max: 1e9,
        },
        {
          id: 'qty',
          param: 'q',
          type: 'number',
          labelKey: 'col.qty',
          default: 1,
          min: 0,
          max: 1e9,
        },
      ],
      default: [item(14.99, 64), item(15.99, 80)],
      helpKey: 'items.help',
    },
    currencySelect('USD'),
  ],
  outputs: [
    { id: 'best', labelKey: 'out.best', format: 'text', primary: true },
    { id: 'unit', labelKey: 'out.unit', format: 'currency', decimals: 4 },
    { id: 'saving', labelKey: 'out.saving', format: 'percent', decimals: 2 },
    { id: 'worst', labelKey: 'out.worst', format: 'currency', decimals: 4 },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 5.6 Ratios and Rate',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/5-6-ratios-and-rate',
      accessed: '2026-11-24',
      locator:
        'unit price = price ÷ number of units; Example 5.66: $3.99 for 24 bottles ≈ $0.17 each; Example 5.67: $14.99 for 64 loads vs $15.99 for 80 loads, the powder is the better buy',
    },
    {
      title: 'New Best Practices Guide Shows Unit Pricing Is a Great Deal (NIST SP 1181)',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/news-events/news/2015/02/new-best-practices-guide-shows-unit-pricing-great-deal',
      accessed: '2026-11-24',
      locator:
        'a 64-ounce bottle of ketchup at $4.49 (7¢ per ounce) is a worse deal than a 38-ounce bottle at $2.29 (6¢ per ounce)',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['discount', 'percentage', 'unit-converter'],
  examples: [
    {
      id: 'detergent',
      inputs: { items: [item(14.99, 64), item(15.99, 80)] },
      expect: { best: 'Item 2', unit: 0.1999 },
    },
    {
      id: 'ketchup',
      inputs: { items: [item(4.49, 64), item(2.29, 38)] },
      expect: { best: 'Item 2', unit: 0.0603 },
    },
    {
      id: 'bulk',
      inputs: { items: [item(4.29, 16), item(6.99, 32), item(12.49, 48)] },
      expect: { best: 'Item 2', saving: 18.5315 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
