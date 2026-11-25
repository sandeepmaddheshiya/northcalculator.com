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
const r2 = (x: number) => Math.round(x * 100) / 100;

describe('surface-area: references (OpenStax Prealgebra 2e §9.6, π ≈ 3.14)', () => {
  it('Ex 9.47: 14 × 9 × 17 → 1,034; Ex 9.48: 30 × 25 × 20 → 3,700', () => {
    expect(out({ shape: 'box', length: 14, width: 9, height: 17 }).total).toBe(1034);
    expect(out({ shape: 'box', length: 30, width: 25, height: 20 }).total).toBe(3700);
  });
  it('Ex 9.49: cube 2.5 → 37.5; Ex 9.50: cube 2 → 24', () => {
    expect(out({ shape: 'cube', side: 2.5 }).total).toBe(37.5);
    expect(out({ shape: 'cube', side: 2 }).total).toBe(24);
  });
  it('Ex 9.51: sphere r = 6 → 452.16 with 3.14 (exact 452.39); Ex 9.52: r = 14 → 2,461.76', () => {
    const r = solve({ shape: 'sphere', radius: 6 });
    expect(r2(r.outputs.total as number)).toBe(452.39);
    expect(r.warnings[0]?.values?.a).toBe('452.16');
    expect(solve({ shape: 'sphere', radius: 14 }).warnings[0]?.values?.a).toBe('2,461.76');
  });
  it('Ex 9.53: cylinder r = 3, h = 5 → 150.72 with 3.14; Ex 9.54: r = 4, h = 13 → 427.04', () => {
    expect(solve({ shape: 'cylinder', radius: 3, height: 5 }).warnings[0]?.values?.a).toBe(
      '150.72',
    );
    expect(solve({ shape: 'cylinder', radius: 4, height: 13 }).warnings[0]?.values?.a).toBe(
      '427.04',
    );
  });
});

describe('surface-area: references (OpenStax Contemporary Mathematics §10.7)', () => {
  it('Ex 10.56: 10 × 5 × 3 cm → 190 cm²', () =>
    expect(out({ shape: 'box', length: 5, width: 10, height: 3 }).total).toBe(190));
  it('Ex 10.60: cylinder r = 5, h = 12 → 534 in² (exact 170π ≈ 534.07)', () =>
    expect(Math.round(out({ shape: 'cylinder', radius: 5, height: 12 }).total!)).toBe(534));
});

describe('surface-area: behaviour', () => {
  it('lateral and base areas; FAQ sphere r = 10 → 1,256.6', () => {
    const b = out({ shape: 'box', length: 14, width: 9, height: 17 });
    expect([b.lateral, b.base, b.volume]).toEqual([782, 126, 2142]);
    expect(Math.round(out({ shape: 'sphere', radius: 10 }).total! * 10) / 10).toBe(1256.6);
  });
});

describe('surface-area: properties', () => {
  it('scaling every length by k scales the area by k²', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 0.5, max: 10, noNaN: true }),
        (r, h, k) => {
          const a = out({ shape: 'cylinder', radius: r, height: h }).total!;
          const b = out({ shape: 'cylinder', radius: k * r, height: k * h }).total!;
          return Math.abs(b - k * k * a) <= 1e-9 * b;
        },
      ),
    ));
});

describe('surface-area: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
