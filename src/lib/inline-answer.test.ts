import { describe, expect, it } from 'vitest';
import { inlineAnswer } from './inline-answer';

describe('search inline answers', () => {
  it.each([
    ['15% of 240', 36, 'percentage'],
    ['what is 20 percent of 64.50?', 12.9, 'percentage'],
    ['5 ft to m', 1.524, 'unit-converter'],
    ['100 f in c', 37.7777777778, 'unit-converter'],
    ['3.5 kilograms into pounds', 7.71617917647, 'unit-converter'],
    ['1 tb in gib', 931.322574615, 'unit-converter'],
    ['2^10 + 5', 1029, 'scientific-calculator'],
    ['sin(30)*2', 1, 'scientific-calculator'],
    ['1,250 * 1.08', 1350, 'scientific-calculator'],
  ] as const)('%s', (q, value, calc) => {
    const a = inlineAnswer(q);
    expect(a?.calculator).toBe(calc);
    expect(a!.value).toBeCloseTo(value, 8);
  });
  it('carries the calculator state for the deep link', () => {
    expect(inlineAnswer('15% of 240')?.params).toEqual({ q: 'of', a: '15', b: '240' });
    expect(inlineAnswer('5 ft to m')?.params).toEqual({ q: 'length', v: '5', from: 'ft', to: 'm' });
  });
  it('ignores ordinary searches, lone numbers and mismatched units', () => {
    for (const q of ['mortgage', 'bmi calculator', '240', '15%', '5 kg to m', 'age', '2 +'])
      expect(inlineAnswer(q), q).toBeNull();
  });
  it('parses locale number formats', () =>
    expect(inlineAnswer('1.234,5 * 2', 'de')?.value).toBe(2469));
});
