import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { tCdf } from '@/engine/stats';
import { compute, pValue } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number | undefined, d: number) => Number(x!.toPrecision(d));
const summary = (n: number, mean: number, sd: number, mu0: number, tail = 'two', alpha = '0.05') =>
  out({ mode: 'summary', n, mean, sd, mu0, tail, alpha });

describe('t-test: references (OpenStax Introductory Statistics 2e §9.5)', () => {
  it('Ex 9.16: x̄ 67, s 3.1972, n 10 vs 65, right-tailed → t 1.9781, p 0.0396, reject', () => {
    const o = summary(10, 67, 3.1972, 65, 'right');
    // ADR-022: with s rounded to 3.1972, t = 1.97815; the book’s 1.9781 uses the unrounded s (raw data below).
    expect([sig(o.t, 4), o.df, sig(o.p, 3)]).toEqual([1.978, 9, 0.0396]);
    expect(
      solve({ mode: 'summary', n: 10, mean: 67, sd: 3.1972, mu0: 65, tail: 'right' }).outputs
        .decision,
    ).toBe('Reject H₀');
  });
  it('Ex 9.16 from the raw scores gives the same mean and s', () => {
    const o = out({
      mode: 'data',
      data: '65, 65, 70, 67, 66, 63, 63, 68, 72, 71',
      mu0: 65,
      tail: 'right',
    });
    expect([o.mean, sig(o.sd, 5), sig(o.t, 5), sig(o.p, 3)]).toEqual([67, 3.1972, 1.9781, 0.0396]);
  });
  it('Ex 9.20: x̄ 1.04, s 0.0659, n 11 vs 1 → t 2.014, p 0.036', () => {
    const o = summary(11, 1.04, 0.0659, 1, 'right');
    expect([sig(o.t, 4), sig(o.p, 2)]).toEqual([2.013, 0.036]);
    // ADR-022: exact t is 2.0131; the book's 2.014 comes from rounding inside the calculator.
  });
  it('Ex 9.20 from the 11 readings → t 2.014', () => {
    const o = out({
      mode: 'data',
      data: '1.11 1.07 1.11 1.07 1.12 1.08 .98 .98 1.02 .95 .95',
      mu0: 1,
      tail: 'right',
    });
    expect(sig(o.t, 3)).toBe(2.01);
  });
});

describe('t-test: references (NIST/SEMATECH e-Handbook §1.3.5.2)', () => {
  it('ZARR13: N 195, mean 9.261460, s 0.022789 vs 5 → T 2611.28, ν 194, reject', () => {
    const o = summary(195, 9.26146, 0.022789, 5, 'two');
    // ADR-022: NIST’s 2611.284 comes from the full data; its rounded mean and s give 2611.26.
    expect([sig(o.t, 4), o.df]).toEqual([2611, 194]);
    expect(o.p).toBe(0);
  });
  it('critical values t(0.975, 194) = 1.9723 and t(0.95, 194) = 1.6527', () => {
    expect(sig(summary(195, 9.26146, 0.022789, 5, 'two').critical, 5)).toBe(1.9723);
    expect(sig(summary(195, 9.26146, 0.022789, 5, 'right').critical, 5)).toBe(1.6527);
  });
});

describe('t-test: behaviour', () => {
  it('two-tailed p is twice the one-tailed p; left mirrors right', () => {
    const two = summary(10, 67, 3.1972, 65, 'two').p!;
    const right = summary(10, 67, 3.1972, 65, 'right').p!;
    expect(sig(two, 10)).toBe(sig(2 * right, 10));
    expect(sig(summary(10, 63, 3.1972, 65, 'left').p, 10)).toBe(sig(right, 10));
    expect(summary(10, 67, 3.1972, 65, 'left').critical).toBeLessThan(0);
  });
  it('α = 0.01 keeps H₀ for Ex 9.16', () =>
    expect(
      solve({ mode: 'summary', n: 10, mean: 67, sd: 3.1972, mu0: 65, tail: 'right', alpha: '0.01' })
        .outputs.decision,
    ).toBe('Do not reject H₀'));
  it('rejects n < 2 and s = 0', () => {
    expect(solve({ mode: 'summary', n: 1, mean: 1, sd: 1, mu0: 0 }).warnings[0]?.key).toBe(
      'warn.two',
    );
    expect(solve({ mode: 'summary', n: 5, mean: 1, sd: 0, mu0: 0 }).warnings[0]?.key).toBe(
      'warn.sd',
    );
  });
});

describe('t-test: properties', () => {
  it('p-values agree with the t CDF and lie in [0, 1]', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -8, max: 8, noNaN: true }),
        fc.integer({ min: 1, max: 500 }),
        (t, nu) => {
          const right = pValue(t, nu, 'right');
          const two = pValue(t, nu, 'two');
          return (
            Math.abs(right - (1 - tCdf(t, nu))) <= 1e-12 &&
            two >= 0 &&
            two <= 1 &&
            Math.abs(pValue(t, nu, 'left') + right - 1) <= 1e-12
          );
        },
      ),
    ));
});

describe('t-test: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
