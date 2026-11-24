import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const run = (
  thickness: number,
  width: number,
  length: number,
  extra: Record<string, unknown> = {},
) =>
  compute({ ...base, thickness, width, length, count: 1, price: 0, ...extra } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en', String(extra.cur ?? 'USD')),
  });
const bf = (t: number, w: number, l: number, extra: Record<string, unknown> = {}) =>
  run(t, w, l, extra).outputs.boardFeet as number;

describe('board-feet: references', () => {
  it('UW–Extension: 10 ft 2×6 = 10; 8 ft 1×8 = 5⅓; 36 × 60 in stack, 8 ft = 1,440; actual 1½ × 5½ × 10 = 6.875', () => {
    expect(bf(2, 6, 10)).toBe(10);
    expect(bf(1, 8, 8)).toBe(5.33333333333);
    expect(bf(36, 60, 8)).toBe(1440);
    expect(bf(1.5, 5.5, 10)).toBe(6.875);
  });
  it('Oregon State EC 1127: 2 × 8 × 24 = 32', () => expect(bf(2, 8, 24)).toBe(32));
  it('1 board foot = 144 in³ = 1/12 ft³ = 0.002359737216 m³ (1 in = 0.0254 m)', () => {
    const o = run(1, 12, 1).outputs;
    expect([o.boardFeet, o.cubicFeet, o.m3]).toEqual([1, 0.0833333333333, 0.002359737216]);
  });
});

describe('board-feet: behaviour', () => {
  it('count and price: six 8 ft 1×8s at $4.50 → 32 bd ft, $144.00', () => {
    const o = run(1, 8, 8, { count: 6, price: 4.5 }).outputs;
    expect([o.boardFeet, o.cost]).toEqual([32, 144]);
  });
  it('FAQ: 8 ft 2×4 ≈ 5.33; JPY cost rounds to whole yen', () => {
    expect(Number(bf(2, 4, 8).toFixed(2))).toBe(5.33);
    expect(run(2, 4, 8, { price: 333, cur: 'JPY' }).outputs.cost).toBe(1776);
  });
  it('zero dimensions are rejected; no price, no cost', () => {
    expect(run(0, 4, 8).warnings[0]?.key).toBe('warn.zero');
    expect(run(2, 4, 8).outputs.cost).toBeNull();
  });
});

describe('board-feet: properties', () => {
  it('scales linearly with each dimension and the count', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.25, max: 24, noNaN: true }),
        fc.double({ min: 0.5, max: 48, noNaN: true }),
        fc.double({ min: 0.5, max: 40, noNaN: true }),
        fc.integer({ min: 1, max: 500 }),
        (t, w, l, n) => {
          const one = bf(t, w, l);
          return (
            Math.abs(bf(t, w, l, { count: n }) - n * one) <= 1e-9 * n * one &&
            Math.abs(bf(2 * t, w, l) - 2 * one) <= 1e-9 * one
          );
        },
      ),
    ));
});

describe('board-feet: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = run(i.thickness!, i.width!, i.length!, e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
