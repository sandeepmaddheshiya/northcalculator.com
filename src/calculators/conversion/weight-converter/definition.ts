import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'weight-converter',
  slug: 'weight-converter',
  q: 'mass',
  pair: ['lb', 'kg'],
  value: 1,
  tags: [
    'weight converter',
    'kg to lbs',
    'pounds to kilograms',
    'ounces to grams',
    'stone to kg',
    'mass converter',
  ],
  related: ['unit-converter', 'length-converter', 'bmi'],
  examples: [
    { id: 'pound', inputs: { v: 1, from: 'lb', to: 'kg' }, expect: { result: 0.45359237 } },
    { id: 'ounce', inputs: { v: 1, from: 'oz', to: 'g' }, expect: { result: 28.349523125 } },
    { id: 'stone', inputs: { v: 11, from: 'st', to: 'kg' }, expect: { result: 69.85322498 } },
  ],
});
