import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'energy-converter',
  slug: 'energy-converter',
  q: 'energy',
  pair: ['kcal', 'kj'],
  value: 2000,
  tags: [
    'energy converter',
    'calories to kJ',
    'kWh to BTU',
    'joules',
    'kilocalories',
    'electricity units',
  ],
  related: ['unit-converter', 'calorie', 'bmr'],
  examples: [
    { id: 'diet', inputs: { v: 2000, from: 'kcal', to: 'kj' }, expect: { result: 8368 } },
    { id: 'kwh', inputs: { v: 1, from: 'kwh', to: 'btu' }, expect: { result: 3412.14163313 } },
    {
      id: 'dietkwh',
      inputs: { v: 2000, from: 'kcal', to: 'kwh' },
      expect: { result: 2.32444444444 },
    },
  ],
});
