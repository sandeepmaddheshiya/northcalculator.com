import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, MATERIALS } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, temp: 20, current: 0, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
  });
type Out = Record<'result' | 'r' | 'r20' | 'area' | 'perM' | 'vdrop' | 'loss', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('wire-resistance: references (OpenStax University Physics Vol. 2 §9.3)', () => {
  it('Table 9.1 values', () => {
    expect(MATERIALS.copper).toEqual({ rho: 1.68e-8, alpha: 0.0039 });
    expect(MATERIALS.nichrome).toEqual({ rho: 100e-8, alpha: 0.0004 });
  });
  it('Ex 9.5: 5.00 m copper, 2.053 mm → 3.31 mm², 0.025 Ω', () => {
    const o = out({ find: 'r', material: 'copper', length: 5, diameter: 2.053 });
    expect([sig(o.area, 3), sig(o.result, 2)]).toEqual([3.31, 0.025]);
  });
  it('Ex 9.6: tungsten 0.350 Ω at 20 °C → 4.8 Ω at 2850 °C', () => {
    const d = out({ find: 'd', material: 'tungsten', length: 0.04, target: 0.35 }).result;
    expect(
      sig(out({ find: 'r', material: 'tungsten', length: 0.04, diameter: d, temp: 2850 }).r, 2),
    ).toBe(4.8);
  });
});

describe('wire-resistance: references (OpenStax College Physics 2e §20.3)', () => {
  it('Ex 20.5: tungsten 0.350 Ω in 4.00 cm → A 6.40 × 10⁻⁹ m², D 9.0 × 10⁻⁵ m', () => {
    const o = out({ find: 'd', material: 'tungsten', length: 0.04, target: 0.35 });
    expect([sig(o.area * 1e-6, 3), sig(o.result / 1000, 2)]).toEqual([6.4e-9, 9e-5]);
  });
  it('Ex 20.6: 0.350 × (1 + 4.5 × 10⁻³ × 2830) → 4.8 Ω', () =>
    expect(sig(0.35 * (1 + 4.5e-3 * 2830), 2)).toBe(4.8));
  it('College Physics copper (1.72 × 10⁻⁸) via the custom option', () =>
    expect(
      sig(
        out({ find: 'r', material: 'custom', rho: 1.72, alpha: 0.0039, length: 1, diameter: 1 })
          .result,
        4,
      ),
    ).toBe(sig(1.72e-8 / ((Math.PI * 1e-6) / 4), 4)));
});

describe('wire-resistance: behaviour', () => {
  it('length for a resistance inverts resistance; current gives V and P', () => {
    const L = out({ find: 'l', material: 'nichrome', diameter: 0.5, target: 10 }).result;
    expect(sig(out({ find: 'r', material: 'nichrome', length: L, diameter: 0.5 }).result, 10)).toBe(
      10,
    );
    const o = out({ find: 'r', material: 'copper', length: 20, diameter: 1.5, current: 10 });
    expect([sig(o.vdrop, 8), sig(o.loss, 8)]).toEqual([sig(10 * o.r, 8), sig(100 * o.r, 8)]);
  });
  it('bad inputs are explained', () => {
    expect(solve({ find: 'r', material: 'copper', length: 0, diameter: 1 }).warnings[0]?.key).toBe(
      'warn.size',
    );
    expect(
      solve({ find: 'r', material: 'copper', length: 1, diameter: 1, temp: -300 }).warnings[0]?.key,
    ).toBe('warn.temp');
  });
});

describe('wire-resistance: properties', () => {
  it('R ∝ L and ∝ 1/d²', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 0.01, max: 50, noNaN: true }),
        fc.constantFrom(...Object.keys(MATERIALS)),
        (L, d, material) => {
          const r = out({ find: 'r', material, length: L, diameter: d }).result;
          const r2L = out({ find: 'r', material, length: 2 * L, diameter: d }).result;
          const r2d = out({ find: 'r', material, length: L, diameter: 2 * d }).result;
          return Math.abs(r2L - 2 * r) <= 1e-9 * r2L && Math.abs(r2d - r / 4) <= 1e-9 * r;
        },
      ),
    ));
});

describe('wire-resistance: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
