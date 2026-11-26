import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, mu: 0, ...inputs } as never, {
    today: '2026-11-26',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'p' | 't' | 'df' | 'critical' | 'mean' | 'sd', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const data = (first: string, second: string, tail: string, alpha = '0.05') =>
  out({ mode: 'data', first, second, tail, alpha });
const hyp = ['6.6 6.5 9.0 10.3 11.3 8.1 6.3 11.6', '6.8 2.4 7.4 8.5 8.1 6.1 3.4 2.0'] as const;

describe('paired-t-test: references (OpenStax Introductory Statistics 2e §10.4)', () => {
  it('Ex 10.11: hypnotism → x̄_d −3.13, s_d 2.91, t −3.036, p 0.0095, reject', () => {
    const o = data(hyp[0], hyp[1], 'left');
    expect([sig(o.mean, 3), sig(o.sd, 3), sig(o.t, 4), sig(o.p, 2), o.df]).toEqual([
      -3.13, 2.91, -3.036, 0.0095, 7,
    ]);
    expect(
      solve({ mode: 'data', first: hyp[0], second: hyp[1], tail: 'left' }).outputs.decision,
    ).toBe('Reject H₀');
  });
  it('Ex 10.12: differences 90, 11, −8, −8 → x̄_d 21.3, s_d 46.7, p 0.2150', () => {
    const o = data('205 241 338 368', '295 252 330 360', 'right');
    expect([sig(o.mean, 3), sig(o.sd, 3), sig(o.p, 3)]).toEqual([21.3, 46.7, 0.215]);
  });
  it('Ex 10.13: shot-put → x̄_d 3.71, s_d 4.50, t 2.18, p 0.0716', () => {
    const o = data('28 14 27 18 17 26 16', '30 26 34 17 19 26 20', 'two');
    expect([sig(o.mean, 3), sig(o.sd, 3), sig(o.t, 3), sig(o.p, 3)]).toEqual([
      3.71, 4.5, 2.18, 0.0716,
    ]);
  });
  it('Ex 10.13 from the rounded summary (3.71, 4.5) → p 0.0719', () =>
    expect(sig(out({ mode: 'summary', n: 7, mean: 3.71, sd: 4.5, tail: 'two' }).p, 3)).toBe(
      0.0719,
    ));
});

describe('paired-t-test: references (OpenStax Introductory Business Statistics §10.6)', () => {
  it('Ex 10.9: 20 employees, x̄_d 3.5, s_d 3.8 → t 4.12, df 19', () => {
    const o = out({ mode: 'summary', n: 20, mean: 3.5, sd: 3.8, tail: 'right', alpha: '0.1' });
    expect([sig(o.t, 3), o.df]).toEqual([4.12, 19]);
  });
  it('Ex 10.10–10.11: one-tailed 5% critical values 1.895 (7 df) and 2.353 (3 df); bench t 0.91', () => {
    expect(sig(data(hyp[0], hyp[1], 'right').critical, 4)).toBe(1.895);
    const bench = data('205 241 338 368', '295 252 330 360', 'right');
    expect([sig(bench.critical, 4), sig(bench.t, 2)]).toEqual([2.353, 0.91]);
  });
  it('Ex 10.10 prints t = 3.06; the data give |t| = 3.036 (ADR-022)', () =>
    expect(sig(Math.abs(data(hyp[0], hyp[1], 'left').t), 3)).toBe(3.04));
});

describe('paired-t-test: behaviour', () => {
  it('lists must match in length; identical lists have no spread', () => {
    expect(
      solve({ mode: 'data', first: '1 2 3', second: '1 2', tail: 'two' }).warnings[0]?.key,
    ).toBe('warn.length');
    expect(
      solve({ mode: 'data', first: '1 2 3', second: '2 3 4', tail: 'two' }).warnings[0]?.key,
    ).toBe('warn.sd');
  });
  it('a hypothesized difference shifts the test', () => {
    const a = out({ mode: 'summary', n: 10, mean: 3, sd: 2, mu: 3, tail: 'two' });
    expect([a.t, a.p]).toEqual([0, 1]);
  });
});

describe('paired-t-test: properties', () => {
  it('swapping the lists flips t; adding a constant to both lists leaves t unchanged', () =>
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.integer({ min: -100, max: 100 }), fc.integer({ min: -100, max: 100 })),
          { minLength: 3, maxLength: 20 },
        ),
        fc.integer({ min: -50, max: 50 }),
        (pairs, k) => {
          const a = pairs.map((p) => p[0]).join(' ');
          const b = pairs.map((p) => p[1]).join(' ');
          const d = pairs.map((p) => p[1] - p[0]);
          fc.pre(new Set(d).size > 1);
          const x = data(a, b, 'two');
          const y = data(b, a, 'two');
          const z = data(
            pairs.map((p) => p[0] + k).join(' '),
            pairs.map((p) => p[1] + k).join(' '),
            'two',
          );
          return (
            Math.abs(x.t + y.t) <= 1e-9 * (Math.abs(x.t) + 1) &&
            Math.abs(x.t - z.t) <= 1e-9 * (Math.abs(x.t) + 1)
          );
        },
      ),
    ));
});

describe('paired-t-test: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
