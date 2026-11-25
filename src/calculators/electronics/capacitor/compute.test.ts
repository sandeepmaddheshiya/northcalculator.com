import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('capacitor: references', () => {
  it('College Physics 2e Ex 19.11 / University Physics Ex 8.9: 400 J at 10⁴ V → 8.00 µF', () =>
    expect(out({ find: 'capacitance', v: 10000, e: 400, cu: 'uF' }).result).toBe(8));
  it('Ex 19.8 / 8.1: 8.85 nF at 3.00 × 10³ V → 26.6 µC', () =>
    expect(sig(out({ find: 'energy', c: 8.85, cu: 'nF', v: 3000 }).charge! * 1e6, 3)).toBe(26.6));
  it('§19.5: Teflon, 2.1 × 8.85 nF at 6.0 × 10⁴ V → 1.1 mC', () =>
    expect(sig(out({ find: 'energy', c: 2.1 * 8.85, cu: 'nF', v: 60000 }).charge! * 1e3, 2)).toBe(
      1.1,
    ));
  it('University Physics Ex 8.8: 96 µJ, 64 µJ, 128 µJ (printed 130 to 2 s.f.); total ½(4.0 µF)(12 V)² = 0.29 mJ', () => {
    const u = (c: number, v: number) => out({ find: 'energy', c, cu: 'uF', v }).result! * 1e6;
    expect([u(12, 4), u(2, 8), u(4, 8)]).toEqual([96, 64, 128]);
    expect(sig(u(4, 12) / 1000, 2)).toBe(0.29);
  });
});

describe('capacitor: behaviour', () => {
  it('FAQ: 1,000 µF at 50 V → 1.25 J; 400 J at 1,000 V → 800 µF', () => {
    expect(out({ find: 'energy', c: 1000, cu: 'uF', v: 50 }).result).toBe(1.25);
    expect(out({ find: 'capacitance', v: 1000, e: 400, cu: 'uF' }).result).toBe(800);
  });
  it('voltage from energy: 8 µF holding 400 J is at 10,000 V', () =>
    expect(out({ find: 'voltage', c: 8, cu: 'uF', e: 400 }).result).toBe(10000));
  it('zero divisors are rejected', () =>
    expect(solve({ find: 'capacitance', v: 0, e: 1 }).warnings[0]?.key).toBe('warn.zero'));
});

describe('capacitor: properties', () => {
  it('energy → capacitance → voltage round-trips; doubling V quadruples E', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0.01, max: 1e5, noNaN: true }),
        (c, v) => {
          const e = out({ find: 'energy', c, cu: 'uF', v }).result!;
          const c2 = out({ find: 'capacitance', v, e, cu: 'uF' }).result!;
          const v2 = out({ find: 'voltage', c, cu: 'uF', e }).result!;
          const e2 = out({ find: 'energy', c, cu: 'uF', v: 2 * v }).result!;
          return (
            Math.abs(c2 - c) <= 1e-9 * c &&
            Math.abs(v2 - v) <= 1e-9 * v &&
            Math.abs(e2 - 4 * e) <= 1e-9 * e
          );
        },
      ),
    ));
});

describe('capacitor: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
