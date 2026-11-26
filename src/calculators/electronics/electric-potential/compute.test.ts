import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { K } from '@/calculators/electronics/coulomb/compute';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, test: null, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'result' | 'v' | 'e' | 'q' | 'u' | 'f', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('electric-potential: references (OpenStax College Physics 2e §19.3, §18.4)', () => {
  it('Ex 19.6: −3.00 nC at 5.00 cm → −539 V', () =>
    expect(sig(out({ find: 'v', q: -3, qu: 'nC', r: 5, ru: 'cm' }).result, 3)).toBe(-539));
  it('Ex 19.7: 100 kV at r 0.125 m → Q 1.39 µC', () =>
    expect(sig(out({ find: 'q', v: 1e5, qu: 'uC', r: 0.125, ru: 'm' }).result, 3)).toBe(1.39));
  it('Ex 18.2: 2.00 nC at 5.00 mm → 7.19 × 10⁵ N/C; Ex 18.3: −0.250 µC there → 0.180 N', () => {
    const o = out({ find: 'v', q: 2, qu: 'nC', r: 5, ru: 'mm', test: -0.25, tu: 'uC' });
    expect([sig(o.e, 3), sig(o.f, 3)]).toEqual([7.19e5, 0.18]);
  });
});

describe('electric-potential: references (OpenStax University Physics Vol. 2 §7.3)', () => {
  it('Ex 7.10: −539 V; Ex 7.11: 1.39 µC on a 25.0 cm sphere at 100 kV', () => {
    expect(sig(out({ find: 'v', q: -3, qu: 'nC', r: 5, ru: 'cm' }).v, 3)).toBe(-539);
    expect(sig(out({ find: 'q', v: 1e5, qu: 'uC', r: 12.5, ru: 'cm' }).result, 3)).toBe(1.39);
  });
  it('Ex 7.12 dipole (k 9.0 × 10⁹): ±3.0 nC 4.0 cm apart, point 1.0 cm above centre → 1.8 × 10³ V', () => {
    // Potentials add: +3 nC at 1 cm and −3 nC at 3 cm.
    const plus = out({ find: 'v', q: 3, qu: 'nC', r: 1, ru: 'cm' }).v;
    const minus = out({ find: 'v', q: -3, qu: 'nC', r: 3, ru: 'cm' }).v;
    expect(sig(plus + minus, 2)).toBe(1.8e3);
  });
});

describe('electric-potential: behaviour', () => {
  it('k is from CODATA 2022; potential energy U = qV', () => {
    expect(sig(K, 6)).toBe(8.98755e9);
    const o = out({ find: 'v', q: 1, qu: 'uC', r: 1, ru: 'm', test: 2, tu: 'uC' });
    expect(sig(o.u, 10)).toBe(sig(2e-6 * o.v, 10));
  });
  it('zero distance is rejected', () =>
    expect(solve({ find: 'v', q: 1, r: 0 }).warnings[0]?.key).toBe('warn.r'));
});

describe('electric-potential: properties', () => {
  it('V → Q round-trips; doubling r halves V and quarters E', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        (q, r) => {
          fc.pre(Math.abs(q) > 1e-6);
          const a = out({ find: 'v', q, qu: 'nC', r, ru: 'm' });
          const b = out({ find: 'q', v: a.v, qu: 'nC', r, ru: 'm' });
          const far = out({ find: 'v', q, qu: 'nC', r: 2 * r, ru: 'm' });
          return (
            Math.abs(b.result - q) <= 1e-9 * Math.abs(q) &&
            Math.abs(far.v - a.v / 2) <= 1e-9 * Math.abs(a.v) &&
            Math.abs(far.e - a.e / 4) <= 1e-9 * a.e
          );
        },
      ),
    ));
});

describe('electric-potential: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
