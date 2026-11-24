import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, parseExponent } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (b: number, n: string) =>
  compute({ ...base, base: b, power: n } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('exponent: references (OpenStax)', () => {
  it('Prealgebra 2e Ex 10.63: 4⁻² = 1/16; 10⁻³ = 1/1000', () => {
    expect(run(4, '-2').outputs.exact).toBe('1/16');
    expect(run(10, '-3').outputs.result).toBe(0.001);
  });
  it('Prealgebra 2e Ex 10.64: (−3)⁻² = 1/9', () => expect(run(-3, '-2').outputs.exact).toBe('1/9'));
  it('Intermediate Algebra 2e Ex 10.21: 9^(1/2) = 3 (log₉ 3 = 1/2)', () =>
    expect(run(9, '1/2').outputs.result).toBe(3));
  it('Intermediate Algebra 2e Ex 8.3: 64^(1/3) = 4, 81^(1/4) = 3, 32^(1/5) = 2', () => {
    expect(run(64, '1/3').outputs.result).toBe(4);
    expect(run(81, '1/4').outputs.result).toBe(3);
    expect(run(32, '1/5').outputs.result).toBe(2);
  });
  it('Intermediate Algebra 2e Ex 8.4: (−125)^(1/3) = −5; (−243)^(1/5) = −3', () => {
    expect(run(-125, '1/3').outputs.result).toBe(-5);
    expect(run(-243, '1/5').outputs.result).toBe(-3);
  });
});

describe('exponent: behaviour', () => {
  it('2⁶⁴ exactly', () => expect(run(2, '64').outputs.exact).toBe('18,446,744,073,709,551,616'));
  it('27^(2/3) = 9 and 16^(3/4) = 8', () => {
    expect(run(27, '2/3').outputs.result).toBe(9);
    expect(run(16, '3/4').outputs.result).toBe(8);
  });
  it('decimals become fractions: 4^0.5 = 2, 4^2.5 = 32', () => {
    expect(run(4, '0.5').outputs.result).toBe(2);
    expect(run(4, '2.5').outputs.result).toBe(32);
  });
  it('even roots of negatives are not real', () =>
    expect(run(-16, '1/4').warnings[0]?.key).toBe('warn.evenRoot'));
  it('0 to a negative power is undefined; 0⁰ = 1', () => {
    expect(run(0, '-1').warnings[0]?.key).toBe('warn.zeroNegative');
    expect(run(0, '0').outputs.result).toBe(1);
  });
  it('compound growth: 1.05¹⁰', () =>
    expect(run(1.05, '10').outputs.result).toBeCloseTo(1.628894627, 9));
  it('scientific notation', () => expect(run(4, '-2').outputs.scientific).toBe('6.25 × 10⁻²'));
  it('bad exponent text', () => expect(run(2, 'abc').warnings[0]?.key).toBe('warn.parse'));
  it('parses fractions and decimals', () => {
    expect(parseExponent('-1/2')).toEqual({ p: -1, q: 2 });
    expect(parseExponent('0.25')).toEqual({ p: 25, q: 100 });
  });
});

describe('exponent: properties', () => {
  it('integer powers match repeated multiplication', () =>
    fc.assert(
      fc.property(fc.integer({ min: -20, max: 20 }), fc.integer({ min: 0, max: 12 }), (b, n) => {
        let x = 1;
        for (let i = 0; i < n; i++) x *= b;
        return run(b, String(n)).outputs.result === x;
      }),
    ));
  it('b^(1/q) raised to q returns b for perfect powers', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 2, max: 5 }),
        (r, q) => run(r ** q, `1/${q}`).outputs.result === r,
      ),
    ));
});

describe('exponent: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
