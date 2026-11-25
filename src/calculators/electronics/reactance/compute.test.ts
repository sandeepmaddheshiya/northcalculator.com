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
const sig = (x: number | undefined, d: number) => Number(x!.toPrecision(d));
const ind = (f: number, L: number, lu = 'mH', V = 120) => out({ comp: 'L', f, fu: 'Hz', L, lu, V });
const cap = (f: number, C: number, cu = 'uF', V = 120) => out({ comp: 'C', f, fu: 'Hz', C, cu, V });

describe('reactance: references (OpenStax College Physics 2e §23.11–23.12)', () => {
  it('Ex 23.10: 3.00 mH → 1.13 Ω at 60 Hz and 188 Ω at 10 kHz; 106 A and 0.637 A at 120 V', () => {
    expect([sig(ind(60, 3).x, 3), sig(ind(1e4, 3).x, 3)]).toEqual([1.13, 188]);
    expect([sig(ind(60, 3).current, 3), sig(ind(1e4, 3).current, 3)]).toEqual([106, 0.637]);
  });
  it('Ex 23.11: 5.00 µF → 531 Ω at 60 Hz and 3.18 Ω at 10 kHz; 0.226 A and 37.7 A', () => {
    expect([sig(cap(60, 5).x, 3), sig(cap(1e4, 5).x, 3)]).toEqual([531, 3.18]);
    expect([sig(cap(60, 5).current, 3), sig(cap(1e4, 5).current, 3)]).toEqual([0.226, 37.7]);
  });
  it('Ex 23.13: 3.00 mH with 5.00 µF resonates at 1.30 kHz', () =>
    expect(sig(out({ comp: 'LC', f: 60, L: 3, lu: 'mH', C: 5, cu: 'uF' }).f0, 3)).toBe(1300));
  it('kHz input: 10 kHz equals 10,000 Hz', () =>
    expect(out({ comp: 'L', f: 10, fu: 'kHz', L: 3, lu: 'mH' }).x).toBe(ind(1e4, 3).x));
});

describe('reactance: references (OpenStax University Physics Vol. 2 §15.2)', () => {
  it('Ex 15.1: 10 µF at 60 Hz → 265 Ω, 3.8 × 10⁻² A at 10 V', () => {
    const o = cap(60, 10, 'uF', 10);
    expect([sig(o.x, 3), sig(o.current, 2)]).toEqual([265, 0.038]);
  });
  it('Ex 15.1: 15 mH at 60 Hz → 5.7 Ω, 1.8 A at 10 V', () => {
    const o = ind(60, 15, 'mH', 10);
    expect([sig(o.x, 2), sig(o.current, 2)]).toEqual([5.7, 1.8]);
  });
});

describe('reactance: behaviour', () => {
  it('LC: net reactance is X_L − X_C and is zero at f₀', () => {
    const o = out({ comp: 'LC', f: 60, fu: 'Hz', L: 3, lu: 'mH', C: 5, cu: 'uF' });
    expect(sig(o.x, 6)).toBe(sig(o.xl! - o.xc!, 6));
    const f0 = o.f0!;
    const r = out({ comp: 'LC', f: f0, fu: 'Hz', L: 3, lu: 'mH', C: 5, cu: 'uF' });
    expect([r.x, r.current]).toEqual([0, null]);
    expect(
      solve({ comp: 'LC', f: f0, fu: 'Hz', L: 3, lu: 'mH', C: 5, cu: 'uF' }).explain?.key,
    ).toBe('explain.resonant');
  });
  it('pF and µH units', () =>
    expect(sig(out({ comp: 'LC', f: 1, fu: 'MHz', L: 1, lu: 'uH', C: 100, cu: 'pF' }).f0, 6)).toBe(
      sig(1 / (2 * Math.PI * Math.sqrt(1e-6 * 1e-10)), 6),
    ));
  it('DC and zero values are explained', () => {
    expect(solve({ comp: 'C', f: 0, C: 5 }).warnings[0]?.key).toBe('warn.dc');
    expect(solve({ comp: 'L', f: 0, L: 5 }).warnings[0]?.key).toBe('warn.dcL');
    expect(solve({ comp: 'L', f: 60, L: 0 }).warnings[0]?.key).toBe('warn.zero');
  });
});

describe('reactance: properties', () => {
  const pos = (min: number, max: number) => fc.double({ min, max, noNaN: true });
  it('X_L scales with f, X_C inversely, and X_L × X_C = L ÷ C', () =>
    fc.assert(
      fc.property(pos(0.01, 1e6), pos(0.001, 1000), pos(0.001, 1000), (f, L, C) => {
        const o = out({ comp: 'LC', f, fu: 'Hz', L, lu: 'mH', C, cu: 'uF' });
        const o2 = out({ comp: 'LC', f: 2 * f, fu: 'Hz', L, lu: 'mH', C, cu: 'uF' });
        const ratio = (L * 1e-3) / (C * 1e-6);
        return (
          Math.abs(o2.xl! - 2 * o.xl!) <= 1e-9 * o2.xl! &&
          Math.abs(o2.xc! - o.xc! / 2) <= 1e-9 * o.xc! &&
          Math.abs(o.xl! * o.xc! - ratio) <= 1e-9 * ratio
        );
      }),
    ));
});

describe('reactance: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
