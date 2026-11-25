import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (radius: number, angle: number, unit = 'deg') =>
  compute({ ...base, radius, angle, unit } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (radius: number, angle: number, unit = 'deg') =>
  solve(radius, angle, unit).outputs as Record<string, number>;
const r2 = (x: number) => Math.round(x * 100) / 100;

describe('arc-sector: references', () => {
  it('OpenStax A&T 2e Ex 9: r = 20 ft, 30° → 104.72 ft²', () =>
    expect(r2(out(20, 30).sector!)).toBe(104.72));
  it('Corral Ex 4.3: r = 2 cm, θ = 1.2 → s = 2.4 cm; Ex 4.4: 41°, r = 10 ft → 7.16 ft', () => {
    expect(out(2, 1.2, 'rad').arc).toBe(2.4);
    expect(r2(out(10, 41).arc!)).toBe(7.16);
  });
  it('Corral Ex 4.8: π/5, r = 4 cm → 8π/5; Ex 4.9: 117°, r = 3.5 m → 12.51 m²', () => {
    expect(out(4, Math.PI / 5, 'rad').sector).toBe(Number(((8 * Math.PI) / 5).toPrecision(12)));
    expect(r2(out(3.5, 117).sector!)).toBe(12.51);
  });
  it('Corral Ex 4.10: s = 6 cm, r = 9 cm (θ = 2/3) → 27 cm²', () =>
    expect(out(9, 2 / 3, 'rad').sector).toBe(27));
  it('Corral Ex 4.12: segment with r = 2, θ = 1.696 → 1.408', () =>
    expect(Math.round(out(2, 1.696, 'rad').segment! * 1000) / 1000).toBe(1.408));
});

describe('arc-sector: behaviour', () => {
  it('a full circle: arc 2πr, sector πr², segment πr², chord 0', () => {
    const o = out(1, 360);
    expect([o.arc, o.sector, o.fraction]).toEqual([
      Number((2 * Math.PI).toPrecision(12)),
      Number(Math.PI.toPrecision(12)),
      100,
    ]);
  });
  it('a 60° chord equals the radius', () => expect(out(5, 60).chord).toBe(5));
  it('angles beyond a full turn are rejected', () =>
    expect(solve(1, 400).warnings[0]?.key).toBe('warn.full'));
});

describe('arc-sector: properties', () => {
  it('sector = ½ r × arc, segment ≤ sector, degrees and radians agree', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (r, d) => {
          const o = out(r, d);
          const rad = out(r, (d * Math.PI) / 180, 'rad');
          return (
            Math.abs(o.sector! - 0.5 * r * o.arc!) <= 1e-9 * (o.sector! + 1e-12) &&
            o.segment! <= o.sector! * (1 + 1e-12) + 1e-12 &&
            Math.abs(rad.arc! - o.arc!) <= 1e-9 * (o.arc! + 1e-12)
          );
        },
      ),
    ));
});

describe('arc-sector: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(Number(e.inputs.radius), Number(e.inputs.angle), String(e.inputs.unit));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
