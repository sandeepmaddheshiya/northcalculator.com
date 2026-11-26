import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fInv, fSf } from '@/engine/fdist';
import { tInv } from '@/engine/stats';
import { anova, compute, parseGroups } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'p' | 'f' | 'critical' | 'dfB' | 'dfW', number>;
const out = (groups: string, alpha = '0.05') => solve({ groups, alpha }).outputs as unknown as Out;
const ss = (groups: string) => {
  const g = parseGroups(groups)!;
  const r = anova(g);
  const N = g.flat().length;
  return { ...r, msb: r.ssb / (g.length - 1), msw: r.ssw / (N - g.length) };
};
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const NIST = '6.9 5.4 5.8 4.6 4.0; 8.3 6.8 7.8 9.2 6.5; 8.0 10.5 8.1 6.9 9.3';
const DIET = '5, 4.5, 4, 3\n3.5, 7, 4.5\n8, 4, 3.5';

describe('anova: references (NIST/SEMATECH e-Handbook §7.4.3.3)', () => {
  it('SST 27.897, SSE 17.452, MST 13.949, MSE 1.454, total 45.349; means 5.34, 7.72, 8.56', () => {
    const r = ss(NIST);
    const r3 = (x: number) => Number(x.toFixed(3));
    expect([r.ssb, r.ssw, r.ssb + r.ssw, r.msb, r.msw].map(r3)).toEqual([
      27.897, 17.452, 45.349, 13.949, 1.454,
    ]);
    expect(r.means.map((m) => Number(m.toFixed(2)))).toEqual([5.34, 7.72, 8.56]);
  });
  it('F 9.59 on (2, 12) df, p 0.00325, F(0.05; 2, 12) 3.89', () => {
    const o = out(NIST);
    expect([sig(o.f, 3), o.dfB, o.dfW, sig(o.p, 3), sig(o.critical, 3)]).toEqual([
      9.59, 2, 12, 0.00325, 3.89,
    ]);
    expect(solve({ groups: NIST }).outputs.decision).toBe('decision.reject');
  });
});

describe('anova: references (OpenStax Introductory Statistics 2e, Example 13.1)', () => {
  it('diet plans: SS_between 2.2458, SS_within 20.8542, MS 1.1229 and 2.9792, F 0.3769', () => {
    const r = ss(DIET);
    const r4 = (x: number) => Number(x.toFixed(4));
    expect([r.ssb, r.ssw, r.msb, r.msw, r.msb / r.msw].map(r4)).toEqual([
      2.2458, 20.8542, 1.1229, 2.9792, 0.3769,
    ]);
    expect(r4(r.ssb + r.ssw)).toBe(23.1);
    expect(solve({ groups: DIET }).outputs.decision).toBe('decision.keep');
  });
  it('the ANOVA table shows SS, df, MS and F to 5 significant figures', () =>
    expect(solve({ groups: DIET }).table!.rows).toEqual([
      ['table.between', 2.2458, 2, 1.1229, 0.37692],
      ['table.within', 20.854, 7, 2.9792, ''],
      ['table.total', 23.1, 9, '', ''],
    ]));
});

describe('anova: F distribution (NIST §1.3.6.7.3 upper critical values)', () => {
  it.each([
    [0.05, 2, 12, 3.885],
    [0.05, 3, 20, 3.098],
    [0.05, 1, 30, 4.171],
    [0.05, 5, 5, 5.05],
    [0.05, 4, 10, 3.478],
    [0.01, 2, 10, 7.559],
    [0.01, 3, 12, 5.953],
  ])('α %f, (%i, %i) → %f', (a, d1, d2, v) => expect(sig(fInv(a, d1, d2), 4)).toBe(v));
  it('upper tail at the critical value equals α', () =>
    expect(fSf(fInv(0.01, 3, 20), 3, 20)).toBeCloseTo(0.01, 12));
});

describe('anova: behaviour', () => {
  it('explains bad input', () => {
    expect(solve({ groups: '1 2 x; 3 4' }).warnings[0]?.key).toBe('warn.groups');
    expect(solve({ groups: '1 2 3' }).warnings[0]?.key).toBe('warn.k');
    expect(solve({ groups: '1; 2' }).warnings[0]?.key).toBe('warn.n');
    expect(solve({ groups: '2 2; 5 5' }).warnings[0]?.key).toBe('warn.noVariance');
  });
  it('flags groups with a single value but still computes', () => {
    const r = solve({ groups: '1 2 3; 7' });
    expect([r.warnings[0]?.key, r.outputs.dfW]).toEqual(['warn.single', 2]);
  });
});

describe('anova: properties', () => {
  it('F(1, ν) critical value is the squared two-sided t critical value', () => {
    for (const nu of [3, 8, 15, 40]) expect(fInv(0.05, 1, nu)).toBeCloseTo(tInv(0.975, nu) ** 2, 8);
  });
  it('F(2, ν) upper tail has the closed form (1 + 2f/ν)^(−ν/2)', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 50, noNaN: true }),
        fc.integer({ min: 1, max: 200 }),
        (f, nu) => Math.abs(fSf(f, 2, nu) - (1 + (2 * f) / nu) ** (-nu / 2)) < 1e-10,
      ),
    ));
  it('two groups: F equals the pooled t statistic squared', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 2, maxLength: 8 }),
        fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 2, maxLength: 8 }),
        (a, b) => {
          const m = (x: number[]) => x.reduce((s, v) => s + v, 0) / x.length;
          const ss = (x: number[]) => x.reduce((s, v) => s + (v - m(x)) ** 2, 0);
          const sp2 = (ss(a) + ss(b)) / (a.length + b.length - 2);
          if (!(sp2 > 0)) return true;
          const t = (m(a) - m(b)) / Math.sqrt(sp2 * (1 / a.length + 1 / b.length));
          const f = out(`${a.join(' ')}; ${b.join(' ')}`).f;
          return Math.abs(f - t * t) <= 1e-9 * Math.max(1, t * t);
        },
      ),
    ));
  it('shifting and scaling every value leaves F unchanged', () => {
    const shifted = NIST.replace(/[\d.]+/g, (x) => String(Number(x) * 3 + 100));
    expect(out(shifted).f).toBeCloseTo(out(NIST).f, 9);
  });
});

describe('anova: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
