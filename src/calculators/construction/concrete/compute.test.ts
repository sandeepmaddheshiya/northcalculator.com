import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, count: 1, waste: 0, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
  }).outputs;
const slab = (
  length: number,
  width: number,
  thickness: number,
  extra: Record<string, unknown> = {},
) => run({ units: 'imperial', shape: 'slab', length, width, thickness, ...extra });

describe('concrete: references', () => {
  it('PennDOT LTAP #143: 125 ft × 4 ft × 0.29 ft = 145 ft³ = 5.37 yd³, ordered as 5.5', () => {
    const book = slab(125, 4, 0.29 * 12);
    expect(book.ft3).toBe(145);
    expect(Math.round((book.yd3 as number) * 100) / 100).toBe(5.37);
    expect(book.order).toBe(5.5);
  });
  it('PennDOT with the exact 3½ in: 145.83 ft³ = 5.40 yd³, still 5.5 to order', () => {
    const r = slab(125, 4, 3.5);
    expect([r.ft3, r.result, r.order]).toEqual([145.833333, 5.401235, 5.5]);
  });
  it('OpenStax Prealgebra 2e Ex 9.53: cylinder r = 3, h = 5 → 141.3 with π ≈ 3.14 (exact 141.37)', () => {
    // A 6 ft-diameter round pour 5 ft deep: diameter entered in inches.
    const ft3 = run({ units: 'imperial', shape: 'round', diameter: 72, depth: 5 }).ft3 as number;
    expect(ft3).toBe(141.371669);
    expect(Math.round((ft3 / Math.PI) * 3.14 * 10) / 10).toBe(141.3);
  });
  it('NIST SP 811: 1 yd³ = 0.764554857984 m³ (a 3 × 3 × 3 ft block)', () =>
    expect(slab(3, 3, 36).m3).toBe(0.764555));
});

describe('concrete: behaviour', () => {
  it('FAQ: 10 × 10 ft × 4 in = 1.23 yd³', () =>
    expect(Math.round((slab(10, 10, 4).result as number) * 100) / 100).toBe(1.23));
  it('metric: 4 × 3 m × 10 cm with 10% waste = 1.32 m³, order 1.4', () => {
    const r = run({
      units: 'metric',
      shape: 'slab',
      length: 4,
      width: 3,
      thickness: 10,
      waste: 10,
    });
    expect([r.result, r.order]).toEqual([1.32, 1.4]);
  });
  it('an exact quarter yard is not rounded up further', () =>
    expect(slab(27, 1, 3).order).toBe(0.25));
  it('count multiplies and zero dimensions are rejected', () => {
    expect(slab(10, 10, 4, { count: 3 }).ft3).toBe(100);
    const w = compute(
      { ...base, units: 'imperial', shape: 'slab', length: 0, width: 4, thickness: 4 } as never,
      {
        today: '2026-11-24',
        fmt: makeFmt('en'),
      },
    ).warnings;
    expect(w[0]?.key).toBe('warn.zero');
  });
});

describe('concrete: properties', () => {
  it('the order is never less than the volume and less than a quarter yard more', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 500, noNaN: true }),
        fc.double({ min: 0.1, max: 500, noNaN: true }),
        fc.double({ min: 0.5, max: 24, noNaN: true }),
        (l, w, t) => {
          const r = slab(l, w, t);
          const v = (l * w * (t / 12)) / 27;
          return (r.order as number) >= v - 1e-6 && (r.order as number) < v + 0.25 + 1e-6;
        },
      ),
    ));
  it('metric and imperial agree for the same slab (1 ft = 0.3048 m, 1 in = 2.54 cm)', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 100, noNaN: true }),
        fc.double({ min: 0.5, max: 100, noNaN: true }),
        fc.double({ min: 2, max: 60, noNaN: true }),
        (l, w, cm) => {
          const met = run({ units: 'metric', shape: 'slab', length: l, width: w, thickness: cm })
            .m3 as number;
          const imp = slab(l / 0.3048, w / 0.3048, cm / 2.54).m3 as number;
          return Math.abs(imp - met) <= 2e-6 + 1e-9 * met;
        },
      ),
    ));
});

describe('concrete: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(r[k]).toBe(v);
  });
});
