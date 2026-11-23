import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { compute, gcd } from './compute';
import { definition } from './definition';

const ctx = { today: '2026-11-24', fmt: makeFmt('en') };
const run = (
  an: number,
  ad: number,
  op: string,
  bn: number,
  bd: number,
  extra: Record<string, number> = {},
) => compute({ aw: 0, an, ad, op, bw: 0, bn, bd, ...extra }, ctx);
const res = (...args: Parameters<typeof run>) => run(...args).outputs.result;

describe('fractions: OpenStax Prealgebra 2e §4.2 and §4.5 (questions verified 2026-11-24; answers checked with Python fractions)', () => {
  it('Ex 4.67: 1/2 + 1/3 = 5/6', () => expect(res(1, 2, 'add', 1, 3)).toBe('5/6'));
  it('Ex 4.68: 1/2 − (−1/4) = 3/4', () => expect(res(1, 2, 'sub', -1, 4)).toBe('3/4'));
  it('Ex 4.69: 7/12 + 5/18 = 31/36', () => expect(res(7, 12, 'add', 5, 18)).toBe('31/36'));
  it('Ex 4.70: 7/15 − 19/24 = −13/40', () => expect(res(7, 15, 'sub', 19, 24)).toBe('−13/40'));
  it('Ex 4.71: −11/30 + 23/42 = 19/105', () => expect(res(-11, 30, 'add', 23, 42)).toBe('19/105'));
  it('Ex 4.73: −1/4 + 1/6 = −1/12 and −1/4 ÷ 1/6 = −3/2', () => {
    expect(res(-1, 4, 'add', 1, 6)).toBe('−1/12');
    expect(res(-1, 4, 'div', 1, 6)).toBe('−3/2');
  });
  it('Ex 4.25–4.27: 3/4 · 1/5 = 3/20; −5/8 · −2/3 = 5/12; −14/15 · 20/21 = −8/9', () => {
    expect(res(3, 4, 'mul', 1, 5)).toBe('3/20');
    expect(res(-5, 8, 'mul', -2, 3)).toBe('5/12');
    expect(res(-14, 15, 'mul', 20, 21)).toBe('−8/9');
  });
  it('Ex 4.33, 4.35, 4.36: 2/5 ÷ −3/7 = −14/15; −3/4 ÷ −7/8 = 6/7; 7/18 ÷ 14/27 = 3/4', () => {
    expect(res(2, 5, 'div', -3, 7)).toBe('−14/15');
    expect(res(-3, 4, 'div', -7, 8)).toBe('6/7');
    expect(res(7, 18, 'div', 14, 27)).toBe('3/4');
  });
  it('Ex 4.22: 210/385 simplifies to 6/11', () => expect(res(210, 385, 'mul', 1, 1)).toBe('6/11'));
});

describe('fractions: behaviour', () => {
  it('mixed numbers: 2 1/4 × 1 1/3 = 3; −1 1/2 is −3/2', () => {
    expect(run(1, 4, 'mul', 1, 3, { aw: 2, bw: 1 }).outputs.result).toBe('3');
    expect(run(1, 2, 'add', 0, 1, { aw: -1 }).outputs.result).toBe('−3/2');
  });
  it('improper results also show as a mixed number and a decimal', () => {
    const r = run(7, 4, 'add', 1, 2);
    expect(r.outputs.result).toBe('9/4');
    expect(r.outputs.mixed).toBe('2 1/4');
    expect(r.outputs.decimal).toBe(2.25);
  });
  it('zero denominators and division by zero are rejected', () => {
    expect(run(1, 0, 'add', 1, 2).warnings[0]?.key).toBe('warn.zeroDen');
    expect(run(1, 2, 'div', 0, 5).warnings[0]?.key).toBe('warn.divZero');
  });
  it('huge numbers stay exact (beyond 2^53)', () =>
    expect(res(999999999989, 999999999999, 'mul', 999999999999, 999999999989)).toBe('1'));
  it('gcd by Euclid', () => expect(gcd(1071n, 462n)).toBe(21n));
});

describe('fractions: invariants', () => {
  it('a + b − b = a for random fractions', () => {
    const q = fc.tuple(fc.integer({ min: -500, max: 500 }), fc.integer({ min: 1, max: 500 }));
    fc.assert(
      fc.property(q, q, ([an, ad], [bn, bd]) => {
        const sum = res(an, ad, 'add', bn, bd) as string;
        const [sn, sd = '1'] = sum.replace('−', '-').split('/');
        const back = res(Number(sn), Number(sd), 'sub', bn, bd);
        expect(back).toBe(res(an, ad, 'mul', 1, 1));
      }),
    );
  });
});

describe('fractions: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ aw: 0, bw: 0, ...e.inputs } as never, ctx);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
