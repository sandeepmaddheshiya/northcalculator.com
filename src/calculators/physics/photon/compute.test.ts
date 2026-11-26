import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { C, compute, EV, H } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, power: 0, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'ev' | 'joules' | 'nm' | 'hz' | 'kjmol' | 'rate', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const fromNm = (nm: number, power = 0) => out({ from: 'wavelength', value: nm, lu: 'nm', power });

describe('photon: references (OpenStax College Physics 2e §29.3)', () => {
  it('hc = 1240 eV·nm; h = 4.14 × 10⁻¹⁵ eV·s', () => {
    expect(sig((H * C) / EV / 1e-9, 3)).toBe(1240);
    expect(sig(H / EV, 3)).toBe(4.14e-15);
  });
  it('Ex 29.3: 100 nm → 12.4 eV', () => expect(sig(fromNm(100).ev, 3)).toBe(12.4));
  it('Ex 29.4: 580 nm → 3.42 × 10⁻¹⁹ J (printed 3.43 with h 6.63, c 3.00); 10.0 W → 2.92 × 10¹⁹ /s', () => {
    const o = fromNm(580, 10);
    expect([sig(o.joules, 3), sig(o.rate, 3)]).toEqual([3.42e-19, 2.92e19]);
    // ADR-022: the book's rounded constants give 3.43 × 10⁻¹⁹ J.
    expect(sig((6.63e-34 * 3e8) / 580e-9, 3)).toBe(3.43e-19);
  });
  it('10²¹ Hz → 6.63 × 10⁻¹³ J = 4.14 MeV', () => {
    const o = out({ from: 'frequency', value: 1e21, fu: 'Hz' });
    expect([sig(o.joules, 3), sig(o.ev / 1e6, 3)]).toEqual([6.63e-13, 4.14]);
  });
});

describe('photon: references (OpenStax University Physics Vol. 3 §6.2 and Physics §21.1)', () => {
  it('Ex 6.7: 430 nm → 2.88 eV; Ex 6.5: 4.73 eV → 262 nm, 2.46 eV → 504 nm', () => {
    expect(sig(fromNm(430).ev, 3)).toBe(2.88);
    expect(sig(out({ from: 'energy', value: 4.73, eu: 'eV' }).nm, 3)).toBe(262);
    expect(sig(out({ from: 'energy', value: 2.46, eu: 'eV' }).nm, 3)).toBe(504);
  });
  it('Physics §21.1: 2000 nm → 1.50 × 10¹⁴ Hz, 9.93 × 10⁻²⁰ J (printed 9.95); 500 nm → 6.00 × 10¹⁴ Hz, 3.97 × 10⁻¹⁹ J (printed 3.98)', () => {
    const ir = fromNm(2000);
    const vis = fromNm(500);
    expect([sig(ir.hz, 3), sig(ir.joules, 3), sig(vis.hz, 3), sig(vis.joules, 3)]).toEqual([
      1.5e14, 9.93e-20, 6e14, 3.97e-19,
    ]);
    // ADR-022: the book multiplies 6.63 × 10⁻³⁴ by the rounded frequencies.
    expect([sig(6.63e-34 * 1.5e14, 3), sig(6.63e-34 * 6e14, 3)]).toEqual([9.95e-20, 3.98e-19]);
  });
});

describe('photon: behaviour', () => {
  it('units: 0.5 µm = 500 nm; 600 THz ≈ 500 nm; 1 keV = 1000 eV', () => {
    expect(out({ from: 'wavelength', value: 0.5, lu: 'um' }).ev).toBe(fromNm(500).ev);
    expect(sig(out({ from: 'frequency', value: 600, fu: 'THz' }).nm, 3)).toBe(500);
    expect(sig(out({ from: 'energy', value: 1, eu: 'keV' }).ev, 12)).toBe(1000);
  });
  it('per mole: 1 eV per photon ≈ 96.485 kJ/mol', () =>
    expect(sig(out({ from: 'energy', value: 1, eu: 'eV' }).kjmol, 5)).toBe(96.485));
  it('non-positive input is explained', () =>
    expect(solve({ from: 'wavelength', value: 0 }).warnings[0]?.key).toBe('warn.positive'));
});

describe('photon: properties', () => {
  it('λ → E → λ round-trips and E × λ = hc', () =>
    fc.assert(
      fc.property(fc.double({ min: 1e-3, max: 1e9, noNaN: true }), (nm) => {
        const e = fromNm(nm).ev;
        const back = out({ from: 'energy', value: e, eu: 'eV' }).nm;
        return (
          Math.abs(back - nm) <= 1e-9 * nm && Math.abs((e * nm) / 1239.8419843320025 - 1) <= 1e-9
        );
      }),
    ));
});

describe('photon: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
