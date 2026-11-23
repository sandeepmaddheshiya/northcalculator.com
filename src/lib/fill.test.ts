import { expect, it } from 'vitest';
import { fill } from './fill';

it('fills placeholders and leaves unknown ones', () => {
  expect(fill('Use {min} or more', { min: '1,000' })).toBe('Use 1,000 or more');
  expect(fill('{a} and {b}', { a: 1 })).toBe('1 and {b}');
});
