import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const book = (x: number) => Math.round(x * (3.14 / Math.PI) * 100) / 100;

describe('volume: references (OpenStax Prealgebra 2e §9.6)', () => {
  it('Ex 9.47: box 14 × 9 × 17 → V 2,142, S 1,034; Ex 9.48: 30 × 25 × 20 → 15,000, 3,700', () => {
    expect([
      run({ shape: 'box', a: 14, b: 9, c: 17 }).outputs.volume,
      run({ shape: 'box', a: 14, b: 9, c: 17 }).outputs.surface,
    ]).toEqual([2142, 1034]);
    expect([
      run({ shape: 'box', a: 30, b: 25, c: 20 }).outputs.volume,
      run({ shape: 'box', a: 30, b: 25, c: 20 }).outputs.surface,
    ]).toEqual([15000, 3700]);
  });
  it('Ex 9.49: cube 2.5 → 15.625, 37.5', () => {
    const r = run({ shape: 'cube', a: 2.5 }).outputs;
    expect([r.volume, r.surface]).toEqual([15.625, 37.5]);
  });
  it('Ex 9.51: sphere r = 6 → 904.32 and 452.16 with π ≈ 3.14', () => {
    const r = run({ shape: 'sphere', a: 6 }).outputs;
    expect([book(r.volume as number), book(r.surface as number)]).toEqual([904.32, 452.16]);
  });
  it('Ex 9.53–9.54: cylinders 141.3 / 150.72 and 653.12 / 427.04 with π ≈ 3.14', () => {
    const a = run({ shape: 'cylinder', a: 3, b: 5 }).outputs;
    const b = run({ shape: 'cylinder', a: 4, b: 13 }).outputs;
    expect([
      book(a.volume as number),
      book(a.surface as number),
      book(b.volume as number),
      book(b.surface as number),
    ]).toEqual([141.3, 150.72, 653.12, 427.04]);
  });
  it('Ex 9.55: cone r = 2, h = 6 → 25.12 with π ≈ 3.14', () =>
    expect(book(run({ shape: 'cone', a: 2, b: 6 }).outputs.volume as number)).toBe(25.12));
});

describe('volume: behaviour', () => {
  it('FAQ: tank r 0.5, h 2 → 1.5708 m³; box 40 × 30 × 25 = 30,000', () => {
    expect(run({ shape: 'cylinder', a: 0.5, b: 2 }).outputs.volume).toBe(1.57079632679);
    expect(run({ shape: 'box', a: 40, b: 30, c: 25 }).outputs.volume).toBe(30000);
  });
  it('cone surface includes the slant height', () =>
    expect(run({ shape: 'cone', a: 3, b: 4 }).outputs.surface).toBe(75.3982236862));
});

describe('volume: properties', () => {
  it('a cone holds one third of the matching cylinder', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (r, h) =>
          Math.abs(
            (run({ shape: 'cone', a: r, b: h }).outputs.volume as number) * 3 -
              (run({ shape: 'cylinder', a: r, b: h }).outputs.volume as number),
          ) <=
          1e-9 * r * r * h * 10,
      ),
    ));
});

describe('volume: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
