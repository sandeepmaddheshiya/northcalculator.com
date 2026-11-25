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
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('buoyancy: references', () => {
  it('College Physics 2e Ex 11.8(a): 1.28 × 10³ m³ of water → 1.3 × 10⁷ N', () =>
    expect(sig(out({ mode: 'force', volume: 1280, fluid: 1000 }).result!, 2)).toBe(1.3e7));
  it('Ex 11.8(b): 1.00 × 10⁵ m³ → 9.80 × 10⁸ N with g = 9.80 (9.81 × 10⁸ with gₙ)', () => {
    expect(sig(out({ mode: 'force', volume: 1e5, fluid: 1000 }).result!, 3)).toBe(9.81e8);
    expect(out({ mode: 'force', volume: 1e5, fluid: 1000 }).kg).toBe(1e8);
  });
  it('Ex 11.9 / University Physics Ex 14.4: 970 kg/m³ floats 97.0% submerged', () =>
    expect(out({ mode: 'float', object: 970, fluid: 1000 }).result).toBe(97));
  it('Ex 11.10: 8.630 g in air, 7.800 g in water → 10.4 g/cm³', () =>
    expect(
      sig(out({ mode: 'weigh', air: 8.63, inFluid: 7.8, fluid: 1000 }).result! / 1000, 3),
    ).toBe(10.4));
});

describe('buoyancy: behaviour', () => {
  it('FAQ: ice at 917 kg/m³ floats 91.7% submerged; 1 L displaced → 9.80665 N', () => {
    expect(out({ mode: 'float', object: 917, fluid: 1000 }).result).toBe(91.7);
    expect(out({ mode: 'force', volume: 0.001, fluid: 1000 }).result).toBe(9.80665);
  });
  it('denser objects sink (capped at 100%) with a note; impossible weighings are rejected', () => {
    const r = solve({ mode: 'float', object: 7800, fluid: 1000 });
    expect([r.outputs.result, r.warnings[0]?.key]).toEqual([100, 'warn.sinks']);
    expect(solve({ mode: 'weigh', air: 5, inFluid: 6, fluid: 1000 }).warnings[0]?.key).toBe(
      'warn.weigh',
    );
  });
});

describe('buoyancy: properties', () => {
  it('weighing recovers the density used to build the measurement', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1.01, max: 30, noNaN: true }),
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        (sg, mass) => {
          const wet = mass - mass / sg; // apparent mass in water
          const d = out({ mode: 'weigh', air: mass, inFluid: wet, fluid: 1000 }).result!;
          return Math.abs(d - sg * 1000) <= 1e-7 * sg * 1000;
        },
      ),
    ));
});

describe('buoyancy: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
