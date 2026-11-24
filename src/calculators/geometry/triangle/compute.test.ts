import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { compute, heron } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const solve = (a: number, b: number, c: number) =>
  compute({ ...base, a, b, c } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });
const out = (a: number, b: number, c: number) =>
  solve(a, b, c).outputs as Record<string, number | string>;
const r1 = (x: unknown) => Math.round((x as number) * 10) / 10;

describe('triangle: references', () => {
  it('OpenStax A&T 2e Ex 5: 10, 15, 7 → 29.4 (exact √864)', () => {
    expect(r1(out(10, 15, 7).area)).toBe(29.4);
    expect(out(10, 15, 7).area).toBe(Number(Math.sqrt(864).toPrecision(12)));
  });
  it('Ex 6: 62.4, 43.5, 34.1 m → 711.4 m²', () =>
    expect(r1(out(62.4, 43.5, 34.1).area)).toBe(711.4));
  it('Ex 2: 20, 25, 18 → α ≈ 52.4°', () => expect(r1(out(20, 25, 18).angleA)).toBe(52.4));
  it('Ex 3: 2420 ft opposite θ with 6000 and 5050 ft → θ ≈ 23.3°', () =>
    expect(r1(out(2420, 6000, 5050).angleA)).toBe(23.3));
  it('Corral Ex 2.15: 5, 4, 7 → 4√6 ≈ 9.8', () => {
    expect(out(5, 4, 7).area).toBe(Number((4 * Math.sqrt(6)).toPrecision(12)));
    expect(r1(out(5, 4, 7).area)).toBe(9.8);
  });
});

describe('triangle: behaviour', () => {
  it('3–4–5: area 6, angles 36.87°, 53.13°, 90°, scalene right', () => {
    const r = out(3, 4, 5);
    expect([r.area, r.perimeter, r.angleC]).toEqual([6, 12, 90]);
    expect([
      Number((r.angleA as number).toFixed(2)),
      Number((r.angleB as number).toFixed(2)),
    ]).toEqual([36.87, 53.13]);
    expect(r.kind).toBe('Scalene, right');
  });
  it('equilateral triangles have 60° angles; isosceles and obtuse are recognised', () => {
    expect([out(2, 2, 2).angleA, out(2, 2, 2).kind]).toEqual([60, 'Equilateral, acute']);
    expect(out(5, 5, 9).kind).toBe('Isosceles, obtuse');
  });
  it('impossible and degenerate sides are rejected', () => {
    expect(solve(2, 3, 6).warnings[0]?.key).toBe('warn.inequality');
    expect(solve(2, 3, 5).warnings[0]?.key).toBe('warn.inequality');
    expect(solve(0, 3, 3).warnings[0]?.key).toBe('warn.zero');
  });
  it('a thin triangle keeps its area: 10⁶, 10⁶, 1 has area ≈ 500,000 (½ × 1 × 10⁶)', () =>
    expect(Math.abs(heron(1e6, 1e6, 1) - 500000) / 500000).toBeLessThan(1e-9));
});

describe('triangle: properties', () => {
  it('angles sum to 180° and area matches ½ab·sin C', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 179, noNaN: true }),
        (a, b, gamma) => {
          const C = (gamma * Math.PI) / 180;
          const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
          fc.pre(c > 1e-3 * Math.max(a, b));
          const r = out(a, b, c);
          const want = 0.5 * a * b * Math.sin(C);
          return (
            Math.abs((r.angleA as number) + (r.angleB as number) + (r.angleC as number) - 180) <
              1e-9 &&
            Math.abs((r.area as number) - want) <= 1e-7 * want + 1e-9 &&
            Math.abs((r.angleC as number) - gamma) < 1e-5
          );
        },
      ),
    ));
});

describe('triangle: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = out(Number(e.inputs.a), Number(e.inputs.b), Number(e.inputs.c));
    for (const [k, v] of Object.entries(e.expect)) expect(r[k]).toBe(v);
  });
});
