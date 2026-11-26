import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { C, compute, lorentz } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'gamma' | 'dilated' | 'contracted' | 'lag' | 'beta' | 'excess', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const at = (speed: number, su = 'c', t0: number | null = null, l0: number | null = null) =>
  out({ speed, su, t0, l0 });

describe('relativity: references (OpenStax College Physics 2e §28.2–28.3)', () => {
  it('Ex 28.1: 0.950c → γ 3.20; 1.52 µs → 4.87 µs', () => {
    const o = at(0.95, 'c', 1.52);
    expect([sig(o.gamma, 3), sig(o.dilated, 3)]).toEqual([3.2, 4.87]);
  });
  it('0.650c → γ 1.32; 1.90 × 10⁸ m/s, 2.10 × 10⁻⁸ s → 2.71 × 10⁻⁸ s', () => {
    expect(sig(at(0.65).gamma, 3)).toBe(1.32);
    expect(sig(at(1.9e8, 'ms', 2.1e-8).dilated, 3)).toBe(2.71e-8);
  });
  it('Ex 28.2: 4.300 ly at γ 30.00 → 0.1433 ly, v = 0.9994c', () => {
    const beta = Math.sqrt(1 - 1 / 900);
    expect(sig(beta, 4)).toBe(0.9994);
    expect(sig(at(beta, 'c', null, 4.3).contracted, 4)).toBe(0.1433);
  });
  it('0.750c, 2.50 km → 1.65 km', () =>
    expect(sig(at(0.75, 'c', null, 2.5).contracted, 3)).toBe(1.65));
});

describe('relativity: references (OpenStax University Physics Vol. 3 §5.3–5.4)', () => {
  it('Ex 5.1: 5830 m/s for 1 s → 1 s + 1.89 × 10⁻¹⁰ s', () =>
    expect(sig(at(5830, 'ms', 1).lag, 3)).toBe(1.89e-10));
  it('Ex 5.2: Δτ/Δt = 1/1.01 → v/c 0.14', () => {
    const beta = Math.sqrt(1 - (1 / 1.01) ** 2);
    expect([sig(beta, 2), sig(at(beta).gamma, 3)]).toEqual([0.14, 1.01]);
  });
  it('Ex 5.3: muon 0.950c, 2.20 µs → 7.05 µs; §5.4: 2.01 km → 0.627 km', () => {
    const o = at(0.95, 'c', 2.2, 2.01);
    // ADR-022: 2.01 km ÷ γ = 0.628 km; the book gets 0.627 from 0.950c × 2.20 µs directly.
    expect([sig(o.dilated, 3), sig(o.contracted, 3)]).toEqual([7.05, 0.628]);
    expect(sig((0.95 * C * 2.2e-6) / 1000, 3)).toBe(0.627);
  });
  it('Ex 5.4: 6.00 × 10⁷ m/s over 0.200 m → 3.33 ns lab, 3.26 ns proper', () => {
    const lab = 0.2 / 6e7;
    expect(sig(lab, 3)).toBe(3.33e-9);
    // ADR-022: exact proper time 3.266 ns rounds to 3.27; the book prints 3.26.
    expect(sig(lab / at(6e7, 'ms').gamma, 4)).toBe(3.266e-9);
  });
});

describe('relativity: behaviour', () => {
  it('km/s converts; c and above are rejected', () => {
    expect(at(299792.458 / 2, 'kms').gamma).toBe(at(0.5).gamma);
    expect(solve({ speed: 1, su: 'c' }).warnings[0]?.key).toBe('warn.light');
    expect(solve({ speed: C, su: 'ms' }).warnings[0]?.key).toBe('warn.light');
  });
  it('γ − 1 is accurate at walking speed (≈ v²/2c²)', () => {
    const v = 1.5;
    expect(sig(at(v, 'ms').excess, 6)).toBe(sig((v * v) / (2 * C * C), 6));
  });
});

describe('relativity: properties', () => {
  it('γ ≥ 1, Δt × L is invariant (Δt₀ × L₀), and γ − 1 matches γ − 1', () =>
    fc.assert(
      fc.property(fc.double({ min: 0, max: 0.999999, noNaN: true }), (beta) => {
        const { gamma, excess } = lorentz(beta);
        const o = at(beta, 'c', 2, 3);
        return (
          gamma >= 1 &&
          Math.abs(o.dilated * o.contracted - 6) <= 1e-9 * 6 &&
          Math.abs(excess - (gamma - 1)) <= 1e-12 * gamma
        );
      }),
    ));
});

describe('relativity: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
