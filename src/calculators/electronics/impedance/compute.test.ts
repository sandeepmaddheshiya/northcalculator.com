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
const sig = (x: number | null | undefined, d: number) => Number(x!.toPrecision(d));
const book = { comp: 'RLC', R: 40, fu: 'Hz', L: 3, lu: 'mH', C: 5, cu: 'uF', V: 120 };

describe('impedance: references (OpenStax College Physics 2e §23.12)', () => {
  it('Ex 23.12: Z 531 Ω, 0.226 A at 60.0 Hz; 190 Ω, 0.633 A at 10.0 kHz', () => {
    const a = out({ ...book, f: 60 });
    const b = out({ ...book, f: 10, fu: 'kHz' });
    expect([sig(a.z, 3), sig(a.current, 3), sig(b.z, 3), sig(b.current, 3)]).toEqual([
      531, 0.226, 190, 0.633,
    ]);
  });
  it('Ex 23.14: cos φ 0.0753, φ 85.7° (leading), P 2.04 W', () => {
    const a = out({ ...book, f: 60 });
    expect([sig(a.pf, 3), sig(a.phi, 3), sig(a.power, 3)]).toEqual([0.0753, -85.7, 2.04]);
  });
  it('Ex 23.13–23.14: at resonance 1.30 kHz → Z 40.0 Ω, 3.00 A, 360 W', () => {
    const f0 = out({ ...book, f: 60 }).f0!;
    expect(sig(f0, 3)).toBe(1300);
    const r = out({ ...book, f: f0 });
    expect([r.z, sig(r.current, 12), sig(r.power, 12), r.pf]).toEqual([40, 3, 360, 1]);
  });
});

describe('impedance: references (OpenStax University Physics Vol. 2 §15.3–15.4)', () => {
  it('Ex 15.2: X_C 0.995, X_L 3.77, Z 4.87 Ω, I₀ 2.05 × 10⁻² A, φ 0.607 rad', () => {
    const o = out({
      comp: 'RLC',
      R: 4,
      f: 200,
      fu: 'Hz',
      L: 3,
      lu: 'mH',
      C: 800,
      cu: 'uF',
      V: 0.1,
    });
    expect([sig(o.xc, 3), sig(o.xl, 3), sig(o.z, 3), sig(o.current, 3)]).toEqual([
      0.995, 3.77, 4.87, 0.0205,
    ]);
    expect(sig((o.phi! * Math.PI) / 180, 3)).toBe(0.607);
  });
  it('Ex 15.3: ω 10⁴ rad/s, 5.00 Ω, 2.00 mH, 4.00 µF, 4.00 V peak → Z 7.07 Ω, 0.800 W (book 0.801)', () => {
    const o = out({
      comp: 'RLC',
      R: 5,
      f: 1e4 / (2 * Math.PI),
      fu: 'Hz',
      L: 2,
      lu: 'mH',
      C: 4,
      cu: 'uF',
      V: 4 / Math.SQRT2,
    });
    expect(sig(o.z, 3)).toBe(7.07);
    // ADR-022: exactly 0.800 W; the book squares the rounded 2.83 V and 7.07 Ω and prints 0.801.
    expect(sig(o.power, 3)).toBe(0.8);
    expect(sig((2.83 ** 2 * 5) / 7.07 ** 2, 3)).toBe(0.801);
  });
});

describe('impedance: behaviour', () => {
  it('RL and RC circuits leave out a component', () => {
    const rl = out({ comp: 'RL', R: 3, f: 1, fu: 'Hz', L: 4 / (2 * Math.PI), lu: 'H', V: 10 });
    expect([sig(rl.z, 12), rl.xc, sig(rl.phi, 6)]).toEqual([5, null, 53.1301]);
    const rc = out({ comp: 'RC', R: 3, f: 1, fu: 'Hz', C: 1 / (8 * Math.PI), cu: 'F', V: 10 });
    expect([sig(rc.z, 12), sig(rc.phi, 6)]).toEqual([5, -53.1301]);
  });
  it('P = I²R for any circuit', () => {
    const o = out({ ...book, f: 400 });
    expect(sig(o.power, 10)).toBe(sig(o.current! ** 2 * 40, 10));
  });
  it('zero frequency and a short circuit are explained', () => {
    expect(solve({ ...book, f: 0 }).warnings[0]?.key).toBe('warn.dc');
    const f0 = out({ ...book, f: 60 }).f0!;
    expect(solve({ ...book, R: 0, f: f0 }).warnings[0]?.key).toBe('warn.short');
  });
});

describe('impedance: properties', () => {
  const pos = (min: number, max: number) => fc.double({ min, max, noNaN: true });
  it('Z ≥ R, Z ≥ |X_L − X_C| and cos φ = R ÷ Z', () =>
    fc.assert(
      fc.property(pos(0.1, 1e4), pos(1, 1e6), pos(0.01, 100), pos(0.01, 100), (R, f, L, C) => {
        const o = out({ comp: 'RLC', R, f, fu: 'Hz', L, lu: 'mH', C, cu: 'uF', V: 1 });
        return (
          o.z! >= R * (1 - 1e-11) &&
          o.z! >= Math.abs(o.xl! - o.xc!) * (1 - 1e-11) &&
          Math.abs(o.pf! - R / o.z!) <= 1e-9
        );
      }),
    ));
});

describe('impedance: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
