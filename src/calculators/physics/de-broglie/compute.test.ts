import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, EV, H, MASS } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'lambda' | 'nm' | 'p' | 'kEv' | 'speed' | 'beta', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const byK = (particle: string, energy: number, eu = 'eV') =>
  out({ particle, from: 'energy', energy, eu });
const byV = (particle: string, speed: number, su = 'ms', mass?: number) =>
  out({ particle, mass, from: 'speed', speed, su });

describe('de-broglie: references (OpenStax University Physics Vol. 3 §6.5)', () => {
  it('Ex 6.11(a): 0.65 kg basketball at 10 m/s → 1.02 × 10⁻³⁴ m', () =>
    expect(sig(byV('custom', 10, 'ms', 0.65).lambda, 3)).toBe(1.02e-34));
  it('Ex 6.11(b): electron at 1.0 eV → 1.23 nm', () =>
    expect(sig(byK('electron', 1).nm, 3)).toBe(1.23));
  it('Ex 6.11(c): electron at 108 keV → 3.55 pm', () =>
    expect(sig(byK('electron', 108, 'keV').lambda, 3)).toBe(3.55e-12));
  it('Ex 6.14: proton at 0.75c → 1.1654 fm (printed 1.16)', () =>
    // ADR-022: exact 1.1654 fm; the book truncates to 1.16.
    expect(sig(byV('proton', 0.75, 'c').lambda, 4)).toBe(1.165e-15));
});

describe('de-broglie: references (OpenStax College Physics 2e §29.6)', () => {
  it('3 kg bowling ball at 10 m/s → 2 × 10⁻³⁵ m', () =>
    expect(sig(byV('custom', 10, 'ms', 3).lambda, 1)).toBe(2e-35));
  it('Ex 29.7: an electron at 4.36 × 10⁶ m/s has λ 0.167 nm and 54.0 eV', () => {
    const v = H / (MASS.electron! * 0.167e-9);
    expect(sig(v, 3)).toBe(4.36e6);
    const o = byV('electron', v);
    // ADR-022: 53.9 eV with CODATA constants; the book's h 6.63 × 10⁻³⁴, m 9.11 × 10⁻³¹ give 54.0.
    expect([sig(o.nm, 3), sig(o.kEv, 3)]).toEqual([0.167, 53.9]);
    const vb = 6.63e-34 / (9.11e-31 * 0.167e-9);
    expect(sig((0.5 * 9.11e-31 * vb * vb) / 1.602e-19, 3)).toBe(54);
  });
});

describe('de-broglie: behaviour', () => {
  it('neutron and proton masses are CODATA 2022', () => {
    expect(MASS.proton).toBe(1.67262192595e-27);
    expect(MASS.neutron).toBe(1.67492750056e-27);
  });
  it('speed at or above c is rejected; the relativistic note appears at 108 keV', () => {
    expect(solve({ particle: 'electron', from: 'speed', speed: 1, su: 'c' }).warnings[0]?.key).toBe(
      'warn.light',
    );
    expect(
      solve({ particle: 'electron', from: 'energy', energy: 108, eu: 'keV' }).warnings[0]?.key,
    ).toBe('warn.relativistic');
    expect(solve({ particle: 'electron', from: 'energy', energy: 1, eu: 'eV' }).warnings).toEqual(
      [],
    );
  });
});

describe('de-broglie: properties', () => {
  it('energy → speed → wavelength agrees with energy → wavelength', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-3, max: 1e7, noNaN: true }),
        fc.constantFrom('electron', 'proton', 'neutron'),
        (ev, particle) => {
          const a = byK(particle, ev);
          const b = byV(particle, a.speed);
          return (
            Math.abs(b.lambda / a.lambda - 1) <= 1e-6 &&
            Math.abs(b.kEv / ev - 1) <= 1e-6 &&
            a.kEv > 0 &&
            EV > 0
          );
        },
      ),
    ));
});

describe('de-broglie: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
