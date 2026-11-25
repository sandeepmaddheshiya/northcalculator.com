import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (n: number, p: number, x: number) =>
  compute({ ...base, n, p, x } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (n: number, p: number, x: number) => solve(n, p, x).outputs as Record<string, number>;
const r4 = (v: number) => Math.round(v * 1e4) / 1e4;

describe('binomial: references (OpenStax Intro Stats 2e §4.3)', () => {
  it('Ex 4.13: B(20, 0.41): P(x ≤ 12) = 0.9738, μ = 8.2, σ = 2.20', () => {
    const o = out(20, 0.41, 12);
    expect([r4(o.le!), o.mean, Math.round(o.sd! * 100) / 100]).toEqual([0.9738, 8.2, 2.2]);
  });
  it('Ex 4.14: B(100, 8/560): P(2) = 0.2466, P(≤ 6) = 0.9994, P(> 3) = 0.0557, σ ≈ 1.1867', () => {
    const p = 8 / 560;
    expect([
      r4(out(100, p, 2).eq!),
      r4(out(100, p, 6).le!),
      r4(out(100, p, 3).gt!),
      r4(out(100, p, 0).sd!),
    ]).toEqual([0.2466, 0.9994, 0.0557, 1.1867]);
  });
  it('Ex 4.15: B(200, 0.015): μ = 3, σ = 1.719, P(≤ 8) = 0.9965, P(5) = 0.1011, P(6) = 0.0500', () => {
    const o = out(200, 0.015, 8);
    expect([
      o.mean,
      Math.round(o.sd! * 1000) / 1000,
      r4(o.le!),
      r4(out(200, 0.015, 5).eq!),
      r4(out(200, 0.015, 6).eq!),
    ]).toEqual([3, 1.719, 0.9965, 0.1011, 0.05]);
  });
  it('Ex 4.11: B(5, 0.25): P(4) = 0.0146; P(5) = 0.0010, not the printed 0.0007; P(> 3) = 0.0156', () => {
    expect([r4(out(5, 0.25, 4).eq!), r4(out(5, 0.25, 5).eq!), r4(out(5, 0.25, 3).gt!)]).toEqual([
      0.0146, 0.001, 0.0156,
    ]);
    expect(out(5, 0.25, 0).mean).toBe(1.25);
  });
});

describe('binomial: behaviour', () => {
  it('FAQ: 3 heads in 5 fair tosses = 0.3125; at least one six in 4 rolls ≈ 0.518', () => {
    expect(out(5, 0.5, 3).eq).toBe(0.3125);
    expect(Math.round(out(4, 1 / 6, 1).ge! * 1000) / 1000).toBe(0.518);
  });
  it('p = 0 and p = 1 are certain', () => {
    expect([out(10, 0, 0).eq, out(10, 1, 10).eq, out(10, 1, 9).eq]).toEqual([1, 1, 0]);
  });
  it('large n stays finite: B(100000, 0.5) at the mean ≈ 0.0025231', () =>
    expect(Number(out(100000, 0.5, 50000).eq!.toPrecision(5))).toBe(0.0025231));
  it('x outside 0…n is rejected', () => expect(solve(5, 0.5, 6).warnings[0]?.key).toBe('warn.x'));
});

describe('binomial: properties', () => {
  it('the tails add to 1 and P(≤ x) − P(< x) = P(= x)', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 300 }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.integer({ min: 0, max: 300 }),
        (n, p, x0) => {
          const x = x0 % (n + 1);
          const o = out(n, p, x);
          return (
            Math.abs(o.le! + o.gt! - 1) < 1e-10 &&
            Math.abs(o.le! - o.lt! - o.eq!) < 1e-10 &&
            Math.abs(o.ge! + o.lt! - 1) < 1e-10
          );
        },
      ),
    ));
});

describe('binomial: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(Number(e.inputs.n), Number(e.inputs.p), Number(e.inputs.x));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
