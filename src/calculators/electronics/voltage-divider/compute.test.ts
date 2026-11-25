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

describe('voltage-divider: references', () => {
  it('College Physics 2e Ex 21.1: 12.0 V on 1 + 6 + 13 Ω → 0.600 A; 7.80 V across 13 Ω, 4.68 W', () => {
    const o = out({ find: 'vout', vin: 12, r1: 7, r2: 13 });
    expect([o.result, o.current, o.p2]).toEqual([7.8, 0.6, 4.68]);
  });
  it('Ex 21.1: V₁ = 0.600 V across 1 Ω; V₂ + V₃ = 11.4 V', () => {
    expect(out({ find: 'vout', vin: 12, r1: 19, r2: 1 }).result).toBe(0.6);
    expect(out({ find: 'vout', vin: 12, r1: 1, r2: 19 }).result).toBe(11.4);
  });
  it('University Physics Ex 10.2: 9 V on 4 × 20 Ω + 10 Ω → 1 V across 10 Ω, 0.1 A', () => {
    const o = out({ find: 'vout', vin: 9, r1: 80, r2: 10 });
    expect([o.result, o.current]).toEqual([1, 0.1]);
  });
});

describe('voltage-divider: behaviour', () => {
  it('FAQ: 10 V, 3 kΩ and 2 kΩ → 4 V; 3.3 V from 5 V with 10 kΩ → 19.4 kΩ', () => {
    expect(out({ find: 'vout', vin: 10, r1: 3000, r2: 2000 }).result).toBe(4);
    expect(Math.round(out({ find: 'r2', vin: 5, r1: 10000, vout: 3.3 }).result! / 100) / 10).toBe(
      19.4,
    );
  });
  it('targets outside 0…Vin are rejected', () => {
    expect(solve({ find: 'r2', vin: 5, r1: 1000, vout: 6 }).warnings[0]?.key).toBe('warn.vout');
    expect(solve({ find: 'r2', vin: 5, r1: 1000, vout: 5 }).warnings[0]?.key).toBe('warn.vout');
  });
});

describe('voltage-divider: properties', () => {
  it('V1 + Vout = Vin, and solving for R2 round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 1e6, noNaN: true }),
        fc.double({ min: 1, max: 1e6, noNaN: true }),
        (vin, r1, r2) => {
          fc.pre(r2 / r1 < 1e4 && r1 / r2 < 1e4); // solving back for R2 amplifies rounding by R2 ÷ R1
          const o = out({ find: 'vout', vin, r1, r2 });
          const back = out({ find: 'r2', vin, r1, vout: o.result! }).result!;
          return (
            Math.abs(o.v1! + o.result! - vin) <= 1e-9 * vin && Math.abs(back - r2) <= 1e-6 * r2
          );
        },
      ),
    ));
});

describe('voltage-divider: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
