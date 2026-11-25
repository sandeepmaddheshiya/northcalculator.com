import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (pairs: string) =>
  compute({ ...base, pairs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (pairs: string) => solve(pairs).outputs as Record<string, number>;
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

describe('expected-value: references (OpenStax Intro Stats 2e §4.2)', () => {
  it('Ex 4.3: μ = 1.1, σ = 0.7', () =>
    expect([out('0 0.2; 1 0.5; 2 0.3').mean, out('0 0.2; 1 0.5; 2 0.3').sd]).toEqual([1.1, 0.7]));
  it('Ex 4.4: newborn waking: μ = 2.1, σ ≈ 1.0247', () => {
    const o = out('0 2/50; 1 11/50; 2 23/50; 3 9/50; 4 4/50; 5 1/50');
    expect([o.mean, r4(o.sd!)]).toEqual([2.1, 1.0247]);
  });
  it('Ex 4.5: lottery −2 at 0.99999, +100,000 at 0.00001 → −0.99998', () =>
    expect(out('-2 0.99999; 100000 0.00001').mean).toBe(-0.99998));
  it('Ex 4.6: biased coin → −2/3', () => expect(r4(out('10 1/3; -6 2/3').mean!)).toBe(-0.6667));
  it('Ex 4.7: even faces on two dice → μ = 1, σ ≈ 0.7071', () => {
    const o = out('0 9/36; 1 18/36; 2 9/36');
    expect([o.mean, r4(o.sd!)]).toEqual([1, 0.7071]);
  });
  it('Ex 4.8: μ = −5.006, σ ≈ 28.7186', () => {
    const o = out('50 0.2142; -20 0.7858');
    expect([o.mean, r4(o.sd!)]).toEqual([-5.006, 28.7186]);
  });
});

describe('expected-value: references (OpenStax Contemporary Mathematics §7.11)', () => {
  it('Ex 7.37: die 3.5; two dice 7; Rummy 95/13', () => {
    expect(out('1 1/6; 2 1/6; 3 1/6; 4 1/6; 5 1/6; 6 1/6').mean).toBe(3.5);
    expect(
      out('2 1/36; 3 1/18; 4 1/12; 5 1/9; 6 5/36; 7 1/6; 8 5/36; 9 1/9; 10 1/12; 11 1/18; 12 1/36')
        .mean,
    ).toBe(7);
    expect(out('15 1/13; 10 4/13; 5 8/13').mean).toBe(Number((95 / 13).toPrecision(12)));
  });
  it('die bet: win $10 on a six, else lose $1 → $0.83; win $3 → −$0.33', () => {
    expect(Math.round(out('10 1/6; -1 5/6').mean! * 100) / 100).toBe(0.83);
    expect(Math.round(out('3 1/6; -1 5/6').mean! * 100) / 100).toBe(-0.33);
  });
});

describe('expected-value: behaviour', () => {
  it('percentages parse; probabilities not adding to 1 are flagged', () => {
    expect(out('1 50%; 0 50%').mean).toBe(0.5);
    expect(solve('1 0.5; 0 0.4').warnings[0]?.key).toBe('warn.total');
  });
});

describe('expected-value: properties', () => {
  it('shifting every value by c shifts the mean by c and leaves σ unchanged', () =>
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.integer({ min: -100, max: 100 }), fc.integer({ min: 1, max: 20 })), {
          minLength: 1,
          maxLength: 10,
        }),
        fc.integer({ min: -50, max: 50 }),
        (items, c) => {
          const total = items.reduce((a, [, w]) => a + w, 0);
          const text = (shift: number) =>
            items.map(([x, w]) => `${x + shift} ${w}/${total}`).join('; ');
          const a = out(text(0));
          const b = out(text(c));
          return Math.abs(b.mean! - a.mean! - c) < 1e-9 && Math.abs(b.sd! - a.sd!) < 1e-9;
        },
      ),
    ));
});

describe('expected-value: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(String(e.inputs.pairs));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
