import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { ATM, compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const depth = (h: number, rho = 1000, g = 9.8) =>
  solve({ mode: 'depth', depth: h, density: rho, g }).outputs as Record<string, number>;
const fa = (force: number, area: number) =>
  solve({ mode: 'force', force, area }).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('pressure: references', () => {
  it('College Physics 2e Ex 11.3 / University Physics Ex 14.1: 40.0 m of water → 392 kPa; × 4.00 × 10⁴ m² → 1.57 × 10¹⁰ N', () => {
    const p = depth(40).pa!;
    expect(p).toBe(392000);
    expect(sig(p * 80 * 500, 3)).toBe(1.57e10);
  });
  it('Ex 11.5: 1.00 atm (1.01 × 10⁵ Pa) of water pressure at 10.3 m', () =>
    expect(sig(depth(10.3).pa!, 3)).toBe(1.01e5));
  it('Ex 11.2: 6.90 × 10⁶ Pa on a 0.150 m disk is 1.22 × 10⁵ N', () => {
    const a = Math.PI * 0.075 ** 2;
    expect(sig(fa(1.22e5, a).pa!, 3)).toBe(6.9e6);
    expect(sig(6.9e6 * a, 3)).toBe(1.22e5);
  });
  it('NIST SP 811: 1 atm = 101,325 Pa = 14.6959 psi', () => {
    expect(ATM).toBe(101325);
    expect(sig(fa(101325, 1).psi!, 6)).toBe(14.6959);
  });
});

describe('pressure: behaviour', () => {
  it('FAQ: 600 N on 0.04 m² → 15 kPa; on 0.0001 m² → 6 MPa', () => {
    expect(fa(600, 0.04).kpa).toBe(15);
    expect(fa(600, 0.0001).pa).toBe(6e6);
  });
  it('absolute adds one atmosphere; 10 m at gₙ → 98.0665 kPa', () => {
    const o = depth(10, 1000, 9.80665);
    expect([o.kpa, o.absolute]).toEqual([98.0665, 199391.5]);
  });
  it('zero area is rejected', () =>
    expect(solve({ mode: 'force', force: 1, area: 0 }).warnings[0]?.key).toBe('warn.area'));
});

describe('pressure: properties', () => {
  it('pressure is linear in depth and in density', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        fc.double({ min: 1, max: 2e4, noNaN: true }),
        (h, rho) => {
          const p = depth(h, rho).pa!;
          return (
            Math.abs(depth(2 * h, rho).pa! - 2 * p) <= 1e-9 * p &&
            Math.abs(depth(h, 2 * rho).pa! - 2 * p) <= 1e-9 * p
          );
        },
      ),
    ));
});

describe('pressure: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
