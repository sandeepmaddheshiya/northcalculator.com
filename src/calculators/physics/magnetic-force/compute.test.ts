import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, PARTICLES } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, angle: 90, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'force' | 'radius' | 'period' | 'freq' | 'pitch', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const custom = (mass: number, charge: number, v: number, b: number, angle = 90) =>
  out({ particle: 'custom', mass, charge, qu: 'C', v, b, angle });

describe('magnetic-force: references (OpenStax College Physics 2e §22.4–22.5)', () => {
  it('Ex 22.1: 20 nC at 10 m/s across 5 × 10⁻⁵ T → 1 × 10⁻¹¹ N', () =>
    expect(sig(custom(1, 20e-9, 10, 5e-5).force, 1)).toBe(1e-11));
  it('Ex 22.2: electron (9.11 × 10⁻³¹ kg, 1.60 × 10⁻¹⁹ C) at 6.00 × 10⁷ m/s in 0.500 T → 6.83 × 10⁻⁴ m', () =>
    expect(sig(custom(9.11e-31, 1.6e-19, 6e7, 0.5).radius, 3)).toBe(6.83e-4));
  it('the same with CODATA constants → 6.82 × 10⁻⁴ m (ADR-022)', () =>
    expect(sig(out({ particle: 'electron', v: 6e7, b: 0.5 }).radius, 3)).toBe(6.82e-4));
});

describe('magnetic-force: references (OpenStax University Physics Vol. 2 §11.3)', () => {
  it('Ex 11.2: alpha 6.64 × 10⁻²⁷ kg, 3.2 × 10⁻¹⁹ C, 0.050 T → T 2.61 × 10⁻⁶ s; quarter turn 6.5 × 10⁻⁷ s', () => {
    const T = custom(6.64e-27, 3.2e-19, 1e5, 0.05).period;
    expect([sig(T, 3), sig(T / 4, 2)]).toEqual([2.61e-6, 6.5e-7]);
  });
  it('Ex 11.3: proton at 5 × 10⁵ m/s in 1.0 × 10⁻⁴ T: pitch equals radius at θ = 81.0°', () => {
    const o = out({ particle: 'proton', v: 5e5, b: 1e-4, angle: 81 });
    expect(sig(o.pitch / o.radius, 2)).toBe(1);
    // Exactly, tan θ = 2π gives 80.96°.
    expect(sig((Math.atan(2 * Math.PI) * 180) / Math.PI, 3)).toBe(81);
  });
});

describe('magnetic-force: behaviour', () => {
  it('alpha particle preset is CODATA 2022 with charge 2e', () => {
    expect(PARTICLES.alpha).toEqual({ m: 6.644657345e-27, q: 2 * 1.602176634e-19 });
  });
  it('moving along the field: no force, no circle, pitch = v T', () => {
    const o = out({ particle: 'proton', v: 1e5, b: 1, angle: 0 });
    expect([o.force, o.radius, sig(o.pitch, 10)]).toEqual([0, 0, sig(1e5 * o.period, 10)]);
  });
  it('neutral, too fast and zero field are explained', () => {
    expect(solve({ particle: 'custom', mass: 1, charge: 0, v: 1, b: 1 }).warnings[0]?.key).toBe(
      'warn.charge',
    );
    expect(solve({ particle: 'electron', v: 1e8, b: 1 }).warnings[0]?.key).toBe('warn.fast');
    expect(solve({ particle: 'electron', v: 1, b: 0 }).warnings[0]?.key).toBe('warn.positive');
  });
});

describe('magnetic-force: properties', () => {
  it('period is independent of speed; radius ∝ v; F = m v²/r at 90°', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e7, noNaN: true }),
        fc.double({ min: 1e-4, max: 10, noNaN: true }),
        (v, b) => {
          const a = out({ particle: 'proton', v, b });
          const c = out({ particle: 'proton', v: 2 * v, b });
          const m = PARTICLES.proton!.m;
          return (
            Math.abs(a.period - c.period) <= 1e-12 * a.period &&
            Math.abs(c.radius - 2 * a.radius) <= 1e-9 * c.radius &&
            Math.abs(a.force - (m * v * v) / a.radius) <= 1e-9 * a.force
          );
        },
      ),
    ));
});

describe('magnetic-force: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
