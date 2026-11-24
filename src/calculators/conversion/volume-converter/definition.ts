import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'volume-converter',
  slug: 'volume-converter',
  q: 'volume',
  pair: ['gal_us', 'l'],
  value: 1,
  tags: [
    'volume converter',
    'gallons to litres',
    'cups to ml',
    'fluid ounces',
    'imperial gallon',
    'cooking measurements',
  ],
  related: ['unit-converter', 'fuel-cost', 'weight-converter'],
  examples: [
    { id: 'gallon', inputs: { v: 1, from: 'gal_us', to: 'l' }, expect: { result: 3.785411784 } },
    { id: 'imperial', inputs: { v: 1, from: 'gal_uk', to: 'l' }, expect: { result: 4.54609 } },
    { id: 'cup', inputs: { v: 1, from: 'cup_us', to: 'ml' }, expect: { result: 236.5882365 } },
  ],
});
