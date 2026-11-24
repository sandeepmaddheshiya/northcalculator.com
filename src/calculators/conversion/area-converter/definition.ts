import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'area-converter',
  slug: 'area-converter',
  q: 'area',
  pair: ['ft2', 'm2'],
  value: 1000,
  tags: [
    'area converter',
    'square feet to square metres',
    'acres to hectares',
    'm\u00b2 to ft\u00b2',
    'land area',
    'floor area',
  ],
  related: ['unit-converter', 'length-converter', 'volume-converter'],
  examples: [
    { id: 'acre', inputs: { v: 1, from: 'acre', to: 'm2' }, expect: { result: 4046.8564224 } },
    { id: 'hectare', inputs: { v: 1, from: 'ha', to: 'acre' }, expect: { result: 2.47105381467 } },
    { id: 'house', inputs: { v: 1000, from: 'ft2', to: 'm2' }, expect: { result: 92.90304 } },
  ],
});
