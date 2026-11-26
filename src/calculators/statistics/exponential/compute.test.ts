import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, x2: 0, pct: 0, ...inputs } as never, {
    today: '2026-11-26',
    fmt: makeFmt('en'),
  });
type Out = Record<
  'below' | 'above' | 'between' | 'pdf' | 'percentile' | 'mean' | 'median' | 'rate',
  number
>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const mu = (param: number, x: number, extra: Record<string, unknown> = {}) =>
  out({ by: 'mean', param, x, ...extra });

describe('exponential: references (OpenStax Introductory Statistics 2e §5.3)', () => {
  it('Ex 5.7: μ 4 → f(5) = 0.072', () => expect(sig(mu(4, 5).pdf, 2)).toBe(0.072));
  it('Ex 5.8: P(X < 5) 0.7135, P(X < 4) 0.6321, P(4 < X < 5) 0.0814, 50th percentile 2.8', () => {
    const o = mu(4, 4, { x2: 5, pct: 50 });
    expect([
      sig(mu(4, 5).below, 4),
      sig(o.below, 4),
      sig(o.between, 3),
      sig(o.percentile, 2),
    ]).toEqual([0.7135, 0.6321, 0.0814, 2.8]);
  });
  it('Ex 5.9: μ 10 → P(X > 7) 0.4966, 80th percentile 16.1, P(9 < X < 11) 0.0737', () => {
    const o = mu(10, 7, { pct: 80 });
    expect([sig(o.above, 4), sig(o.percentile, 3), sig(mu(10, 9, { x2: 11 }).between, 3)]).toEqual([
      0.4966, 16.1, 0.0737,
    ]);
  });
  it('Ex 5.10: m 1/12 → P(X > 5) 0.6592; Ex 5.11: m 0.5 → 0.3935, 0.0821, 70th percentile 2.41', () => {
    expect(sig(out({ by: 'rate', param: 1 / 12, x: 5 }).above, 4)).toBe(0.6592);
    const r = (x: number, pct = 0) => out({ by: 'rate', param: 0.5, x, pct });
    expect([sig(r(1).below, 4), sig(r(5).above, 3), sig(r(0, 70).percentile, 3)]).toEqual([
      0.3935, 0.0821, 2.41,
    ]);
  });
  it('memoryless: P(X > 7 | X > 4) = P(X > 3) = 0.4724 at μ 4', () => {
    const cond = mu(4, 7).above / mu(4, 4).above;
    expect([sig(cond, 4), sig(mu(4, 3).above, 4)]).toEqual([0.4724, 0.4724]);
  });
});

describe('exponential: references (NIST e-Handbook §8.1.6.1)', () => {
  it('λ 0.01 at 100 h → PDF 0.0037, CDF 0.6321; median ≅ 0.693/λ', () => {
    const o = out({ by: 'rate', param: 0.01, x: 100 });
    expect([sig(o.pdf, 2), sig(o.below, 4), sig(o.median, 3)]).toEqual([0.0037, 0.6321, 69.3]);
  });
});

describe('exponential: behaviour', () => {
  it('mean equals standard deviation; tiny probabilities stay accurate', () => {
    expect(mu(12, 1).mean).toBe(12);
    expect(sig(mu(1e9, 1).below, 6)).toBe(sig(1e-9, 6));
  });
  it('bad inputs are explained', () => {
    expect(solve({ by: 'mean', param: 0, x: 1 }).warnings[0]?.key).toBe('warn.param');
    expect(solve({ by: 'mean', param: 1, x: -1 }).warnings[0]?.key).toBe('warn.x');
  });
});

describe('exponential: properties', () => {
  it('below + above = 1; the percentile inverts the CDF', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-3, max: 1e6, noNaN: true }),
        fc.double({ min: 0, max: 50, noNaN: true }),
        fc.double({ min: 0.1, max: 99.9, noNaN: true }),
        (m, z, p) => {
          const x = z / m;
          const o = out({ by: 'rate', param: m, x, pct: p });
          const back = out({ by: 'rate', param: m, x: o.percentile }).below;
          return Math.abs(o.below + o.above - 1) <= 1e-12 && Math.abs(back - p / 100) <= 1e-9;
        },
      ),
    ));
});

describe('exponential: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
