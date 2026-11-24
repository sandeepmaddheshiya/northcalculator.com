import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'pressure-converter',
  slug: 'pressure-converter',
  q: 'pressure',
  pair: ['psi', 'kpa'],
  value: 32,
  tags: [
    'pressure converter',
    'psi to bar',
    'psi to kPa',
    'bar to psi',
    'tyre pressure',
    'atmospheres',
  ],
  related: ['unit-converter', 'temperature-converter', 'weight-converter'],
  examples: [
    { id: 'tyre', inputs: { v: 32, from: 'psi', to: 'kpa' }, expect: { result: 220.632233381 } },
    { id: 'atm', inputs: { v: 1, from: 'atm', to: 'psi' }, expect: { result: 14.6959487755 } },
    { id: 'bar', inputs: { v: 1, from: 'bar', to: 'psi' }, expect: { result: 14.503773773 } },
  ],
});
