import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, K, R_US } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<'power' | 'heat' | 'kwh' | 'perArea' | 'rSI' | 'rUS', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('conduction: references (OpenStax College Physics 2e §14.5)', () => {
  it('Table 14.3 values', () =>
    expect([K.copper, K.aluminum, K.glass, K.styrofoam, K.air]).toEqual([
      390, 220, 0.84, 0.01, 0.023,
    ]));
  it('Ex 14.5: Styrofoam 0.950 m², 2.50 cm, 35.0 °C → 13.3 J/s, 1.15 × 10⁶ J/day, 3.44 kg of ice', () => {
    const o = out({
      material: 'styrofoam',
      area: 0.95,
      thickness: 2.5,
      hot: 35,
      cold: 0,
      hours: 24,
    });
    expect([sig(o.power, 3), sig(o.heat, 3), sig(o.heat / 334e3, 3)]).toEqual([13.3, 1.15e6, 3.44]);
  });
  it('Ex 14.6: aluminum pan, π(0.07)² m², 0.800 cm, 2256 W → 5.33 °C', () => {
    const A = Math.PI * 0.07 ** 2;
    const per = out({
      material: 'aluminum',
      area: A,
      thickness: 0.8,
      hot: 1,
      cold: 0,
      hours: 0,
    }).power;
    expect(sig(2256 / per, 3)).toBe(5.33);
  });
});

describe('conduction: references (OpenStax University Physics Vol. 2 §1.6)', () => {
  it('Ex 1.10: polystyrene 0.035 → 46.6 W, 4.02 × 10⁶ J/day (printed 4.03 from 46.6 × 86,400), 12.0 kg', () => {
    const o = out({
      material: 'polystyrene',
      area: 0.95,
      thickness: 2.5,
      hot: 35,
      cold: 0,
      hours: 24,
    });
    // 46.55 W exactly; printed 46.6.
    expect(sig(o.power, 4)).toBe(46.55);
    // ADR-022: exact Q is 4.022 × 10⁶ J; the book multiplies the rounded 46.6 W and prints 4.03.
    expect(sig(o.heat, 3)).toBe(4.02e6);
    expect(sig(46.6 * 86400, 3)).toBe(4.03e6);
  });
  it('Ex 1.11: steel and aluminum rods meet at 41.3 °C and carry 1.47 W', () => {
    const A = Math.PI * 0.005 ** 2;
    const rate = (m: string, hot: number, cold: number) =>
      out({ material: m, area: A, thickness: 25, hot, cold, hours: 0 }).power;
    // Equal heat flow through both rods: solve for the junction temperature.
    const ks = rate('steel', 1, 0);
    const ka = rate('aluminum', 1, 0);
    const T = (ks * 100 + ka * 20) / (ks + ka);
    expect([sig(T, 3), sig(rate('steel', 100, T), 3)]).toEqual([41.3, 1.47]);
  });
});

describe('conduction: behaviour', () => {
  it('R-value: 1 m²·K/W = 5.678 US R; 3.5 in of k 0.042 ≈ R-12.0', () => {
    expect(sig(1 / R_US, 4)).toBe(5.678);
    expect(
      sig(out({ material: 'glasswool', area: 1, thickness: 8.89, hot: 1, cold: 0 }).rUS, 3),
    ).toBe(12);
  });
  it('custom k, reversed temperatures, and bad sizes', () => {
    expect(out({ material: 'custom', k: 1, area: 2, thickness: 10, hot: 5, cold: 0 }).power).toBe(
      100,
    );
    expect(
      solve({ material: 'cork', area: 1, thickness: 1, hot: 0, cold: 10 }).warnings[0]?.key,
    ).toBe('warn.reverse');
    expect(
      solve({ material: 'cork', area: 0, thickness: 1, hot: 1, cold: 0 }).warnings[0]?.key,
    ).toBe('warn.size');
  });
});

describe('conduction: properties', () => {
  it('doubling thickness halves the flow; doubling area doubles it', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        (A, d, dT) => {
          const p = out({ material: 'wool', area: A, thickness: d, hot: dT, cold: 0 }).power;
          const thick = out({
            material: 'wool',
            area: A,
            thickness: 2 * d,
            hot: dT,
            cold: 0,
          }).power;
          const wide = out({ material: 'wool', area: 2 * A, thickness: d, hot: dT, cold: 0 }).power;
          const tol = 1e-9 * (Math.abs(p) + 1e-12);
          return Math.abs(thick - p / 2) <= tol && Math.abs(wide - 2 * p) <= 2 * tol;
        },
      ),
    ));
});

describe('conduction: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
