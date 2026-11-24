import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'power-converter',
  slug: 'power-converter',
  q: 'power',
  pair: ['hp', 'kw'],
  value: 150,
  tags: ['power converter', 'hp to kW', 'kW to hp', 'watts', 'horsepower', 'BTU per hour'],
  related: ['energy-converter', 'unit-converter', 'speed-converter'],
  examples: [
    { id: 'car', inputs: { v: 150, from: 'hp', to: 'kw' }, expect: { result: 111.854980737 } },
    { id: 'metric', inputs: { v: 100, from: 'kw', to: 'ps' }, expect: { result: 135.96216173 } },
    { id: 'btu', inputs: { v: 1, from: 'kw', to: 'btuh' }, expect: { result: 3412.14163313 } },
  ],
});
