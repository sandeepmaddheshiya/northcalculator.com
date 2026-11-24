import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { normalCdf, normalInv, tCdf, tInv } from '@/engine/stats';
import { compute, wilson } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const mean = (m: number, sd: number, n: number, level: number, sdKind = 'population') =>
  run({ type: 'mean', mean: m, sd, n, level, sdKind }).outputs as Record<string, number | string>;
const prop = (x: number, n: number, level: number) =>
  run({ type: 'proportion', successes: x, n, level }).outputs as Record<string, number | string>;
const r = (x: unknown, d: number) => Math.round((x as number) * 10 ** d) / 10 ** d;

describe('confidence-interval: t table (NIST/SEMATECH 1.3.6.7.2)', () => {
  it.each([
    [1, 0.975, 12.706],
    [2, 0.999, 22.327],
    [5, 0.995, 4.032],
    [10, 0.975, 2.228],
    [20, 0.95, 1.725],
    [30, 0.99, 2.457],
    [60, 0.975, 2.0],
    [100, 0.9, 1.29],
  ])('ν = %s, p = %s → %s', (nu, p, t) => expect(r(tInv(p, nu), 3)).toBe(t));
  it('z: 1.645, 1.960, 2.576 (OpenStax §8.1) and Φ(1.96) = 0.975', () => {
    expect([r(normalInv(0.95), 3), r(normalInv(0.975), 3), r(normalInv(0.995), 3)]).toEqual([
      1.645, 1.96, 2.576,
    ]);
    expect(r(normalCdf(1.959963984540054), 12)).toBe(0.975);
  });
});

describe('confidence-interval: references', () => {
  it('NIST 1.3.5.2: N = 195, 9.261460, s = 0.022789 → (9.258242, 9.264679), t = 1.9723', () => {
    const o = mean(9.26146, 0.022789, 195, 95, 'sample');
    expect(r(o.critical, 4)).toBe(1.9723);
    // The handbook works from the unrounded data; the printed 6-decimal inputs agree to 1e-6.
    expect(Math.abs((o.lower as number) - 9.258242)).toBeLessThan(1e-6);
    expect(Math.abs((o.upper as number) - 9.264679)).toBeLessThan(1e-6);
  });
  it('OpenStax Ex 8.4: 68, σ 3, n 36, 95% → (67.02, 68.98), EBM 0.98', () => {
    const o = mean(68, 3, 36, 95);
    expect([r(o.lower, 2), r(o.upper, 2), r(o.margin, 2)]).toEqual([67.02, 68.98, 0.98]);
  });
  it('Ex 8.2: 90% → 67.18 to 68.82 (book uses z = 1.645: 67.1775)', () => {
    const o = mean(68, 3, 36, 90);
    expect([r(o.lower, 2), r(o.upper, 2)]).toEqual([67.18, 68.82]);
  });
  it('Ex 8.3: 1.024, σ 0.337, n 30, 98% → (0.8809, 1.1671), EBM 0.1431', () => {
    const o = mean(1.024, 0.337, 30, 98);
    expect([r(o.lower, 4), r(o.upper, 4), r(o.margin, 4)]).toEqual([0.8809, 1.1671, 0.1431]);
  });
  it('Ex 8.10: 421 of 500, 95% → (0.810, 0.874); Ex 8.11: 300 of 500, 90% → (0.564, 0.636)', () => {
    expect(prop(421, 500, 95).interval).toBe('(0.81003, 0.87397)');
    const o = prop(300, 500, 90);
    expect([r(o.lower, 3), r(o.upper, 3), r(o.margin, 3)]).toEqual([0.564, 0.636, 0.036]);
  });
  it('NIST 7.2.4.1 Wilson: p̂ = 0.13, n = 200, one-sided 95% lower limit 0.09577', () => {
    const [lo] = wilson(0.13, 200, normalInv(0.95));
    expect(r(lo, 5)).toBe(0.09577);
  });
});

describe('confidence-interval: behaviour', () => {
  it('higher confidence widens; larger n narrows by √n', () => {
    expect(mean(68, 3, 36, 99).margin as number).toBeGreaterThan(
      mean(68, 3, 36, 95).margin as number,
    );
    expect(
      r((mean(68, 3, 36, 95).margin as number) / (mean(68, 3, 144, 95).margin as number), 12),
    ).toBe(2);
  });
  it('t is wider than z for small samples', () =>
    expect(mean(10, 2, 5, 95, 'sample').margin as number).toBeGreaterThan(
      mean(10, 2, 5, 95).margin as number,
    ));
  it('warnings: x > n, n = 1 for t, small counts', () => {
    expect(run({ type: 'proportion', successes: 6, n: 5, level: 95 }).warnings[0]?.key).toBe(
      'warn.successes',
    );
    expect(
      run({ type: 'mean', mean: 1, sd: 1, n: 1, level: 95, sdKind: 'sample' }).warnings[0]?.key,
    ).toBe('warn.n');
    expect(run({ type: 'proportion', successes: 3, n: 50, level: 95 }).warnings[0]?.key).toBe(
      'warn.small',
    );
  });
});

describe('confidence-interval: properties', () => {
  it('tInv inverts tCdf; t approaches z for large ν', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.51, max: 0.9999, noNaN: true }),
        fc.integer({ min: 1, max: 500 }),
        (p, nu) => {
          const t = tInv(p, nu);
          return Math.abs(tCdf(t, nu) - p) < 1e-12 && t >= normalInv(p) - 1e-9;
        },
      ),
    ));
  it('the interval is symmetric about the estimate', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        fc.double({ min: 0.01, max: 100, noNaN: true }),
        fc.integer({ min: 2, max: 10000 }),
        (m, sd, n) => {
          const o = mean(m, sd, n, 95, 'sample');
          return (
            Math.abs((o.lower as number) + (o.upper as number) - 2 * m) <=
            1e-9 * Math.max(1, Math.abs(m))
          );
        },
      ),
    ));
});

describe('confidence-interval: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
