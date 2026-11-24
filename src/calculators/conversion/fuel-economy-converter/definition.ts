import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'fuel-economy-converter',
  slug: 'fuel-economy-converter',
  q: 'fuel',
  pair: ['mpg_us', 'l100km'],
  value: 30,
  tags: [
    'fuel economy converter',
    'mpg to L/100 km',
    'L/100 km to mpg',
    'UK mpg to US mpg',
    'km per litre',
    'fuel consumption',
  ],
  related: ['fuel-cost', 'unit-converter', 'volume-converter'],
  examples: [
    {
      id: 'mpg',
      inputs: { v: 30, from: 'mpg_us', to: 'l100km' },
      expect: { result: 7.84048611111 },
    },
    {
      id: 'ukus',
      inputs: { v: 50, from: 'mpg_uk', to: 'mpg_us' },
      expect: { result: 41.6337092314 },
    },
    {
      id: 'litres',
      inputs: { v: 6, from: 'l100km', to: 'mpg_us' },
      expect: { result: 39.2024305556 },
    },
  ],
});
