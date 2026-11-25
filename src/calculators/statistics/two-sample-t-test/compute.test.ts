import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, twoSample } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'p' | 't' | 'df' | 'critical' | 'sp' | 'se' | 'diff', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const sports = { n1: 9, m1: 2, s1: 0.866, n2: 16, m2: 3.2, s2: 1, tail: 'two', method: 'welch' };
const mpg = {
  n1: 249,
  m1: 20.14458,
  s1: 6.4147,
  n2: 79,
  m2: 30.48101,
  s2: 6.10771,
  tail: 'two',
  method: 'pooled',
};

describe('two-sample-t-test: references (OpenStax Introductory Statistics 2e §10.1)', () => {
  it('Ex 10.1: Welch → t −3.14, df ≈ 18.85, p 0.0054, reject', () => {
    const o = out(sports);
    expect([sig(o.t, 3), sig(o.p, 2)]).toEqual([-3.14, 0.0054]);
    // ADR-022: the book's calculator prints df 18.8462; the formula on these inputs gives 18.8466.
    expect(sig(o.df, 4)).toBe(18.85);
    expect(solve(sports).outputs.decision).toBe('Reject H₀');
  });
  it('Ex 10.2: 11, 4, 1.5 vs 9, 3.5, 1, right-tailed → p 0.1928, do not reject at 1%', () => {
    const i = {
      n1: 11,
      m1: 4,
      s1: 1.5,
      n2: 9,
      m2: 3.5,
      s2: 1,
      tail: 'right',
      alpha: '0.01',
      method: 'welch',
    };
    expect(sig(out(i).p, 4)).toBe(0.1928);
    expect(solve(i).outputs.decision).toBe('Do not reject H₀');
  });
});

describe('two-sample-t-test: references (NIST e-Handbook §1.3.5.3)', () => {
  it('AUTO83B pooled: sp 6.34260, T −12.62059, ν 326', () => {
    const o = out(mpg);
    expect([sig(o.sp, 6), sig(o.t, 7), o.df]).toEqual([6.3426, -12.62059, 326]);
  });
  it('critical values t(0.975, 326) = 1.9673 and t(0.95, 326) = 1.6495', () => {
    expect(sig(out(mpg).critical, 5)).toBe(1.9673);
    expect(sig(out({ ...mpg, tail: 'right' }).critical, 5)).toBe(1.6495);
  });
});

describe('two-sample-t-test: behaviour', () => {
  it('equal sizes and SDs: Welch and pooled agree', () => {
    const w = twoSample(10, 5, 2, 10, 4, 2, false);
    const p = twoSample(10, 5, 2, 10, 4, 2, true);
    expect(sig(w.t, 12)).toBe(sig(p.t, 12));
    expect(sig(w.df, 12)).toBe(18);
  });
  it('pooled with very unequal SDs warns; bad inputs are explained', () => {
    expect(solve({ ...mpg, s1: 1, s2: 5 }).warnings[0]?.key).toBe('warn.unequal');
    expect(solve({ ...sports, n1: 1 }).warnings[0]?.key).toBe('warn.n');
    expect(solve({ ...sports, s2: 0 }).warnings[0]?.key).toBe('warn.sd');
  });
});

describe('two-sample-t-test: properties', () => {
  const pos = fc.double({ min: 0.1, max: 100, noNaN: true });
  const mean = fc.double({ min: -100, max: 100, noNaN: true });
  const size = fc.integer({ min: 2, max: 200 });
  it('Welch df lies between min(n₁,n₂) − 1 and n₁ + n₂ − 2; swapping groups flips t', () =>
    fc.assert(
      fc.property(size, mean, pos, size, mean, pos, (n1, m1, s1, n2, m2, s2) => {
        const a = twoSample(n1, m1, s1, n2, m2, s2, false);
        const b = twoSample(n2, m2, s2, n1, m1, s1, false);
        return (
          a.df >= Math.min(n1, n2) - 1 - 1e-9 &&
          a.df <= n1 + n2 - 2 + 1e-9 &&
          Math.abs(a.t + b.t) <= 1e-9 * (Math.abs(a.t) + 1)
        );
      }),
    ));
});

describe('two-sample-t-test: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
