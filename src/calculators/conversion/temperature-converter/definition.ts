import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'temperature-converter',
  slug: 'temperature-converter',
  q: 'temperature',
  pair: ['f', 'c'],
  value: 98.6,
  tags: [
    'temperature converter',
    'Fahrenheit to Celsius',
    'Celsius to Fahrenheit',
    'Kelvin',
    'oven temperature',
    '°F to °C',
  ],
  related: ['unit-converter', 'length-converter', 'weight-converter'],
  examples: [
    { id: 'body', inputs: { v: 98.6, from: 'f', to: 'c' }, expect: { result: 37 } },
    { id: 'minus40', inputs: { v: -40, from: 'c', to: 'f' }, expect: { result: -40 } },
    { id: 'kelvin', inputs: { v: 0, from: 'c', to: 'k' }, expect: { result: 273.15 } },
  ],
});
