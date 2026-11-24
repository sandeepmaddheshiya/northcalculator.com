import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'speed-converter',
  slug: 'speed-converter',
  q: 'speed',
  pair: ['mph', 'kmh'],
  value: 60,
  tags: [
    'speed converter',
    'mph to km/h',
    'km/h to mph',
    'knots',
    'metres per second',
    'speed limit',
  ],
  related: ['unit-converter', 'length-converter', 'running-pace'],
  examples: [
    { id: 'highway', inputs: { v: 60, from: 'mph', to: 'kmh' }, expect: { result: 96.56064 } },
    { id: 'knot', inputs: { v: 1, from: 'kn', to: 'kmh' }, expect: { result: 1.852 } },
    { id: 'mps', inputs: { v: 10, from: 'mps', to: 'kmh' }, expect: { result: 36 } },
  ],
});
