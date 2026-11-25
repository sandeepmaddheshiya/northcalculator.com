import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (mean: number, x: number) =>
  compute({ ...base, mean, x } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (mean: number, x: number) => solve(mean, x).outputs as Record<string, number>;
const r4 = (v: number) => Math.round(v * 1e4) / 1e4;

describe('poisson: references (OpenStax Intro Stats 2e §4.6)', () => {
  it('Ex 4.29: μ = 0.75, P(x > 1) = 0.1734 (hand sum 0.4724 + 0.3543)', () => {
    expect(r4(out(0.75, 1).gt!)).toBe(0.1734);
    expect([r4(out(0.75, 0).eq!), r4(out(0.75, 1).eq!)]).toEqual([0.4724, 0.3543]);
  });
  it('Ex 4.30: μ = 147: P(160) ≈ 0.0180, P(≤ 160) ≈ 0.8666, σ ≈ 12.1244', () => {
    const o = out(147, 160);
    expect([r4(o.eq!), r4(o.le!), r4(o.sd!)]).toEqual([0.018, 0.8666, 12.1244]);
  });
  it('Ex 4.31: μ = 41.5/24: P(2) ≈ 0.2653, P(> 2) = 0.2505', () => {
    const o = out(41.5 / 24, 2);
    expect([r4(o.eq!), r4(o.gt!)]).toEqual([0.2653, 0.2505]);
  });
  it('Ex 4.32: μ = 2.04, P(10) ≈ 0.000045', () =>
    expect(Number(out(2.04, 10).eq!.toPrecision(2))).toBe(0.000045));
});

describe('poisson: behaviour', () => {
  it('FAQ: μ = 2, P(3) ≈ 0.1804; P(0) = e⁻² ≈ 0.135', () => {
    expect(r4(out(2, 3).eq!)).toBe(0.1804);
    expect(Math.round(out(2, 0).eq! * 1000) / 1000).toBe(0.135);
  });
  it('μ = 0 is certain to give 0 events; large μ stays finite', () => {
    expect([out(0, 0).eq, out(0, 3).eq]).toEqual([1, 0]);
    expect(out(100000, 100000).eq).toBeGreaterThan(0.00126);
  });
  it('negative mean rejected', () => expect(solve(-1, 2).warnings[0]?.key).toBe('warn.mean'));
});

describe('poisson: properties', () => {
  it('the two tails add to 1', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 2000, noNaN: true }),
        fc.integer({ min: 0, max: 3000 }),
        (mu, x) => {
          const o = out(mu, x);
          return Math.abs(o.le! + o.gt! - 1) < 1e-9 && Math.abs(o.ge! + o.lt! - 1) < 1e-9;
        },
      ),
    ));
});

describe('poisson: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(Number(e.inputs.mean), Number(e.inputs.x));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
