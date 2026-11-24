import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const PI_BOOK = 3.14 / Math.PI;

describe('area: references (OpenStax Prealgebra 2e §9.4–9.5)', () => {
  it('Ex 9.27: 32 × 20 = 640, P = 104', () => {
    const r = run({ shape: 'rectangle', a: 32, b: 20 });
    expect([r.outputs.area, r.outputs.perimeter]).toEqual([640, 104]);
  });
  it('Ex 9.33: triangle ½ × 11 × 8 = 44', () =>
    expect(run({ shape: 'triangle', a: 11, b: 8 }).outputs.area).toBe(44));
  it('Ex 9.38–9.40: trapezoids 75, 60 and 23.46', () => {
    expect(run({ shape: 'trapezoid', a: 6, b: 11, c: 14 }).outputs.area).toBe(75);
    expect(run({ shape: 'trapezoid', a: 5, b: 10.3, c: 13.7 }).outputs.area).toBe(60);
    expect(run({ shape: 'trapezoid', a: 3.4, b: 5.6, c: 8.2 }).outputs.area).toBe(23.46);
  });
  it('Ex 9.41: circle r = 2.5 → 19.625 with π ≈ 3.14 (19.635 exact)', () => {
    const a = run({ shape: 'circle', a: 2.5 }).outputs.area as number;
    expect(a).toBe(19.6349540849);
    expect(Math.round(a * PI_BOOK * 1e6) / 1e6).toBe(19.625);
  });
});

describe('area: behaviour', () => {
  it('parallelogram', () =>
    expect(run({ shape: 'parallelogram', a: 9, b: 4 }).outputs.area).toBe(36));
  it('FAQ values', () => {
    expect(run({ shape: 'rectangle', a: 4.5, b: 3.2 }).outputs.area).toBe(14.4);
    expect(run({ shape: 'triangle', a: 10, b: 7 }).outputs.area).toBe(35);
    expect(run({ shape: 'circle', a: 5 }).outputs.area).toBe(78.5398163397);
  });
  it('perimeter only where defined', () =>
    expect(run({ shape: 'triangle', a: 3, b: 4 }).outputs.perimeter).toBeNull());
  it('missing dimension gives no result', () =>
    expect(run({ shape: 'trapezoid', c: null }).outputs.area).toBeNull());
});

describe('area: properties', () => {
  it('a triangle is half the rectangle with the same base and height', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1e5 }),
        fc.integer({ min: 1, max: 1e5 }),
        (b, h) =>
          Math.abs(
            (run({ shape: 'triangle', a: b, b: h }).outputs.area as number) * 2 -
              (run({ shape: 'rectangle', a: b, b: h }).outputs.area as number),
          ) < 1e-6,
      ),
    ));
});

describe('area: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
