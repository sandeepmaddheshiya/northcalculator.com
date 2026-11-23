import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { compute } from './compute';
import { definition } from './definition';

const ctx = { today: '2026-11-23', fmt: makeFmt('en', 'USD') };
const run = (mode: string, a: number | null, b: number | null) => compute({ mode, a, b }, ctx);
const res = (mode: string, a: number, b: number) => run(mode, a, b).outputs.result;

describe('percentage: independent reference values', () => {
  // OpenStax Prealgebra 2e §6.2 (verified 2026-11-24), Examples 6.14–6.24.
  it('Ex 6.14: 35% of 90 is 31.5', () => expect(res('of', 35, 90)).toBe(31.5));
  it('Ex 6.15: 125% of 28 is 35', () => expect(res('of', 125, 28)).toBe(35));
  it('Ex 6.16: 36 is 75% of 48', () => expect(res('whole', 36, 75)).toBe(48));
  it('Ex 6.17: 6.5% of what number is $1.17 → $18', () => expect(res('whole', 1.17, 6.5)).toBe(18));
  it('Ex 6.18: 9 is 25% of 36', () => expect(res('is', 9, 36)).toBe(25));
  it('Ex 6.19: 144 is 150% of 96', () => expect(res('is', 144, 96)).toBe(150));
  it('Ex 6.20: an 18% tip on $68.50 is $12.33', () => expect(res('of', 18, 68.5)).toBe(12.33));
  it('Ex 6.23: $26 → $36 is a 38.5% increase (to 0.1%)', () =>
    expect(res('change', 26, 36)).toBeCloseTo(38.4615, 4));
  it('Ex 6.24: $3.71 → $3.64 is a 1.9% decrease (to 0.1%)', () =>
    expect(res('change', 3.71, 3.64)).toBeCloseTo(-1.8868, 4));
});

describe('percentage: modes and edge cases', () => {
  it('percentage difference is symmetric and uses the mean', () => {
    expect(res('diff', 80, 100)).toBeCloseTo(22.2222, 4);
    expect(res('diff', 100, 80)).toBe(res('diff', 80, 100));
  });
  it('increase and decrease', () => {
    expect(res('increase', 200, 15)).toBe(230);
    expect(res('decrease', 200, 15)).toBe(170);
  });
  it('reverse percentage recovers the original (VAT and discount)', () => {
    expect(res('original', 120, 20)).toBe(100);
    expect(res('original', 68, -15)).toBe(80);
  });
  it('removes binary noise (0.1 + 0.2 style)', () => {
    expect(res('of', 7, 0.1)).toBe(0.007);
    expect(res('increase', 0.1, 200)).toBe(0.3);
  });
  it('zero divisors produce a warning, not Infinity', () => {
    for (const [mode, a, b, key] of [
      ['is', 5, 0, 'warn.zeroWhole'],
      ['whole', 5, 0, 'warn.zeroPercent'],
      ['change', 0, 5, 'warn.zeroStart'],
      ['diff', 5, -5, 'warn.zeroMean'],
      ['original', 5, -100, 'warn.minus100'],
    ] as const) {
      const r = run(mode, a, b);
      expect(r.outputs.result).toBeNull();
      expect(r.warnings[0]?.key).toBe(key);
    }
  });
  it('negative starting value measures change against its magnitude', () => {
    const r = run('change', -50, -25);
    expect(r.outputs.result).toBe(50);
    expect(r.warnings[0]?.key).toBe('warn.negativeStart');
  });
  it('huge and tiny values stay finite', () => {
    expect(res('of', 50, 1e15)).toBe(5e14);
    expect(res('of', 1e-9, 1)).toBe(1e-11);
  });
  it('missing input gives no result and no crash', () => {
    expect(run('of', null, 5).outputs.result).toBeNull();
  });
  it('every mode produces steps and an explanation', () => {
    for (const o of definition.inputs[0]!.type === 'select' ? definition.inputs[0]!.options : []) {
      const r = run(o.value, 40, 25);
      expect(r.steps.length, o.value).toBeGreaterThan(0);
      expect(r.explain, o.value).toBeDefined();
    }
  });
});

describe('percentage: properties', () => {
  const finite = fc.double({ min: -1e6, max: 1e6, noNaN: true }).filter((x) => Math.abs(x) > 1e-6);
  it('"X is what % of Y" inverts "P% of Y"', () => {
    fc.assert(
      fc.property(finite, finite, (p, y) => {
        const part = res('of', p, y) as number;
        // Results keep 12 significant digits, so compare relatively.
        expect((res('is', part, y) as number) / p).toBeCloseTo(1, 9);
      }),
    );
  });
  it('original value inverts an increase', () => {
    fc.assert(
      fc.property(finite, fc.double({ min: -99, max: 1000, noNaN: true }), (v, p) => {
        const after = res('increase', v, p) as number;
        expect((res('original', after, p) as number) / v).toBeCloseTo(1, 8);
      }),
    );
  });
});

describe('percentage: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...e.inputs } as never, ctx);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
