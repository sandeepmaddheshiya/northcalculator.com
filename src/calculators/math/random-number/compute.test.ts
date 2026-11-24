import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { stateFromSeed, uniformBelow, xoshiro128ss } from '@/engine/random';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const nums = (s: unknown) =>
  String(s)
    .split(', ')
    .map((x) => Number(x.replace(/,/g, '')));

describe('random-number: references', () => {
  it('xoshiro128** 1.1 reference vector (Blackman & Vigna; rand_xoshiro tests; Python re-implementation)', () => {
    const rng = xoshiro128ss([1, 2, 3, 4]);
    expect(Array.from({ length: 10 }, rng)).toEqual([
      11520, 0, 5927040, 70819200, 2031721883, 1637235492, 1287239034, 3734860849, 3729100597,
      4258142804,
    ]);
  });
  it('C(49, 6) = 13,983,816 (combinations)', () =>
    expect(run({ min: 1, max: 49, count: 6, unique: true, sorted: true }).outputs.chance).toBe(
      '1 in 13,983,816',
    ));
});

describe('random-number: behaviour', () => {
  it('the same seed gives the same draw; another seed differs', () => {
    const a = run({ count: 20, seed: 'abc' }).outputs.result;
    expect(run({ count: 20, seed: 'abc' }).outputs.result).toBe(a);
    expect(run({ count: 20, seed: 'abd' }).outputs.result).not.toBe(a);
  });
  it('draws stay within the range', () => {
    for (const v of nums(run({ min: -5, max: 5, count: 500, seed: 'x' }).outputs.result)) {
      expect(v).toBeGreaterThanOrEqual(-5);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
  it('no repeats really has no repeats', () => {
    const v = nums(run({ min: 1, max: 10, count: 10, unique: true, seed: 'q' }).outputs.result);
    expect(new Set(v).size).toBe(10);
  });
  it('asking for too many unique numbers is capped', () => {
    const r = run({ min: 1, max: 5, count: 9, unique: true });
    expect(nums(r.outputs.result)).toHaveLength(5);
    expect(r.warnings[0]?.key).toBe('warn.tooMany');
  });
  it('sorted output is ascending', () => {
    const v = nums(run({ min: 1, max: 1000, count: 50, sorted: true, seed: 's' }).outputs.result);
    expect(v).toEqual([...v].sort((a, b) => a - b));
  });
  it('min > max is swapped', () =>
    expect(run({ min: 10, max: 1 }).warnings[0]?.key).toBe('warn.swapped'));
  it('chance of 10 coin tosses is 1 in 1,024', () =>
    expect(run({ min: 0, max: 1, count: 10 }).outputs.chance).toBe('1 in 1,024'));
  it('chance of an ordered unique draw is N!/(N−k)!', () =>
    expect(run({ min: 1, max: 5, count: 3, unique: true }).outputs.chance).toBe('1 in 60'));
  it('huge ranges are rejected', () =>
    expect(run({ min: 0, max: 5e9 }).warnings[0]?.key).toBe('warn.range'));
  it('different seed texts map to non-zero states', () =>
    expect(stateFromSeed('').some((x) => x !== 0)).toBe(true));
});

describe('random-number: properties', () => {
  it('uniformBelow is unbiased: chi-square over 60,000 draws of 1–6 stays below the 0.1% critical value (20.5)', () => {
    const rng = xoshiro128ss(stateFromSeed('chi'));
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60000; i++) counts[uniformBelow(rng, 6)]!++;
    const chi = counts.reduce((a, c) => a + (c - 10000) ** 2 / 10000, 0);
    expect(chi).toBeLessThan(20.5);
  });
  it('every draw is within [0, n) for any n', () =>
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 1, max: 2 ** 32 }), (seed, n) => {
        const rng = xoshiro128ss(stateFromSeed(seed));
        const x = uniformBelow(rng, n);
        return x >= 0 && x < n && Number.isInteger(x);
      }),
    ));
});

describe('random-number: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
