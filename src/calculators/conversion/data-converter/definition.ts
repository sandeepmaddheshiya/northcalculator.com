import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'data-converter',
  slug: 'data-storage-converter',
  q: 'data',
  pair: ['tb', 'gib'],
  value: 1,
  tags: [
    'data storage converter',
    'GB to GiB',
    'TB to TiB',
    'megabits to megabytes',
    'bytes',
    'binary prefixes',
  ],
  related: ['unit-converter', 'scientific-notation', 'exponent'],
  examples: [
    { id: 'drive', inputs: { v: 1, from: 'tb', to: 'tib' }, expect: { result: 0.909494701773 } },
    { id: 'gib', inputs: { v: 1, from: 'gib', to: 'byte' }, expect: { result: 1073741824 } },
    { id: 'internet', inputs: { v: 100, from: 'mbit', to: 'mb' }, expect: { result: 12.5 } },
  ],
});
