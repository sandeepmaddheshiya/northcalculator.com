import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, INDEX } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number | null | undefined, d: number) => Number(x!.toPrecision(d));
const angle = (n1: number, n2: number, theta1: number) =>
  out({ find: 'angle', m1: 'custom', n1, m2: 'custom', n2, theta1 });

describe('refraction: references (OpenStax College Physics 2e §25.3–25.4)', () => {
  it('Table 25.1 presets', () =>
    expect([INDEX.air, INDEX.water, INDEX.crown, INDEX.diamond, INDEX.zircon]).toEqual([
      1.000293, 1.333, 1.52, 2.419, 1.923,
    ]));
  it('Ex 25.1: zircon → 1.56 × 10⁸ m/s', () =>
    expect(sig(out({ find: 'angle', m1: 'zircon', m2: 'air', theta1: 0 }).v1, 3)).toBe(1.56e8));
  it('Ex 25.2: 30.0° in air → 22.0° → n₂ = 1.33', () =>
    expect(sig(out({ find: 'n2', m1: 'vacuum', theta1: 30, theta2: 22 }).result, 3)).toBe(1.33));
  it('Ex 25.3: air (1.00) into diamond at 30.0° → 11.9°; with air at 1.000293 still 11.9°', () => {
    expect(sig(angle(1, 2.419, 30).result, 3)).toBe(11.9);
    expect(sig(out({ find: 'angle', m1: 'air', m2: 'diamond', theta1: 30 }).result, 3)).toBe(11.9);
  });
  it('Ex 25.4: polystyrene in air → θc 42.2°', () =>
    expect(sig(angle(1.49, 1, 10).critical, 3)).toBe(42.2));
  it('§25.4: water 48.6°, diamond 24.4°, flint to crown glass 66.3°', () =>
    expect([
      sig(angle(1.333, 1, 10).critical, 3),
      sig(angle(2.419, 1, 10).critical, 3),
      sig(angle(1.66, 1.52, 10).critical, 3),
    ]).toEqual([48.6, 24.4, 66.3]));
});

describe('refraction: references (OpenStax University Physics Vol. 3 §1.3–1.4)', () => {
  it('Ex 1.2 → 1.33; Ex 1.3 → 11.9°; Ex 1.4 → 42.2°', () => {
    expect(sig(out({ find: 'n2', m1: 'custom', n1: 1, theta1: 30, theta2: 22 }).result, 3)).toBe(
      1.33,
    );
    expect(sig(angle(1, 2.419, 30).result, 3)).toBe(11.9);
    expect(sig(angle(1.49, 1, 0).critical, 3)).toBe(42.2);
  });
});

describe('refraction: behaviour', () => {
  it('past the critical angle: total internal reflection, no refracted angle', () => {
    const r = solve({ find: 'angle', m1: 'water', m2: 'air', theta1: 60 });
    expect(r.outputs.result).toBeNull();
    expect(r.warnings[0]?.key).toBe('warn.tir');
  });
  it('same index passes straight through; 0° never bends', () => {
    expect(angle(1.5, 1.5, 40).result).toBe(40);
    expect(angle(1, 2, 0).result).toBe(0);
    expect(
      solve({ find: 'angle', m1: 'custom', n1: 1, m2: 'custom', n2: 1.5, theta1: 20 }).explain?.key,
    ).toBe('explain.toward');
  });
  it('rejects indices below 1 and angles of 90° or more', () => {
    expect(
      solve({ find: 'angle', m1: 'custom', n1: 0.5, m2: 'water', theta1: 10 }).warnings[0]?.key,
    ).toBe('warn.index');
    expect(solve({ find: 'angle', m1: 'air', m2: 'water', theta1: 90 }).warnings[0]?.key).toBe(
      'warn.angle',
    );
  });
});

describe('refraction: properties', () => {
  const n = fc.double({ min: 1, max: 3, noNaN: true });
  it('the path is reversible and n₁ sin θ₁ = n₂ sin θ₂', () =>
    fc.assert(
      fc.property(n, n, fc.double({ min: 0.1, max: 89, noNaN: true }), (n1, n2, t1) => {
        const t2 = angle(n1, n2, t1).result;
        fc.pre(t2 !== null && t2 !== undefined && t2 > 0.01 && t2 < 89);
        const back = angle(n2, n1, t2).result!;
        const lhs = n1 * Math.sin((t1 * Math.PI) / 180);
        const rhs = n2 * Math.sin((t2 * Math.PI) / 180);
        return Math.abs(back - t1) <= 1e-6 && Math.abs(lhs - rhs) <= 1e-9;
      }),
    ));
});

describe('refraction: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
