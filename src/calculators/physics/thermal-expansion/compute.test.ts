import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { MATERIALS, compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'change' | 'final' | 'percent' | 'coef' | 'dT' | 'stress', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const vol = (material: string, size = 60) =>
  out({ mode: 'volume', material, size, tu: 'C', t1: 15, t2: 35 }).change;

describe('thermal-expansion: references (OpenStax College Physics 2e §13.2)', () => {
  it('Ex 13.3: Golden Gate Bridge, steel 1275 m, −15 to 40 °C → 0.84 m', () =>
    expect(
      sig(out({ mode: 'linear', material: 'steel', size: 1275, t1: -15, t2: 40 }).change, 2),
    ).toBe(0.84));
  it('Ex 13.4: 60.0 L of gasoline in a steel tank, 15 to 35 °C → 1.10 L spills', () =>
    expect(sig(vol('gasoline') - vol('steel'), 3)).toBe(1.1));
  it('Table 13.2: β ≈ 3α for every solid (within the table’s rounding)', () => {
    for (const m of Object.values(MATERIALS))
      if (m.alpha) expect(Math.abs(m.beta / (3 * m.alpha) - 1)).toBeLessThan(0.17);
  });
});

describe('thermal-expansion: references (OpenStax University Physics Vol. 2 §1.3)', () => {
  it('Ex 1.4: concrete, Y = 20 GPa, 5 to 38 °C → 7.9 × 10⁶ N/m²', () =>
    expect(
      sig(out({ mode: 'linear', material: 'concrete', size: 10, t1: 5, t2: 38, y: 20 }).stress, 2),
    ).toBe(7.9));
  it('Ex 1.2 and 1.3 repeat the bridge (0.84 m) and the tank (1.10 L)', () => {
    expect(
      sig(out({ mode: 'linear', material: 'steel', size: 1275, t1: -15, t2: 40 }).change, 2),
    ).toBe(0.84);
    expect(Number((vol('gasoline') - vol('steel')).toFixed(2))).toBe(1.1);
  });
});

describe('thermal-expansion: behaviour', () => {
  it('area expansion uses 2α', () => {
    const o = out({ mode: 'area', material: 'aluminum', size: 2, t1: 20, t2: 120 });
    expect(o.change).toBeCloseTo(2 * 25e-6 * 2 * 100, 15);
  });
  it('°F differences convert by 5/9', () => {
    const f = out({ mode: 'linear', material: 'copper', size: 3, tu: 'F', t1: 32, t2: 212 });
    const c = out({ mode: 'linear', material: 'copper', size: 3, tu: 'C', t1: 0, t2: 100 });
    expect([f.dT, f.change]).toEqual([c.dT, c.change]);
  });
  it('cooling shrinks, and a fixed bar is then in tension', () => {
    const r = solve({ mode: 'linear', material: 'steel', size: 5, t1: 30, t2: -10, y: 200 });
    expect((r.outputs.change as number) < 0).toBe(true);
    expect(r.warnings[0]?.key).toBe('warn.tension');
  });
  it('custom coefficient is per 10⁻⁶ °C; liquids have no linear coefficient', () => {
    expect(
      out({ mode: 'linear', material: 'custom', coef: 12, size: 1275, t1: -15, t2: 40 }).change,
    ).toBe(out({ mode: 'linear', material: 'steel', size: 1275, t1: -15, t2: 40 }).change);
    expect(solve({ mode: 'linear', material: 'water', size: 1 }).warnings[0]?.key).toBe(
      'warn.fluid',
    );
    expect(solve({ mode: 'linear', material: 'steel', size: 0 }).warnings[0]?.key).toBe(
      'warn.size',
    );
  });
});

describe('thermal-expansion: properties', () => {
  it('change is linear in size and ΔT and reverses when the temperatures swap', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e4, noNaN: true }),
        fc.double({ min: -200, max: 500, noNaN: true }),
        fc.double({ min: -200, max: 500, noNaN: true }),
        (size, t1, t2) => {
          const a = out({ mode: 'volume', material: 'water', size, t1, t2 }).change;
          const b = out({ mode: 'volume', material: 'water', size, t1: t2, t2: t1 }).change;
          const c = out({ mode: 'volume', material: 'water', size: 2 * size, t1, t2 }).change;
          return (
            Math.abs(a + b) <= 1e-9 * Math.abs(a) + 1e-15 &&
            Math.abs(c - 2 * a) <= 1e-9 * Math.abs(a) + 1e-15
          );
        },
      ),
    ));
});

describe('thermal-expansion: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
