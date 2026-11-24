import { quantityDefinition } from '../quantity-page';

export const definition = quantityDefinition({
  id: 'time-converter',
  slug: 'time-unit-converter',
  q: 'time',
  pair: ['h', 'min'],
  value: 1.5,
  tags: [
    'time converter',
    'hours to minutes',
    'seconds to days',
    'weeks to days',
    'minutes to hours',
    'time units',
  ],
  related: ['time', 'days-until', 'unit-converter'],
  examples: [
    { id: 'hours', inputs: { v: 1.5, from: 'h', to: 'min' }, expect: { result: 90 } },
    { id: 'week', inputs: { v: 1, from: 'wk', to: 'h' }, expect: { result: 168 } },
    {
      id: 'million',
      inputs: { v: 1000000, from: 's', to: 'd' },
      expect: { result: 11.5740740741 },
    },
  ],
});
