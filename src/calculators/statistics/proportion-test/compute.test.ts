import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-26',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'p' | 'z' | 'pHat' | 'critical' | 'se', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const test = (x: number, n: number, p0: number, tail: string, alpha = '0.05') =>
  out({ x, n, p0, tail, alpha });

describe('proportion-test: references (OpenStax Introductory Statistics 2e §9.5)', () => {
  it('Ex 9.17: 53 of 100 vs 50%, two-tailed → z 0.6, p 0.5485', () => {
    const o = test(53, 100, 50, 'two', '0.01');
    expect([o.z, sig(o.p, 4)]).toEqual([0.6, 0.5485]);
  });
  it('Ex 9.18: 43 of 150 vs 30%, two-tailed → p 0.7216', () =>
    expect(sig(test(43, 150, 30, 'two').p, 4)).toBe(0.7216));
  it('Ex 9.19: 17 of 42 vs 25%, right-tailed → z 2.3163, p 0.0103, do not reject at 1%', () => {
    const o = test(17, 42, 25, 'right', '0.01');
    expect([sig(o.z, 5), sig(o.p, 3)]).toEqual([2.3163, 0.0103]);
    expect(solve({ x: 17, n: 42, p0: 25, tail: 'right', alpha: '0.01' }).outputs.decision).toBe(
      'Do not reject H₀',
    );
  });
  it('Ex 9.21: 172 of 420,019 vs 0.034%, right-tailed → z 2.443, p 0.0073', () => {
    const o = test(172, 420019, 0.034, 'right', '0.005');
    expect([sig(o.z, 4), sig(o.p, 2)]).toEqual([2.443, 0.0073]);
  });
  it('Ex 9.22: 11 of 37,937 vs 0.078%, two-tailed → z −3.4189, p 0.00063, reject', () => {
    const o = test(11, 37937, 0.078, 'two', '0.01');
    expect([sig(o.z, 5), sig(o.p, 2)]).toEqual([-3.4189, 0.00063]);
  });
});

describe('proportion-test: references (NIST e-Handbook §7.2.4)', () => {
  it('26 of 200 vs 0.10, one-sided α 0.05 → z 1.414 < 1.645, cannot reject', () => {
    const o = test(26, 200, 10, 'right', '0.05');
    expect([sig(o.z, 4), sig(o.critical, 4)]).toEqual([1.414, 1.645]);
    expect(solve({ x: 26, n: 200, p0: 10, tail: 'right', alpha: '0.05' }).outputs.decision).toBe(
      'Do not reject H₀',
    );
  });
  it('the n·p₀ ≥ 5 rule: p₀ 10% needs n ≥ 50', () => {
    expect(solve({ x: 3, n: 49, p0: 10, tail: 'two' }).warnings[0]?.key).toBe('warn.small');
    expect(solve({ x: 3, n: 50, p0: 10, tail: 'two' }).warnings).toEqual([]);
  });
});

describe('proportion-test: behaviour', () => {
  it('left and right tails add to 1; two-tailed doubles the smaller', () => {
    const r = test(30, 100, 25, 'right').p;
    const l = test(30, 100, 25, 'left').p;
    expect(sig(r + l, 12)).toBe(1);
    expect(sig(test(30, 100, 25, 'two').p, 12)).toBe(sig(2 * Math.min(r, l), 12));
  });
  it('invalid counts are explained', () => {
    expect(solve({ x: 5, n: 4, p0: 50 }).warnings[0]?.key).toBe('warn.x');
    expect(solve({ x: 1, n: 4, p0: 100 }).warnings[0]?.key).toBe('warn.p0');
  });
});

describe('proportion-test: properties', () => {
  it('z is antisymmetric around p₀ and p-values lie in [0, 1]', () =>
    fc.assert(
      fc.property(fc.integer({ min: 10, max: 5000 }), fc.integer({ min: 1, max: 99 }), (n, pct) => {
        const x = Math.round((n * pct) / 100);
        const o = test(x, n, pct, 'two');
        const mirror = test(n - x, n, 100 - pct, 'two');
        return Math.abs(o.z + mirror.z) <= 1e-9 * (Math.abs(o.z) + 1) && o.p >= 0 && o.p <= 1;
      }),
    ));
});

describe('proportion-test: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
