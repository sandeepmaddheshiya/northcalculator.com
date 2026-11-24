import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'length-converter',
  slug: 'length-converter',
  q: 'length',
  pair: ['in', 'cm'],
  value: 1,
  tags: [
    'length converter',
    'inches to cm',
    'feet to metres',
    'miles to km',
    'metric length',
    'distance converter',
  ],
  related: ['unit-converter', 'weight-converter', 'volume-converter'],
  examples: [
    { id: 'inch', inputs: { v: 1, from: 'in', to: 'cm' }, expect: { result: 2.54 } },
    { id: 'mile', inputs: { v: 1, from: 'mi', to: 'km' }, expect: { result: 1.609344 } },
    { id: 'height', inputs: { v: 6, from: 'ft', to: 'm' }, expect: { result: 1.8288 } },
  ],
});
