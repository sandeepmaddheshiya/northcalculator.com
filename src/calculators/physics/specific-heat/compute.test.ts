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

describe('specific-heat: references', () => {
  it('College Physics 2e Ex 14.1: 62.8 kJ water + 27.0 kJ pan = 89.8 kJ; pan share 30.1%', () => {
    const w = out({ find: 'heat', material: 'water', mass: 0.25, t1: 20, t2: 80 }).result!;
    const al = out({ find: 'heat', material: 'aluminum', mass: 0.5, t1: 20, t2: 80 }).result!;
    expect([sig(w, 3), al, sig(w + al, 3), Math.round((al / (w + al)) * 1000) / 10]).toEqual([
      62800, 27000, 89800, 30.1,
    ]);
  });
  it('Chemistry 2e Ex 5.1: 800 g water, 21 → 85 °C, c = 4184 → 2.1 × 10² kJ', () =>
    expect(
      sig(out({ find: 'heat', material: 'custom', c: 4184, mass: 0.8, t1: 21, t2: 85 }).kj!, 2),
    ).toBe(210));
  it('Ex 5.2: 6.64 kJ into 348 g, 22.4 → 43.6 °C → 0.900 J/(g·°C); check: 1.43 kJ, 217 g, +14.6 °C → 0.451', () => {
    expect(
      sig(out({ find: 'c', mass: 0.348, t1: 22.4, t2: 43.6, heat: 6640 }).result! / 1000, 3),
    ).toBe(0.9);
    expect(
      sig(out({ find: 'c', mass: 0.217, t1: 24.5, t2: 39.1, heat: 1430 }).result! / 1000, 3),
    ).toBe(0.451);
  });
  it('§5.1 check: 502 g iron (0.449 J/g°C), 25 → 250 °C → 5.07 × 10⁴ J', () =>
    expect(
      sig(
        out({ find: 'heat', material: 'custom', c: 449, mass: 0.502, t1: 25, t2: 250 }).result!,
        3,
      ),
    ).toBe(50700));
});

describe('specific-heat: behaviour', () => {
  it('FAQ: 1 kg water 20 → 100 °C = 334,880 J; cooling 2 kg by 10 °C = −83,720 J', () => {
    expect(out({ find: 'heat', material: 'water', mass: 1, t1: 20, t2: 100 }).result).toBe(334880);
    expect(out({ find: 'heat', material: 'water', mass: 2, t1: 30, t2: 20 }).result).toBe(-83720);
  });
  it('final temperature and mass', () => {
    expect(out({ find: 'final', material: 'water', mass: 0.25, t1: 20, heat: 62790 }).result).toBe(
      80,
    );
    expect(out({ find: 'mass', material: 'water', t1: 20, t2: 80, heat: 62790 }).result).toBe(0.25);
  });
  it('kcal uses 4.184 J: 4184 J = 1 kcal', () =>
    expect(out({ find: 'heat', material: 'custom', c: 4184, mass: 1, t1: 0, t2: 1 }).kcal).toBe(1));
  it('zero ΔT cannot give c', () =>
    expect(solve({ find: 'c', mass: 1, t1: 20, t2: 20, heat: 10 }).warnings[0]?.key).toBe(
      'warn.divide',
    ));
});

describe('specific-heat: properties', () => {
  it('heat → final temperature round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e4, noNaN: true }),
        fc.double({ min: -50, max: 500, noNaN: true }),
        fc.double({ min: -50, max: 500, noNaN: true }),
        fc.constantFrom('water', 'iron', 'copper', 'gold'),
        (m, a, b, material) => {
          const q = out({ find: 'heat', material, mass: m, t1: a, t2: b }).result!;
          const t2 = out({ find: 'final', material, mass: m, t1: a, heat: q }).result!;
          return Math.abs(t2 - b) <= 1e-8 * (Math.abs(a) + Math.abs(b) + 1);
        },
      ),
    ));
});

describe('specific-heat: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
