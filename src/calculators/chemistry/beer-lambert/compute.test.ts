import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'result' | 'a' | 't' | 'absorbed' | 'molar', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('beer-lambert: references (Harvey, Analytical Chemistry 2.1 §10.2)', () => {
  it('Example 10.2.1: 50.0 %T → A 0.301', () =>
    expect(sig(out({ find: 'e', measure: 'T', reading: 50, conc: 1, cu: 'M' }).a, 3)).toBe(0.301));
  it('Exercise 10.2.1: A 1.27 → 5.4 %T', () =>
    expect(sig(out({ find: 'e', measure: 'A', reading: 1.27, conc: 1, cu: 'M' }).t, 2)).toBe(5.4));
  it('Example 10.2.2: 5.00 × 10⁻⁴ M, 1.00 cm, A 0.338 → ε 676', () =>
    expect(
      sig(out({ find: 'e', measure: 'A', reading: 0.338, path: 1, conc: 5e-4, cu: 'M' }).result, 3),
    ).toBe(676));
  it('Exercise 10.2.2: A 0.228, ε 676 → 3.37 × 10⁻⁴ M', () =>
    expect(
      sig(out({ find: 'c', measure: 'A', reading: 0.228, eps: 676, path: 1, cu: 'M' }).result, 3),
    ).toBe(3.37e-4));
});

describe('beer-lambert: references (Clark, LibreTexts “The Beer-Lambert Law”)', () => {
  it('Example 1: A = 1 → 10% transmitted, 90% absorbed', () => {
    const o = out({ find: 'e', measure: 'A', reading: 1, conc: 1, cu: 'M' });
    expect([sig(o.t, 6), sig(o.absorbed, 6)]).toEqual([10, 90]);
  });
  it('Example 2: guanosine, ε 8400, 1 cm, A 0.70 → 8.33 × 10⁻⁵ mol/L', () => {
    const o = out({ find: 'c', measure: 'A', reading: 0.7, eps: 8400, path: 1, cu: 'uM' });
    expect([sig(o.molar, 3), sig(o.result, 3)]).toEqual([8.33e-5, 83.3]);
  });
});

describe('beer-lambert: behaviour', () => {
  it('forward: A = εbc with unit conversion', () =>
    expect(out({ find: 'a', eps: 8400, path: 2, conc: 50, cu: 'uM' }).result).toBeCloseTo(
      0.84,
      12,
    ));
  it('explains invalid readings', () => {
    expect(solve({ find: 'c', measure: 'T', reading: 0 }).warnings[0]?.key).toBe('warn.t');
    expect(solve({ find: 'c', measure: 'T', reading: 120 }).warnings[0]?.key).toBe('warn.t');
    expect(solve({ find: 'c', eps: 0 }).warnings[0]?.key).toBe('warn.eps');
    expect(solve({ find: 'c', path: 0 }).warnings[0]?.key).toBe('warn.path');
    expect(solve({ find: 'e', conc: 0 }).warnings[0]?.key).toBe('warn.conc');
  });
  it('100 %T is zero absorbance', () =>
    expect(out({ find: 'e', measure: 'T', reading: 100, conc: 1 }).a).toBe(0));
});

describe('beer-lambert: properties', () => {
  it('solving for c, then ε, then A returns the starting values', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e5, noNaN: true }),
        fc.double({ min: 0.01, max: 10, noNaN: true }),
        fc.double({ min: 0.001, max: 3, noNaN: true }),
        (eps, path, A) => {
          const c = out({ find: 'c', measure: 'A', reading: A, eps, path, cu: 'M' }).result;
          const e = out({ find: 'e', measure: 'A', reading: A, path, conc: c, cu: 'M' }).result;
          const a = out({ find: 'a', eps, path, conc: c, cu: 'M' }).result;
          return Math.abs(e / eps - 1) < 1e-9 && Math.abs(a / A - 1) < 1e-9;
        },
      ),
    ));
  it('%T and absorbance round-trip', () =>
    fc.assert(
      fc.property(fc.double({ min: 0.01, max: 100, noNaN: true }), (t) => {
        const o = out({ find: 'e', measure: 'T', reading: t, conc: 1, cu: 'M' });
        return Math.abs(o.t / t - 1) < 1e-9 && Math.abs(o.t + o.absorbed - 100) < 1e-9;
      }),
    ));
});

describe('beer-lambert: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
